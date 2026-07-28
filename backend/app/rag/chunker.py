"""Text chunking for RAG.

Splits raw document text into overlapping chunks of roughly `chunk_size`
characters, respecting sentence boundaries where possible.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from app.core.config import settings


@dataclass
class Chunk:
    index: int
    text: str
    start_char: int


def _split_sentences(text: str) -> list[str]:
    # Lightweight sentence splitter — avoids heavy NLP deps.
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+(?=[A-Z])", text) if s.strip()]


def chunk_text(text: str) -> list[Chunk]:
    """Split text into overlapping chunks for embedding and retrieval."""
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []

    chunk_size = settings.chunk_size
    overlap = settings.chunk_overlap

    sentences = _split_sentences(text)
    chunks: list[Chunk] = []
    current = ""
    start = 0
    idx = 0
    pos = 0

    for sentence in sentences:
        if current and len(current) + len(sentence) + 1 > chunk_size:
            chunks.append(Chunk(idx, current.strip(), start))
            idx += 1
            # Overlap: keep the tail of the previous chunk
            tail = current[-overlap:] if overlap > 0 else ""
            current = tail + " " + sentence
            start = pos - len(tail)
        else:
            if not current:
                start = pos
            current = (current + " " + sentence).strip()
        pos += len(sentence) + 1

    if current.strip():
        chunks.append(Chunk(idx, current.strip(), start))

    return chunks
