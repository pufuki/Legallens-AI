"""Full RAG pipeline: chunk → embed → index → retrieve → augment → answer.

Everything is built per-request in memory and destroyed after use.
"""

from __future__ import annotations

from dataclasses import dataclass

from app.core.config import settings
from app.rag.chunker import Chunk, chunk_text
from app.rag.embeddings import embed_query, embed_texts
from app.rag.vector_store import FaissIndex, RetrievalResult, build_index
from app.services import llm


@dataclass
class RagContext:
    chunks: list[Chunk]
    index: FaissIndex

    def destroy(self) -> None:
        self.index.destroy()
        self.chunks.clear()


def build_context(text: str) -> RagContext:
    """Chunk and index a document's text for retrieval."""
    chunks = chunk_text(text)
    vectors = embed_texts([c.text for c in chunks])
    index = build_index(chunks, vectors)
    return RagContext(chunks=chunks, index=index)


def retrieve(context: RagContext, query: str, top_k: int | None = None) -> list[RetrievalResult]:
    """Retrieve the most relevant chunks for a query."""
    query_vector = embed_query(query)
    return context.index.search(query_vector, top_k)


def build_prompt(question: str, results: list[RetrievalResult]) -> list[dict[str, str]]:
    """Assemble the LLM prompt with retrieved context."""
    context_text = "\n\n".join(
        f"[Excerpt {i + 1}]\n{r.chunk.text}" for i, r in enumerate(results)
    )
    user_content = (
        f"Use the following document excerpts to answer the question.\n\n"
        f"--- DOCUMENT CONTEXT ---\n{context_text}\n--- END CONTEXT ---\n\n"
        f"Question: {question}\n\n"
        f"Answer based ONLY on the context above. "
        f"If the answer is not in the context, say: \"Not found in the uploaded document.\""
    )
    return [{"role": "user", "content": user_content}]


def answer_with_rag(context: RagContext, question: str) -> tuple[str, list[str]]:
    """Retrieve relevant chunks and generate an answer via OpenRouter."""
    results = retrieve(context, question)
    if not results:
        return "Not found in the uploaded document.", []

    sources = [r.chunk.text[:200] for r in results]
    messages = build_prompt(question, results)
    answer = llm.chat(messages)
    return answer, sources


def summarize_with_rag(text: str, style: str = "short") -> str:
    """Generate a summary of the document using RAG retrieval."""
    context = build_context(text)
    try:
        query = f"Summarize this {style} contract"
        results = retrieve(context, query, top_k=settings.top_k)
        context_text = "\n\n".join(r.chunk.text for r in results) if results else text[:4000]

        style_instructions = {
            "short": "Provide a concise 2-3 sentence summary.",
            "detailed": "Provide a detailed multi-paragraph summary covering all key terms.",
            "bullets": "Provide a bullet-point summary of the key terms and provisions.",
            "plain": "Explain this contract in simple, plain English that a non-lawyer can understand.",
        }

        messages = [
            {
                "role": "user",
                "content": (
                    f"Summarize the following contract document.\n\n"
                    f"{style_instructions.get(style, style_instructions['short'])}\n\n"
                    f"--- DOCUMENT ---\n{context_text}\n--- END ---"
                ),
            }
        ]
        return llm.chat(messages)
    finally:
        context.destroy()
