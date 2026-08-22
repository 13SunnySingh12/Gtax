"""Retrieval layer for deductions + chatbot (TRD §7). Embeds the query, runs a
pgvector similarity search, and returns the top-K rule chunks. If the database
is unreachable it falls back to an in-memory search over the bundled corpus
(AI/data/tax_rules.json) so RAG still works in local/offline runs."""
from __future__ import annotations

import json
import logging
from functools import lru_cache
from pathlib import Path

from app.core import db
from app.core.config import get_settings
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)

_CORPUS_PATH = Path(__file__).resolve().parents[2] / "data" / "tax_rules.json"


@lru_cache
def _local_corpus() -> list[dict]:
    try:
        return json.loads(_CORPUS_PATH.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not load local corpus: %s", exc)
        return []


class RagService:
    def __init__(self, embedder: EmbeddingService | None = None) -> None:
        self.embedder = embedder or EmbeddingService()
        self.k = 4

    def retrieve(self, query: str, k: int | None = None) -> list[dict]:
        k = k or self.k
        embedding = self.embedder.embed(query)

        settings = get_settings()
        if settings.supabase_db_dsn:
            rows = db.match_tax_rule_documents(embedding, k)
            if rows:
                return rows
            logger.info("pgvector returned no rows; using local corpus fallback")

        return self._local_search(query, embedding, k)

    def _local_search(self, query: str, query_vec: list[float], k: int) -> list[dict]:
        corpus = _local_corpus()
        scored = []
        for doc in corpus:
            doc_vec = self.embedder.embed(doc["content"])
            score = _cosine(query_vec, doc_vec)
            scored.append({**doc, "similarity": score})
        scored.sort(key=lambda d: d["similarity"], reverse=True)
        return scored[:k]

    @staticmethod
    def build_context(rows: list[dict]) -> str:
        blocks = []
        for r in rows:
            blocks.append(f"[{r.get('title', 'Rule')}]\n{r.get('content', '')}")
        return "\n\n".join(blocks)

    @staticmethod
    def source_titles(rows: list[dict]) -> list[str]:
        titles: list[str] = []
        for r in rows:
            t = r.get("title")
            if t and t not in titles:
                titles.append(t)
        return titles


def _cosine(a: list[float], b: list[float]) -> float:
    n = min(len(a), len(b))
    dot = sum(a[i] * b[i] for i in range(n))
    na = sum(x * x for x in a) ** 0.5
    nb = sum(x * x for x in b) ** 0.5
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)
