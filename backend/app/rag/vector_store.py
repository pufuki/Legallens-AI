"""In-memory FAISS vector store.

Vectors are stored only in memory for the duration of a single request and
destroyed immediately after. Nothing is persisted to disk.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import faiss
import numpy as np

from app.core.config import settings
from app.rag.chunker import Chunk


@dataclass
class RetrievalResult:
    chunk: Chunk
    score: float


class FaissIndex:
    """A transient FAISS index for a single document's chunks."""

    def __init__(self, chunks: list[Chunk], vectors: np.ndarray):
        if vectors.size == 0:
            self.index = None
            self.chunks: list[Chunk] = []
            return
        dim = vectors.shape[1]
        # Inner-product index (vectors are normalized → equivalent to cosine)
        self.index = faiss.IndexFlatIP(dim)
        self.index.add(vectors.astype(np.float32))
        self.chunks = chunks

    def search(self, query_vector: np.ndarray, top_k: int | None = None) -> list[RetrievalResult]:
        if self.index is None or not self.chunks:
            return []
        k = min(top_k or settings.top_k, len(self.chunks))
        query = query_vector.astype(np.float32).reshape(1, -1)
        scores, indices = self.index.search(query, k)
        results: list[RetrievalResult] = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0:
                continue
            results.append(RetrievalResult(chunk=self.chunks[idx], score=float(score)))
        return results

    def destroy(self) -> None:
        if self.index is not None:
            self.index.reset()
        self.index = None
        self.chunks = []


def build_index(chunks: list[Chunk], vectors: np.ndarray) -> FaissIndex:
    return FaissIndex(chunks, vectors)
