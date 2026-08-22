"""Make the AI test suite hermetic and deterministic.

Tests validate the offline stub/heuristic paths, so they must not depend on a
developer's real .env keys or a live database. We force the stub provider and an
empty DSN *before* the app modules import (and instantiate their clients).
"""
import os

os.environ["LLM_PROVIDER"] = "stub"
os.environ["GEMINI_API_KEY"] = ""
os.environ["GROQ_API_KEY"] = ""
os.environ["SUPABASE_DB_DSN"] = ""  # forces the in-memory corpus fallback for RAG

from app.core.config import get_settings  # noqa: E402

get_settings.cache_clear()
