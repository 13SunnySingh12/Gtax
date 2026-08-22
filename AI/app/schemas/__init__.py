"""Request/response models for the AI service.

All models serialize with camelCase field names (alias_generator) so they line up
with the Spring Boot Java DTOs, while remaining snake_case in Python code.
"""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="ignore",
    )
