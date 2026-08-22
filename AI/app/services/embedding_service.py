"""Embedding generation for the RAG corpus and queries (TRD §7).

Uses Gemini's embedding endpoint when a key is configured; otherwise a
deterministic, normalized hash-based embedding so similarity search still works
offline. Docs and queries always go through the SAME path, so a stub-embedded
corpus is searchable by stub-embedded queries — consistent end to end."""
from __future__ import annotations

import hashlib
import logging
import math

import httpx

from app.core.config import Settings, get_settings

logger = logging.getLogger(__name__)

_GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"


class EmbeddingService:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self.dim = self.settings.embedding_dim
        self.provider = self.settings.effective_provider

    def embed(self, text: str) -> list[float]:
        text = (text or "").strip()
        if self.provider == "gemini":
            try:
                return self._gemini_embed(text)
            except Exception as exc:  # noqa: BLE001 - fall back rather than fail
                logger.warning("Gemini embedding failed, using stub: %s", exc)
        return self._stub_embed(text)

    def embed_many(self, texts: list[str]) -> list[list[float]]:
        return [self.embed(t) for t in texts]

    # --------------------------------------------------------- Gemini
    def _gemini_embed(self, text: str) -> list[float]:
        model = self.settings.embedding_model
        url = f"{_GEMINI_BASE}/models/{model}:embedContent"
        body = {
            "model": f"models/{model}",
            "content": {"parts": [{"text": text}]},
            # gemini-embedding-001 is 3072-dim natively; request a truncated size
            # (Matryoshka) so it fits the vector(EMBEDDING_DIM) column + ivfflat.
            "outputDimensionality": self.dim,
        }
        resp = httpx.post(
            url, params={"key": self.settings.gemini_api_key}, json=body, timeout=30.0
        )
        resp.raise_for_status()
        values = resp.json()["embedding"]["values"]
        return _fit_dim([float(v) for v in values], self.dim)

    # ----------------------------------------------------------- stub
    def _stub_embed(self, text: str) -> list[float]:
        """Deterministic pseudo-embedding: hash tokens into buckets, then L2-normalize.
        Not semantically strong, but stable and good enough for offline demos."""
        vec = [0.0] * self.dim
        tokens = [t for t in _normalize(text).split() if t]
        for tok in tokens:
            h = int(hashlib.sha256(tok.encode("utf-8")).hexdigest(), 16)
            idx = h % self.dim
            sign = 1.0 if (h >> 8) & 1 else -1.0
            vec[idx] += sign
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec


def _normalize(text: str) -> str:
    return "".join(c.lower() if c.isalnum() else " " for c in text)


def _fit_dim(vec: list[float], dim: int) -> list[float]:
    if len(vec) == dim:
        return vec
    if len(vec) > dim:
        return vec[:dim]
    return vec + [0.0] * (dim - len(vec))
