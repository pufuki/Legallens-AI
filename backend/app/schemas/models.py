"""Pydantic schemas for request/response validation."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


# ---- Upload ----

class UploadResponse(BaseModel):
    document_id: str
    filename: str
    pages: int
    size_bytes: int
    file_type: str
    summary: "SummaryResult"
    contract_info: "ContractInfo"
    clauses: list["ClauseHit"]
    risks: list["RiskItem"]
    missing: list["MissingClause"]
    obligations: list["ObligationRow"]
    timeline: list["TimelineEvent"]
    recommendations: "Recommendation"


# ---- Summary ----

class SummaryRequest(BaseModel):
    text: str = Field(..., min_length=1)
    style: Literal["short", "detailed", "bullets", "plain"] = "short"


class SummaryResult(BaseModel):
    short: str
    detailed: str
    bullets: list[str]
    plain_english: str


# ---- Contract info ----

class ContractInfo(BaseModel):
    contract_type: str
    purpose: str
    parties: list[str]
    effective_date: str
    termination_date: str
    renewal_date: str
    jurisdiction: str
    duration: str
    currency: str
    important_numbers: list[str]


# ---- Clauses ----

class ClauseHit(BaseModel):
    name: str
    present: bool
    severity: str
    excerpt: str
    explanation: str


# ---- Risk ----

class RiskItem(BaseModel):
    level: str
    title: str
    excerpt: str
    why: str
    consequences: str
    suggestion: str


# ---- Missing ----

class MissingClause(BaseModel):
    name: str
    why: str
    recommendation: str


# ---- Obligations ----

class ObligationRow(BaseModel):
    obligation: str
    type: str
    party: str
    detail: str


# ---- Timeline ----

class TimelineEvent(BaseModel):
    label: str
    date: str
    type: str


# ---- Recommendations ----

class Recommendation(BaseModel):
    improvements: list[str]
    negotiation_tips: list[str]
    legal_concerns: list[str]
    questions_for_lawyer: list[str]
    health_score: int


# ---- Chat ----

class ChatRequest(BaseModel):
    text: str = Field(..., min_length=1)
    question: str = Field(..., min_length=1)


class ChatResponse(BaseModel):
    answer: str
    sources: list[str] = Field(default_factory=list)


# ---- Compare ----

class CompareRequest(BaseModel):
    text_a: str = Field(..., min_length=1)
    text_b: str = Field(..., min_length=1)


class ComparisonResult(BaseModel):
    added: list[str]
    removed: list[str]
    modified: list[dict]
    risk_differences: list[dict]
    summary: str


# ---- Health ----

class HealthResponse(BaseModel):
    status: str
    model: str
    embedding_model: str
    openrouter_configured: bool


UploadResponse.model_rebuild()
