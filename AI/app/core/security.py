"""Internal API-key guard. FastAPI is never public (TRD §10): every request must
carry the shared secret Spring Boot sends in the X-Internal-Api-Key header."""
from __future__ import annotations

from fastapi import Header, HTTPException, status

from app.core.config import get_settings

INTERNAL_API_KEY_HEADER = "X-Internal-Api-Key"


async def require_internal_key(x_internal_api_key: str | None = Header(default=None)) -> None:
    settings = get_settings()
    if not x_internal_api_key or x_internal_api_key != settings.internal_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal API key",
        )
