"""Receipt OCR (TRD §8). Downloads the file from its (signed) Supabase Storage
URL and reads amount/date/vendor using a vision-capable LLM. If no vision model
is configured or extraction fails, returns status='failed' with empty fields so
the frontend cleanly falls back to manual entry."""
from __future__ import annotations

import base64
import logging
import re
from datetime import datetime

import httpx

from app.schemas.models import OcrResponse
from app.services.llm_client import LLMClient, _extract_json

logger = logging.getLogger(__name__)

_VISION_INSTRUCTION = (
    "You are reading a purchase receipt image. Extract the fields and respond "
    "with strict JSON only:\n"
    '{"amount": <total amount as a number or null>, '
    '"date": "<purchase date as YYYY-MM-DD or null>", '
    '"vendor": "<store/vendor name or null>", '
    '"rawText": "<the key receipt lines, 200 characters or fewer>"}'
)

_AMOUNT_RE = re.compile(r"(?:total|amount|grand total)\s*[:\-]?\s*[₹$€£]?\s*([0-9][0-9,]*\.?[0-9]{0,2})", re.I)
_DATE_RES = [
    re.compile(r"(\d{4})[-/](\d{1,2})[-/](\d{1,2})"),      # 2025-03-14
    re.compile(r"(\d{1,2})[-/](\d{1,2})[-/](\d{4})"),      # 14/03/2025
]


class OcrService:
    def __init__(self, client: LLMClient | None = None) -> None:
        self.client = client or LLMClient()

    def extract(self, file_url: str, content_type: str | None,
                file_base64: str | None = None) -> OcrResponse:
        image_bytes = self._decode(file_base64) or self._download(file_url)
        if image_bytes is None:
            return OcrResponse(status="failed")

        if not self.client.available:
            logger.info("No vision LLM configured; OCR returns failed for manual entry")
            return OcrResponse(status="failed")

        try:
            raw = self.client.vision_ocr(image_bytes, content_type or "image/jpeg", _VISION_INSTRUCTION)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Vision OCR call failed: %s", exc)
            return OcrResponse(status="failed")

        if not raw:
            return OcrResponse(status="failed")

        parsed = _extract_json(raw)
        if parsed:
            return OcrResponse(
                amount=_to_float(parsed.get("amount")),
                date=_to_iso_date(parsed.get("date")),
                vendor=_clean(parsed.get("vendor")),
                raw_text=_clean(parsed.get("rawText")) or raw,
                status="done",
            )
        # JSON was unparseable (e.g. truncated) - salvage the fields we can.
        return OcrResponse(
            amount=_json_number(raw, "amount") or _amount_from_text(raw),
            date=_to_iso_date(_json_string(raw, "date")) or _date_from_text(raw),
            vendor=_json_string(raw, "vendor"),
            raw_text=raw,
            status="done",
        )

    @staticmethod
    def _decode(file_base64: str | None) -> bytes | None:
        """Use the bytes Spring Boot already had, avoiding a re-download."""
        if not file_base64:
            return None
        try:
            return base64.b64decode(file_base64)
        except Exception as exc:  # noqa: BLE001 - fall back to downloading
            logger.warning("Inline receipt bytes were unreadable: %s", exc)
            return None

    def _download(self, url: str) -> bytes | None:
        try:
            resp = httpx.get(url, timeout=30.0, follow_redirects=True)
            resp.raise_for_status()
            return resp.content
        except Exception as exc:  # noqa: BLE001
            logger.warning("Could not download receipt %s: %s", url, exc)
            return None


def _to_float(value) -> float | None:
    if value is None:
        return None
    try:
        return float(str(value).replace(",", "").replace("₹", "").replace("$", "").strip())
    except (ValueError, TypeError):
        return None


def _clean(value) -> str | None:
    if value is None:
        return None
    s = str(value).strip()
    return s or None


def _to_iso_date(value) -> str | None:
    if not value:
        return None
    s = str(value).strip()
    try:
        return datetime.strptime(s, "%Y-%m-%d").strftime("%Y-%m-%d")
    except ValueError:
        return _date_from_text(s)


_JSON_NUM_RE = r'"%s"\s*:\s*([0-9][0-9,.]*)'
_JSON_STR_RE = r'"%s"\s*:\s*"([^"]*)"'


def _json_number(text: str, key: str) -> float | None:
    """Read a numeric field out of a partially-written JSON blob."""
    m = re.search(_JSON_NUM_RE % key, text or "")
    return _to_float(m.group(1)) if m else None


def _json_string(text: str, key: str) -> str | None:
    """Read a string field out of a partially-written JSON blob."""
    m = re.search(_JSON_STR_RE % key, text or "")
    return _clean(m.group(1)) if m else None


def _amount_from_text(text: str) -> float | None:
    matches = _AMOUNT_RE.findall(text or "")
    return _to_float(matches[-1]) if matches else None


def _date_from_text(text: str) -> str | None:
    for rgx in _DATE_RES:
        m = rgx.search(text or "")
        if not m:
            continue
        g = m.groups()
        try:
            if len(g[0]) == 4:  # yyyy first
                return datetime(int(g[0]), int(g[1]), int(g[2])).strftime("%Y-%m-%d")
            return datetime(int(g[2]), int(g[1]), int(g[0])).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None
