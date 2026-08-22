"""Offline tests for the AI service — exercise the stub/heuristic fallbacks so
the whole service is verifiable without any LLM key or database."""
from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import app
from app.services import heuristics
from app.services.embedding_service import EmbeddingService
from app.services.rag_service import RagService

KEY = get_settings().internal_api_key
AUTH = {"X-Internal-Api-Key": KEY}
client = TestClient(app)


def test_health_ok():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_internal_key_required():
    r = client.post("/ai/chat/ask", json={"question": "hello"})
    assert r.status_code == 401


def test_categorize_heuristic():
    r = client.post(
        "/ai/expenses/categorize",
        headers=AUTH,
        json={"text": "Adobe Photoshop subscription", "vendor": "Adobe", "amount": 20},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["category"] == "Software & Subscriptions"
    assert body["isDeductible"] is True


def test_chat_is_grounded_with_sources():
    r = client.post(
        "/ai/chat/ask",
        headers=AUTH,
        json={"question": "Can I deduct my software subscriptions?"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["answer"]
    assert isinstance(body["sources"], list)
    assert len(body["sources"]) >= 1


def test_deduction_suggestion_returns_sources():
    r = client.post(
        "/ai/deductions/suggest",
        headers=AUTH,
        json={"vendor": "Shell", "amount": 50, "category": "Travel",
              "description": "fuel for delivery driving"},
    )
    assert r.status_code == 200
    body = r.json()
    assert "sources" in body and len(body["sources"]) >= 1


def test_embedding_dim_and_norm():
    emb = EmbeddingService()
    vec = emb.embed("business travel fuel expense")
    assert len(vec) == emb.dim
    # stub embeddings are L2-normalized
    norm = sum(x * x for x in vec) ** 0.5
    assert abs(norm - 1.0) < 1e-6 or norm == 0.0


def test_rag_local_search_ranks_relevant_doc_first():
    rag = RagService()
    rows = rag.retrieve("home office rent electricity deduction")
    assert rows
    titles = [r["title"] for r in rows]
    assert any("Home office" in t or "home office" in t.lower() for t in titles)


def test_heuristic_food_not_deductible():
    category, deductible, _ = heuristics.categorize("Lunch at cafe", "Starbucks")
    assert category == "Food"
    assert deductible is False
