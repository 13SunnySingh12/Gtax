"""Configuration loaded from environment (root .env files) via pydantic-settings."""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Root of the repo (…/G-TAX). The AI service lives in AI/, env files at root.
ROOT_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    # --- service ---
    ai_service_port: int = 8000
    internal_api_key: str = "local-dev-internal-key-change-me"

    # --- LLM ---
    llm_provider: str = "gemini"  # "gemini" | "groq" | "stub"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-flash-lite-latest"
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"
    embedding_model: str = "gemini-embedding-001"
    embedding_dim: int = 768

    # --- database (pgvector) ---
    supabase_db_dsn: str = ""

    model_config = SettingsConfigDict(
        # Load the shared .env then the local overrides; env vars still win.
        env_file=(ROOT_DIR / ".env", ROOT_DIR / ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @property
    def effective_provider(self) -> str:
        """Fall back to the deterministic stub when no key is configured, so the
        service always runs (offline dev, CI, tests)."""
        if self.llm_provider == "gemini" and self.gemini_api_key:
            return "gemini"
        if self.llm_provider == "groq" and self.groq_api_key:
            return "groq"
        return "stub"


@lru_cache
def get_settings() -> Settings:
    return Settings()
