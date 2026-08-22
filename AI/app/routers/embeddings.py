import json
import logging
from pathlib import Path

from fastapi import APIRouter, Depends

from app.core import db
from app.core.security import require_internal_key
from app.schemas.models import EmbeddingsGenerateRequest, EmbeddingsGenerateResponse
from app.services.embedding_service import EmbeddingService

router = APIRouter(prefix="/ai/embeddings", tags=["embeddings"])
logger = logging.getLogger(__name__)

_CORPUS_PATH = Path(__file__).resolve().parents[2] / "data" / "tax_rules.json"
_embedder = EmbeddingService()


@router.post("/generate", response_model=EmbeddingsGenerateResponse)
def generate(req: EmbeddingsGenerateRequest, _=Depends(require_internal_key)) -> EmbeddingsGenerateResponse:
    """Setup/admin: embed the curated tax-rule corpus into pgvector (TRD §7 setup).
    Idempotent — inserts missing rows, then (re)writes each embedding by title."""
    corpus = json.loads(_CORPUS_PATH.read_text(encoding="utf-8"))
    embedded = 0
    for doc in corpus:
        vec = _embedder.embed(doc["content"])
        # Ensure the row exists (SQL seed may already have inserted the text).
        db.insert_document(doc["title"], doc["content"], doc.get("source", ""), vec)
        if db.upsert_document_embedding(doc["title"], vec):
            embedded += 1
    return EmbeddingsGenerateResponse(
        embedded=embedded, dim=_embedder.dim, provider=_embedder.provider
    )
