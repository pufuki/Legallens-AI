"""OpenRouter LLM client.

OpenRouter is OpenAI-compatible, so we use the openai SDK pointed at the
OpenRouter base URL. The model name comes from config — never hardcoded here.
"""

from __future__ import annotations

from openai import OpenAI

from app.core.config import settings
from app.core.prompts import LEGAL_SYSTEM_PROMPT


def _client() -> OpenAI:
    if not settings.openrouter_api_key:
        raise RuntimeError(
            "OPENROUTER_API_KEY is not configured. Set it in backend/.env."
        )
    return OpenAI(
        api_key=settings.openrouter_api_key,
        base_url=settings.openrouter_base_url,
        timeout=settings.openrouter_request_timeout,
    )


def is_configured() -> bool:
    return bool(settings.openrouter_api_key)


def chat(
    messages: list[dict[str, str]],
    *,
    temperature: float | None = None,
    max_tokens: int | None = None,
) -> str:
    """Call the OpenRouter chat completions endpoint.

    Prepends the legal system prompt if the caller hasn't supplied one.
    """
    full_messages = list(messages)
    if not full_messages or full_messages[0].get("role") != "system":
        full_messages.insert(0, {"role": "system", "content": LEGAL_SYSTEM_PROMPT})

    client = _client()
    response = client.chat.completions.create(
        model=settings.openrouter_model,
        messages=full_messages,
        temperature=temperature if temperature is not None else settings.openrouter_temperature,
        max_tokens=max_tokens if max_tokens is not None else settings.openrouter_max_tokens,
        extra_headers={"HTTP-Referer": "https://legallens.ai", "X-Title": "LegalLens AI"},
    )
    return response.choices[0].message.content or ""
