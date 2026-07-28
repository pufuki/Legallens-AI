"""Central configuration for LegalLens AI.

All model names, API endpoints, and tunable parameters live here so that
services never hardcode them. Change the model once here and it propagates
throughout the backend.
"""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # ---- OpenRouter ----
    openrouter_api_key: str = os.getenv("OPENROUTER_API_KEY", "")
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    # Default model — change this single line to switch models.
    openrouter_model: str = "deepseek/deepseek-chat-v3"
    openrouter_temperature: float = 0.2
    openrouter_max_tokens: int = 2000
    openrouter_request_timeout: int = 60

    # ---- Embeddings (local, no API) ----
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_device: str = "cpu"

    # ---- RAG ----
    chunk_size: int = 500
    chunk_overlap: int = 80
    top_k: int = 5

    # ---- Upload limits ----
    max_file_size_bytes: int = 20 * 1024 * 1024  # 20 MB
    allowed_extensions: tuple[str, ...] = (".pdf", ".docx")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
