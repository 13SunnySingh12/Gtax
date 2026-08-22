"""G-TAX AI microservice entry point (FastAPI).

Internal-only service called by Spring Boot with a shared API key (TRD §3/§10).
Exposes OCR, categorization, RAG deductions, RAG chat, and an embeddings setup
endpoint. Runs offline (deterministic fallbacks) when no LLM key is configured.
"""
from __future__ import annotations

import logging

from fastapi import FastAPI

from app.core.config import get_settings
from app.routers import categorize, chat, deductions, embeddings, ocr

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="G-TAX AI Service",
    version="1.0.0",
    description="OCR, expense categorization, and RAG-based deductions/chat for G-TAX.",
)

app.include_router(ocr.router)
app.include_router(categorize.router)
app.include_router(deductions.router)
app.include_router(chat.router)
app.include_router(embeddings.router)


@app.get("/health", tags=["health"])
def health() -> dict:
    settings = get_settings()
    return {
        "status": "ok",
        "provider": settings.effective_provider,
        "embeddingDim": settings.embedding_dim,
    }
