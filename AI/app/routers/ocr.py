from fastapi import APIRouter, Depends

from app.core.security import require_internal_key
from app.schemas.models import OcrRequest, OcrResponse
from app.services.ocr_service import OcrService

router = APIRouter(prefix="/ai/ocr", tags=["ocr"])
_service = OcrService()


@router.post("/extract", response_model=OcrResponse)
def extract(req: OcrRequest, _=Depends(require_internal_key)) -> OcrResponse:
    """Extract amount/date/vendor + raw text from a receipt file (TRD §8)."""
    return _service.extract(req.file_url, req.content_type, req.file_base64)
