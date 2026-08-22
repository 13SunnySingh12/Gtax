"""All AI-service DTOs in one module (small surface, easy to scan)."""
from __future__ import annotations

from pydantic import Field

from app.schemas import CamelModel


# ----------------------------- OCR -----------------------------
class OcrRequest(CamelModel):
    file_url: str
    content_type: str | None = None
    # Optional base64 of the file. When Spring Boot sends it we skip downloading
    # the image back from Storage, which removes a full network round trip.
    file_base64: str | None = None


class OcrResponse(CamelModel):
    amount: float | None = None
    date: str | None = None            # ISO yyyy-MM-dd
    vendor: str | None = None
    raw_text: str | None = None
    status: str = "done"               # "done" | "failed"


# ------------------------- Categorization -------------------------
class CategorizeRequest(CamelModel):
    text: str | None = None
    vendor: str | None = None
    amount: float | None = None


class CategorizeResponse(CamelModel):
    category: str
    is_deductible: bool = False
    reason: str | None = None


# --------------------------- Deductions ---------------------------
class DeductionRequest(CamelModel):
    vendor: str | None = None
    amount: float | None = None
    category: str | None = None
    description: str | None = None


class DeductionResponse(CamelModel):
    suggested_category: str | None = None
    deduction_amount: float | None = None
    likelihood: str | None = None
    reason: str | None = None
    sources: list[str] = Field(default_factory=list)


# ------------------------------ Chat ------------------------------
class ChatRequest(CamelModel):
    question: str


class ChatResponse(CamelModel):
    answer: str
    sources: list[str] = Field(default_factory=list)


# --------------------------- Embeddings ---------------------------
class EmbeddingsGenerateRequest(CamelModel):
    # When true, (re)load the curated corpus from AI/data/tax_rules.json.
    reload_corpus: bool = True


class EmbeddingsGenerateResponse(CamelModel):
    embedded: int
    dim: int
    provider: str
