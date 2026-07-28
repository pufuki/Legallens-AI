"""Local embedding generation using sentence-transformers.

The model (all-MiniLM-L6-v2) runs entirely on-device — no external API calls.
The model is loaded lazily and cached so repeated requests don't reload it.
"""

from __future__ import annotations

from functools import lru_cache

import numpy as np

from app.core.config import settings


@lru_cache
def _get_model():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(
        settings.embedding_model_name, device=settings.embedding_device
    )


def embed_texts(texts: list[str]) -> np.ndarray:
    """Generate normalized embeddings for a list of text chunks."""
    if not texts:
        return np.array([], dtype=np.float32)
    model = _get_model()
    vectors = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    return np.array(vectors, dtype=np.float32)


def embed_query(query: str) -> np.ndarray:
    """Generate a normalized embedding for a single query string."""
    return embed_texts([query])[0]
