import logging

from fastapi import APIRouter, Depends

from app.core.security import require_internal_key
from app.prompts.templates import (
    CATEGORIZE_SYSTEM,
    CATEGORIZE_USER_TEMPLATE,
    EXPENSE_CATEGORIES,
)
from app.schemas.models import CategorizeRequest, CategorizeResponse
from app.services import heuristics
from app.services.llm_client import LLMClient

router = APIRouter(prefix="/ai/expenses", tags=["categorize"])
logger = logging.getLogger(__name__)
_client = LLMClient()


@router.post("/categorize", response_model=CategorizeResponse)
def categorize(req: CategorizeRequest, _=Depends(require_internal_key)) -> CategorizeResponse:
    """Suggest one category + deductibility for an expense (PRD §5.5)."""
    if _client.available:
        try:
            data = _client.generate_json(
                CATEGORIZE_SYSTEM,
                CATEGORIZE_USER_TEMPLATE.format(
                    categories=", ".join(EXPENSE_CATEGORIES),
                    vendor=req.vendor or "",
                    amount=req.amount if req.amount is not None else "",
                    text=req.text or "",
                ),
            )
            if data.get("category"):
                return CategorizeResponse(
                    category=str(data["category"]),
                    is_deductible=bool(data.get("isDeductible", False)),
                    reason=data.get("reason"),
                )
        except Exception as exc:  # noqa: BLE001
            logger.warning("LLM categorization failed, using heuristic: %s", exc)

    category, deductible, reason = heuristics.categorize(req.text, req.vendor)
    return CategorizeResponse(category=category, is_deductible=deductible, reason=reason)
