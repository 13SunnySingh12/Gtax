"""One-time setup: embed the curated tax-rule corpus into pgvector (TRD §7).

Run from the AI/ directory with the root venv active and SUPABASE_DB_DSN set:

    python -m app.scripts.load_embeddings
"""
from __future__ import annotations

import json
import logging
from pathlib import Path

from app.core import db
from app.services.embedding_service import EmbeddingService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("load_embeddings")

CORPUS_PATH = Path(__file__).resolve().parents[2] / "data" / "tax_rules.json"


def main() -> None:
    corpus = json.loads(CORPUS_PATH.read_text(encoding="utf-8"))
    embedder = EmbeddingService()
    logger.info("Embedding %d documents with provider=%s (dim=%d)",
                len(corpus), embedder.provider, embedder.dim)

    embedded = 0
    for doc in corpus:
        vec = embedder.embed(doc["content"])
        db.insert_document(doc["title"], doc["content"], doc.get("source", ""), vec)
        if db.upsert_document_embedding(doc["title"], vec):
            embedded += 1
            logger.info("  embedded: %s", doc["title"])
    logger.info("Done. %d/%d documents embedded.", embedded, len(corpus))


if __name__ == "__main__":
    main()
