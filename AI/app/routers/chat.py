import logging

from fastapi import APIRouter, Depends

from app.core.security import require_internal_key
from app.prompts.templates import CHAT_SYSTEM, CHAT_USER_TEMPLATE
from app.schemas.models import ChatRequest, ChatResponse
from app.services.llm_client import LLMClient
from app.services.rag_service import RagService

router = APIRouter(prefix="/ai/chat", tags=["chat"])
logger = logging.getLogger(__name__)
_client = LLMClient()
_rag = RagService()


@router.post("/ask", response_model=ChatResponse)
def ask(req: ChatRequest, _=Depends(require_internal_key)) -> ChatResponse:
    """RAG-grounded answer to a basic tax question (TRD §7, PRD §5.10)."""
    rows = _rag.retrieve(req.question)
    context = _rag.build_context(rows)
    sources = _rag.source_titles(rows)

    if _client.available and context:
        try:
            answer = _client.generate(
                CHAT_SYSTEM,
                CHAT_USER_TEMPLATE.format(context=context, question=req.question),
            )
            if answer and answer.strip():
                return ChatResponse(answer=answer.strip(), sources=sources)
        except Exception as exc:  # noqa: BLE001
            logger.warning("LLM chat failed, using extractive fallback: %s", exc)

    # Offline/extractive fallback: surface the most relevant rule text directly.
    if rows:
        top = rows[0]
        answer = (
            f"Based on the tax rule \"{top.get('title')}\": {top.get('content')} "
            "(Informational only — not tax advice.)"
        )
        return ChatResponse(answer=answer, sources=sources)

    return ChatResponse(
        answer="I don't have a relevant tax rule for that. Please consult a tax "
        "professional for specifics. (Informational only — not tax advice.)",
        sources=[],
    )
