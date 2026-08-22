"""Thin pgvector access layer. Only the AI service touches tax-rule/embedding
data directly (TRD §3); core business tables are owned by Spring Boot."""
from __future__ import annotations

import logging
from typing import Any

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _connect():
    """Open a psycopg connection. Imported lazily so the service can boot (and be
    tested) without a database or the driver installed."""
    import psycopg  # local import: optional at import time

    settings = get_settings()
    if not settings.supabase_db_dsn:
        raise RuntimeError("SUPABASE_DB_DSN is not configured")
    return psycopg.connect(settings.supabase_db_dsn, autocommit=True)


def _vector_literal(embedding: list[float]) -> str:
    return "[" + ",".join(f"{x:.8f}" for x in embedding) + "]"


def match_tax_rule_documents(embedding: list[float], k: int = 4) -> list[dict[str, Any]]:
    """Cosine-similarity search over tax_rule_documents via the SQL RPC.
    Returns [] on any failure so the RAG layer can degrade gracefully."""
    try:
        with _connect() as conn, conn.cursor() as cur:
            cur.execute(
                "select id, title, content, source, similarity "
                "from public.match_tax_rule_documents(%s::vector, %s)",
                (_vector_literal(embedding), k),
            )
            rows = cur.fetchall()
            return [
                {
                    "id": str(r[0]),
                    "title": r[1],
                    "content": r[2],
                    "source": r[3],
                    "similarity": float(r[4]) if r[4] is not None else None,
                }
                for r in rows
            ]
    except Exception as exc:  # noqa: BLE001 - degrade gracefully
        logger.warning("pgvector similarity search failed: %s", exc)
        return []


def upsert_document_embedding(title: str, embedding: list[float]) -> bool:
    """Store an embedding for an already-seeded rule document (setup step)."""
    try:
        with _connect() as conn, conn.cursor() as cur:
            cur.execute(
                "update public.tax_rule_documents set embedding = %s::vector where title = %s",
                (_vector_literal(embedding), title),
            )
            return cur.rowcount > 0
    except Exception as exc:  # noqa: BLE001
        logger.warning("embedding upsert failed for %r: %s", title, exc)
        return False


def insert_document(title: str, content: str, source: str, embedding: list[float]) -> bool:
    """Insert a rule document with its embedding (used by the loader when a row
    does not already exist from the SQL seed)."""
    try:
        with _connect() as conn, conn.cursor() as cur:
            cur.execute(
                "insert into public.tax_rule_documents (title, content, source, embedding) "
                "values (%s, %s, %s, %s::vector) on conflict (title) do nothing",
                (title, content, source, _vector_literal(embedding)),
            )
            return True
    except Exception as exc:  # noqa: BLE001
        logger.warning("document insert failed for %r: %s", title, exc)
        return False
