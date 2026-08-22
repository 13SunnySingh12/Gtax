"""LLM abstraction over Gemini and Groq (TRD §3/§7). Uses plain HTTP via httpx
so no heavy vendor SDKs are required. When no API key is configured the client
reports itself unavailable and callers fall back to deterministic heuristics —
so the whole stack runs offline for dev, CI, and tests."""
from __future__ import annotations

import base64
import json
import logging
import time
from typing import Any

import httpx

from app.core.config import Settings, get_settings

logger = logging.getLogger(__name__)

_GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"
_GROQ_BASE = "https://api.groq.com/openai/v1"
# Providers occasionally return 429/503 under load; a couple of short retries
# recovers real answers instead of dropping straight to the fallback path.
# Fail fast: a slow model must not keep the user waiting - the app falls back
# to manual entry, so a short budget beats a long hang.
_TEXT_TIMEOUT = 20.0
_VISION_TIMEOUT = 40.0
_RETRY_STATUSES = {429, 503}
_MAX_RETRIES = 2


def _post_retry(url: str, *, params=None, headers=None, json=None, timeout=20.0):
    resp = None
    for attempt in range(_MAX_RETRIES + 1):
        resp = httpx.post(url, params=params, headers=headers, json=json, timeout=timeout)
        if resp.status_code in _RETRY_STATUSES and attempt < _MAX_RETRIES:
            time.sleep(0.8 * (attempt + 1))
            continue
        break
    return resp


class LLMClient:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self.provider = self.settings.effective_provider

    @property
    def available(self) -> bool:
        """True when a real LLM is configured (not the offline stub)."""
        return self.provider in ("gemini", "groq")

    # ------------------------------------------------------------ text
    def generate(self, system: str, user: str, json_mode: bool = False) -> str:
        if self.provider == "gemini":
            return self._gemini_generate(system, user, json_mode)
        if self.provider == "groq":
            return self._groq_generate(system, user, json_mode)
        raise RuntimeError("No LLM provider configured")

    def generate_json(self, system: str, user: str) -> dict[str, Any]:
        raw = self.generate(system, user, json_mode=True)
        return _extract_json(raw)

    # ---------------------------------------------------------- vision
    def vision_ocr(self, image_bytes: bytes, content_type: str, instruction: str) -> str | None:
        """Return raw text read from a receipt image, or None if unsupported."""
        if self.provider == "gemini":
            return self._gemini_vision(image_bytes, content_type, instruction)
        # Groq's default text models are not vision-capable; signal no OCR.
        return None

    # --------------------------------------------------------- Gemini
    def _gemini_generate(self, system: str, user: str, json_mode: bool) -> str:
        url = f"{_GEMINI_BASE}/models/{self.settings.gemini_model}:generateContent"
        body: dict[str, Any] = {
            "contents": [{"role": "user", "parts": [{"text": f"{system}\n\n{user}"}]}],
        }
        if json_mode:
            body["generationConfig"] = {"response_mime_type": "application/json"}
        resp = _post_retry(
            url, params={"key": self.settings.gemini_api_key}, json=body, timeout=_TEXT_TIMEOUT
        )
        resp.raise_for_status()
        return _gemini_text(resp.json())

    def _gemini_vision(self, image_bytes: bytes, content_type: str, instruction: str) -> str:
        url = f"{_GEMINI_BASE}/models/{self.settings.gemini_model}:generateContent"
        b64 = base64.b64encode(image_bytes).decode("ascii")
        body = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"text": instruction},
                        {"inline_data": {"mime_type": content_type or "image/jpeg", "data": b64}},
                    ],
                }
            ],
            # Ask for JSON directly (no code fence to unwrap), be deterministic,
            # and cap generation - transcribing a whole receipt is what made this
            # call slow enough to hit the timeout.
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0,
                "maxOutputTokens": 1024,
            },
        }
        resp = _post_retry(
            url, params={"key": self.settings.gemini_api_key}, json=body, timeout=_VISION_TIMEOUT
        )
        resp.raise_for_status()
        return _gemini_text(resp.json())

    # ----------------------------------------------------------- Groq
    def _groq_generate(self, system: str, user: str, json_mode: bool) -> str:
        url = f"{_GROQ_BASE}/chat/completions"
        body: dict[str, Any] = {
            "model": self.settings.groq_model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "temperature": 0.2,
        }
        if json_mode:
            body["response_format"] = {"type": "json_object"}
        resp = _post_retry(
            url,
            headers={"Authorization": f"Bearer {self.settings.groq_api_key}"},
            json=body,
            timeout=_TEXT_TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


def _gemini_text(payload: dict[str, Any]) -> str:
    try:
        return payload["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError) as exc:  # pragma: no cover - defensive
        logger.warning("Unexpected Gemini payload shape: %s", exc)
        return ""


def _extract_json(raw: str) -> dict[str, Any]:
    """Parse a JSON object from an LLM response, tolerating code fences / prose."""
    if not raw:
        return {}
    text = raw.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start : end + 1]
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        logger.warning("Could not parse JSON from LLM response")
        return {}
