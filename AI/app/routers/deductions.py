import logging

from fastapi import APIRouter, Depends

from app.core.security import require_internal_key
from app.prompts.templates import DEDUCTION_SYSTEM, DEDUCTION_USER_TEMPLATE
from app.schemas.models import DeductionRequest, DeductionResponse
from app.services import heuristics
from app.services.llm_client import LLMClient
from app.services.rag_service import RagService

router = APIRouter(prefix="/ai/deductions", tags=["deductions"])
logger = logging.getLogger(__name__)
_client = LLMClient()
_rag = RagService()


@router.post("/suggest", response_model=DeductionResponse)
def suggest(req: DeductionRequest, _=Depends(require_internal_key)) -> DeductionResponse:
    """RAG-grounded deduction suggestion for one expense (TRD §7, PRD §5.6)."""
    query = " ".join(filter(None, [req.vendor, req.category, req.description])) or "business expense"
    rows = _rag.retrieve(query)
    context = _rag.build_context(rows)
    sources = _rag.source_titles(rows)

    if _client.available and context:
        try:
            data = _client.generate_json(
                DEDUCTION_SYSTEM,
                DEDUCTION_USER_TEMPLATE.format(
                    context=context,
                    vendor=req.vendor or "",
                    amount=req.amount if req.amount is not None else "",
                    category=req.category or "",
                    description=req.description or "",
                ),
            )
            if data:
                return DeductionResponse(
                    suggested_category=data.get("suggestedCategory") or req.category,
                    deduction_amount=_num(data.get("deductionAmount")),
                    likelihood=data.get("likelihood"),
                    reason=data.get("reason"),
                    sources=sources,
                )
        except Exception as exc:  # noqa: BLE001
            logger.warning("LLM deduction suggestion failed, using heuristic: %s", exc)

    # Heuristic fallback — still grounded by returning the retrieved rule titles.
    category, deductible, reason = heuristics.categorize(req.description, req.vendor)
    return DeductionResponse(
        suggested_category=req.category or category,
        deduction_amount=req.amount if deductible else None,
        likelihood="Likely deductible" if deductible else "Possibly deductible",
        reason=reason,
        sources=sources,
    )


def _num(value):
    try:
        return float(value) if value is not None else None
    except (ValueError, TypeError):
        return None
