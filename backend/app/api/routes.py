"""FastAPI route definitions."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import settings
from app.rag.pipeline import answer_with_rag, build_context, summarize_with_rag
from app.schemas.models import (
    ChatRequest,
    ChatResponse,
    CompareRequest,
    ComparisonResult,
    HealthResponse,
    SummaryRequest,
    SummaryResult,
    UploadResponse,
)
from app.services import llm
from app.services.analyzer import analyze, compare, to_dict
from app.services.document_parser import ParseError, parse_document

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        model=settings.openrouter_model,
        embedding_model=settings.embedding_model_name,
        openrouter_configured=llm.is_configured(),
    )


@router.post("/upload", response_model=UploadResponse)
async def upload(file: UploadFile = File(...)) -> UploadResponse:
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    try:
        parsed = parse_document(data, file.filename or "upload", len(data))
    except ParseError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    document_id = str(uuid.uuid4())
    analysis = analyze(parsed.text)

    # If OpenRouter is configured, enrich the short summary with LLM output.
    short_summary = analysis.summary.short
    if llm.is_configured():
        try:
            short_summary = summarize_with_rag(parsed.text, "short")
        except Exception:
            pass  # Fall back to heuristic summary.

    result = to_dict(analysis)
    result["summary"]["short"] = short_summary

    return UploadResponse(
        document_id=document_id,
        filename=parsed.filename,
        pages=parsed.pages,
        size_bytes=parsed.size_bytes,
        file_type=parsed.file_type,
        summary=SummaryResult(**result["summary"]),
        contract_info=result["contract_info"],
        clauses=result["clauses"],
        risks=result["risks"],
        missing=result["missing"],
        obligations=result["obligations"],
        timeline=result["timeline"],
        recommendations=result["recommendations"],
    )


@router.post("/summary", response_model=SummaryResult)
def summary(req: SummaryRequest) -> SummaryResult:
    if llm.is_configured():
        try:
            llm_summary = summarize_with_rag(req.text, req.style)
            base = analyze(req.text).summary
            if req.style == "short":
                return SummaryResult(llm_summary, base.detailed, base.bullets, base.plain_english)
            if req.style == "detailed":
                return SummaryResult(base.short, llm_summary, base.bullets, base.plain_english)
            if req.style == "bullets":
                bullets = [b.strip("- ") for b in llm_summary.split("\n") if b.strip().startswith(("-", "*", "•"))]
                return SummaryResult(base.short, base.detailed, bullets or base.bullets, base.plain_english)
            if req.style == "plain":
                return SummaryResult(base.short, base.detailed, base.bullets, llm_summary)
        except Exception:
            pass
    return analyze(req.text).summary


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    if llm.is_configured():
        context = build_context(req.text)
        try:
            answer, sources = answer_with_rag(context, req.question)
            return ChatResponse(answer=answer, sources=sources)
        finally:
            context.destroy()
    # Fallback: simple keyword search
    from app.rag.chunker import chunk_text
    chunks = chunk_text(req.text)
    q_words = {w for w in req.question.lower().split() if len(w) > 3}
    best, best_score = None, 0
    for c in chunks:
        cl = c.text.lower()
        score = sum(1 for w in q_words if w in cl)
        if score > best_score:
            best_score, best = score, c.text
    if best and best_score > 0:
        return ChatResponse(answer=f'Based on the uploaded document: "{best[:300]}…".\n\nNot found in the uploaded document for anything beyond this passage.')
    return ChatResponse(answer="Not found in the uploaded document.")


@router.post("/compare", response_model=ComparisonResult)
def compare_endpoint(req: CompareRequest) -> ComparisonResult:
    a = analyze(req.text_a)
    b = analyze(req.text_b)
    result = compare(a, b)
    return ComparisonResult(**result)
