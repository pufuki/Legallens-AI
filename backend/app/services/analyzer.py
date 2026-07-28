"""Heuristic contract analyzer.

Provides deterministic clause detection, risk analysis, obligation extraction,
and contract metadata extraction. These heuristics work standalone and are
augmented by the LLM when OpenRouter is configured.
"""

from __future__ import annotations

import re
from dataclasses import asdict, dataclass, field
from typing import Literal

from app.core.prompts import NOT_FOUND


RiskLevel = Literal["high", "medium", "low", "none"]


# ---- Clause taxonomy ----

CLAUSE_TAXONOMY = [
    {"name": "Confidentiality", "keywords": ["confidential", "non-disclosure", "proprietary information"], "risk_indicators": ["perpetual", "indefinite"], "description": "Obligates parties to keep shared information secret."},
    {"name": "Non-Compete", "keywords": ["non-compete", "restrictive covenant", "non-solicitation"], "risk_indicators": ["broad", "worldwide", "perpetual"], "description": "Restricts a party from competing or soliciting."},
    {"name": "Non-Disclosure", "keywords": ["non-disclosure", "nda", "disclose"], "risk_indicators": ["perpetual"], "description": "Explicit non-disclosure obligations."},
    {"name": "Termination", "keywords": ["termination", "terminate", "expire"], "risk_indicators": ["at will", "sole discretion", "without cause", "without notice"], "description": "How and when the agreement can end."},
    {"name": "Indemnification", "keywords": ["indemnify", "indemnification", "hold harmless"], "risk_indicators": ["unlimited", "all claims"], "description": "One party compensates the other for certain losses."},
    {"name": "Liability", "keywords": ["liability", "liable", "damages", "limitation of liability"], "risk_indicators": ["unlimited liability", "no cap"], "description": "Allocates responsibility for losses."},
    {"name": "Arbitration", "keywords": ["arbitration", "arbitrate", "dispute resolution", "mediation"], "risk_indicators": ["binding", "waive jury", "class action waiver"], "description": "How disputes are resolved."},
    {"name": "Intellectual Property", "keywords": ["intellectual property", "copyright", "patent", "trademark", "work product", "ownership of"], "risk_indicators": ["assigns all", "work for hire", "irrevocable"], "description": "Ownership and rights to created works."},
    {"name": "Payment Terms", "keywords": ["payment", "fees", "compensation", "invoice", "payable"], "risk_indicators": ["net 90", "upon demand"], "description": "How and when payments happen."},
    {"name": "Force Majeure", "keywords": ["force majeure", "act of god", "beyond reasonable control"], "risk_indicators": ["narrow", "pandemic"], "description": "Excuses performance during extraordinary events."},
    {"name": "Data Protection", "keywords": ["data protection", "personal data", "gdpr", "privacy", "data processing"], "risk_indicators": ["no safeguard"], "description": "Handling of personal and sensitive data."},
    {"name": "Governing Law", "keywords": ["governing law", "jurisdiction", "venue", "courts of", "laws of"], "risk_indicators": ["foreign jurisdiction"], "description": "Which laws apply to the contract."},
    {"name": "Notice", "keywords": ["notice", "written notice", "shall notify"], "risk_indicators": ["short notice", "immediate"], "description": "How parties communicate formal notices."},
    {"name": "Warranty", "keywords": ["warranty", "warranties", "warrant", "as-is", "disclaim"], "risk_indicators": ["as-is", "no warranty", "disclaim all"], "description": "Promises about quality or performance."},
    {"name": "Limitation of Liability", "keywords": ["limitation of liability", "aggregate liability", "total liability shall not"], "risk_indicators": ["no cap", "excludes gross negligence"], "description": "Caps on recoverable damages."},
]

CONTRACT_TYPES = [
    {"type": "Employment Agreement", "keywords": ["employment", "employee", "employer", "salary"], "expected": ["Confidentiality", "Intellectual Property", "Non-Compete", "Termination", "Notice"]},
    {"type": "Non-Disclosure Agreement (NDA)", "keywords": ["non-disclosure", "nda", "confidentiality agreement", "disclosing party"], "expected": ["Confidentiality", "Non-Disclosure", "Termination", "Governing Law"]},
    {"type": "Software Development Agreement", "keywords": ["software development", "developer", "source code", "deliverables"], "expected": ["Intellectual Property", "Payment Terms", "Warranty", "Termination", "Liability"]},
    {"type": "SaaS Agreement", "keywords": ["saas", "subscription", "service provider", "platform"], "expected": ["Data Protection", "Payment Terms", "Warranty", "Liability", "Termination"]},
    {"type": "Consulting Agreement", "keywords": ["consulting", "consultant", "advisory"], "expected": ["Confidentiality", "Intellectual Property", "Payment Terms", "Termination"]},
    {"type": "Service Agreement", "keywords": ["service agreement", "service provider", "perform services"], "expected": ["Payment Terms", "Warranty", "Liability", "Termination", "Indemnification"]},
    {"type": "Vendor Agreement", "keywords": ["vendor", "supplier", "supply", "goods"], "expected": ["Payment Terms", "Warranty", "Indemnification", "Liability", "Termination"]},
    {"type": "Lease Agreement", "keywords": ["lease", "landlord", "tenant", "premises", "rent"], "expected": ["Payment Terms", "Termination", "Liability", "Notice"]},
    {"type": "Partnership Agreement", "keywords": ["partnership", "partner", "joint venture"], "expected": ["Intellectual Property", "Liability", "Termination", "Confidentiality", "Governing Law"]},
    {"type": "Freelancer Agreement", "keywords": ["freelancer", "freelance", "independent contractor"], "expected": ["Intellectual Property", "Payment Terms", "Confidentiality", "Termination"]},
]

MONTHS = r"january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec"
DATE_RE = re.compile(
    rf"\b({MONTHS})[\s,]+\d{{1,2}}(?:,?\s*\d{{4}})?\b|\b\d{{1,2}}\s+({MONTHS})\s+\d{{4}}\b|\b\d{{4}}-\d{{2}}-\d{{2}}\b|\b\d{{1,2}}/\d{{1,2}}/\d{{2,4}}\b",
    re.IGNORECASE,
)


# ---- Data classes ----

@dataclass
class ClauseHit:
    name: str
    present: bool
    severity: str
    excerpt: str
    explanation: str


@dataclass
class RiskItem:
    level: str
    title: str
    excerpt: str
    why: str
    consequences: str
    suggestion: str


@dataclass
class MissingClause:
    name: str
    why: str
    recommendation: str


@dataclass
class ObligationRow:
    obligation: str
    type: str
    party: str
    detail: str


@dataclass
class TimelineEvent:
    label: str
    date: str
    type: str


@dataclass
class ContractInfo:
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


@dataclass
class SummaryResult:
    short: str
    detailed: str
    bullets: list[str]
    plain_english: str


@dataclass
class Recommendation:
    improvements: list[str]
    negotiation_tips: list[str]
    legal_concerns: list[str]
    questions_for_lawyer: list[str]
    health_score: int


@dataclass
class DocumentAnalysis:
    summary: SummaryResult
    contract_info: ContractInfo
    clauses: list[ClauseHit]
    risks: list[RiskItem]
    missing: list[MissingClause]
    obligations: list[ObligationRow]
    timeline: list[TimelineEvent]
    recommendations: Recommendation


# ---- Helpers ----

def _find_context(text: str, keyword: str, window: int = 220) -> str:
    idx = text.lower().find(keyword)
    if idx == -1:
        return ""
    start = max(0, idx - window // 2)
    end = min(len(text), idx + len(keyword) + window // 2)
    excerpt = text[start:end].strip()
    if start > 0:
        excerpt = "…" + excerpt
    if end < len(text):
        excerpt = excerpt + "…"
    return excerpt


def _score_risk(excerpt: str, indicators: list[str]) -> RiskLevel:
    lower = excerpt.lower()
    hits = sum(1 for k in indicators if k in lower)
    if hits >= 2:
        return "high"
    if hits == 1:
        return "medium"
    return "low"


def _sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+(?=[A-Z])", text) if len(s.strip()) > 15]


def _detect_contract_type(text: str) -> tuple[str, list[str]]:
    lower = text.lower()
    best, best_score, expected = "Commercial Agreement", 0, []
    for c in CONTRACT_TYPES:
        score = sum(1 for k in c["keywords"] if k in lower)
        if score > best_score:
            best_score = score
            best = c["type"]
            expected = c["expected"]
    return best, expected


def _extract_parties(text: str) -> list[str]:
    parties: set[str] = set()
    for pattern in [
        r"(?:between|by and between)\s+([A-Z][A-Za-z0-9 .,&'\-]{2,60}?)(?:\s+and\s+)([A-Z][A-Za-z0-9 .,&'\-]{2,60}?)(?:\s+\.|,|;)",
        r'([A-Z][A-Za-z0-9 .,&\'\-]{2,50})\s+\(the\s+"(?:Client|Company|Contractor|Consultant|Provider|Vendor|Employer|Employee|Landlord|Tenant|Partner)"\)',
    ]:
        for m in re.finditer(pattern, text):
            for g in m.groups():
                p = (g or "").strip()
                if p and len(p) > 2 and not re.match(r"^(the|and|this|that|agreement|party|shall)$", p, re.I):
                    parties.add(p[:60])
    return list(parties)[:6]


def _extract_dates(text: str) -> list[dict[str, str]]:
    out: list[dict[str, str]] = []
    seen: set[str] = set()
    for m in DATE_RE.finditer(text):
        d = m.group(0)
        if d.lower() in seen:
            continue
        seen.add(d.lower())
        lower = text.lower()
        idx = lower.find(d.lower())
        ctx = lower[max(0, idx - 60):idx]
        label = "Date"
        if re.search(r"effective|commenc|start|begin", ctx):
            label = "Effective Date"
        elif re.search(r"termin|end|expire|expiration", ctx):
            label = "Termination Date"
        elif re.search(r"renew|renewal|extend", ctx):
            label = "Renewal Date"
        elif re.search(r"payment|invoice|due|payable", ctx):
            label = "Payment Date"
        elif re.search(r"milestone|deliver|delivery", ctx):
            label = "Milestone"
        out.append({"label": label, "date": d})
    return out[:30]


def _extract_currency(text: str) -> str:
    m = re.search(r"\b(USD|EUR|GBP|CAD|AUD|JPY|INR|\$|€|£)\b", text)
    return m.group(0) if m else NOT_FOUND


def _extract_numbers(text: str) -> list[str]:
    found: set[str] = set()
    pattern = r"(?:USD|EUR|GBP|CAD|AUD|\$|€|£)\s?\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\s?(?:percent|%|per annum|days|months|years)\b"
    for m in re.findall(pattern, text, re.I):
        found.add(m.strip())
    return list(found)[:12]


# ---- Main analysis ----

def analyze(text: str) -> DocumentAnalysis:
    lower = text.lower()
    contract_type, expected = _detect_contract_type(text)
    parties = _extract_parties(text)
    dates = _extract_dates(text)

    # Clauses
    clauses: list[ClauseHit] = []
    for defn in CLAUSE_TAXONOMY:
        found_kw = next((k for k in defn["keywords"] if k in lower), None)
        if not found_kw:
            clauses.append(ClauseHit(defn["name"], False, "none", "", defn["description"]))
            continue
        excerpt = _find_context(text, found_kw)
        severity = _score_risk(excerpt, defn["risk_indicators"])
        clauses.append(ClauseHit(defn["name"], True, severity, excerpt, defn["description"]))

    # Risks
    risks: list[RiskItem] = []
    risk_patterns = [
        ("Unlimited liability exposure", r"unlimited liability|no\s+(?:cap|limitation)", "The contract exposes a party to uncapped financial liability.", "A single incident could result in catastrophic financial loss with no ceiling.", "Negotiate a liability cap and exclude indirect damages."),
        ("Broad non-compete restriction", r"non-compete|shall not (?:compete|solicit)", "Non-compete clauses restrict future business opportunities.", "May prevent working with competitors for an extended period.", "Limit scope to reasonable duration, geography, and services."),
        ("Unilateral termination right", r"terminate[^.]{0,80}(?:at will|sole discretion|without cause|without notice)", "One party can end the agreement with little or no notice.", "Sudden loss of the relationship with no time to plan.", "Require mutual notice periods and define cause-based termination."),
        ("Aggressive indemnification", r"indemnify[^.]{0,120}(?:all|any)\s+(?:claims|losses|damages)", "Indemnification is broad and may cover claims beyond your control.", "You could be forced to pay for losses you did not cause.", "Narrow indemnity to your own negligence or breach."),
        ("Intellectual property assignment", r"assigns?\s+all\s+(?:right|title|interest)|work for hire", "All created IP transfers to the other party.", "Loss of ownership over your creations, tools, or methodologies.", "Carve out pre-existing IP and use licenses where possible."),
        ("Automatic renewal", r"auto(?:matically)?\s+renew|evergreen|shall renew", "The contract renews automatically unless you actively cancel.", "Unexpected ongoing obligations and fees.", "Require mutual opt-in for renewal and a clear cancellation window."),
    ]
    for title, pattern, why, consequence, suggestion in risk_patterns:
        m = re.search(pattern, lower)
        if m:
            risks.append(RiskItem("high", title, _find_context(text, m.group(0)) or m.group(0), why, consequence, suggestion))

    for c in clauses:
        if c.present and c.severity == "medium" and len(risks) < 12:
            risks.append(RiskItem("medium", f"{c.name} clause needs review", c.excerpt, f"The {c.name.lower()} clause contains language that may be unfavorable.", "Could create obligations broader than expected.", f"Review the {c.name.lower()} clause with counsel."))

    if not risks:
        risks.append(RiskItem("low", "No high-risk patterns detected", "", "No commonly problematic clauses were automatically detected.", "The contract appears balanced, but manual review is still recommended.", "Have a lawyer review the full document before signing."))

    # Missing clauses
    present = {c.name for c in clauses if c.present}
    why_map = {
        "Confidentiality": "Protects sensitive business information shared during the relationship.",
        "Intellectual Property": "Clarifies who owns created work and prevents future disputes.",
        "Non-Compete": "Prevents unfair competition after the relationship ends.",
        "Termination": "Defines how the agreement ends and protects both parties.",
        "Notice": "Establishes how formal communications must be delivered.",
        "Payment Terms": "Defines when and how payments are made.",
        "Warranty": "Sets expectations about quality and remedies.",
        "Liability": "Allocates risk and caps potential damages.",
        "Indemnification": "Protects against third-party claims.",
        "Data Protection": "Required when personal data is processed.",
        "Governing Law": "Determines which laws and courts apply.",
    }
    missing = [
        MissingClause(n, why_map.get(n, f"Commonly expected in a {contract_type.lower()}."), f"Consider adding a {n.lower()} clause. Consult a lawyer for appropriate language.")
        for n in expected if n not in present
    ]

    # Contract info
    jur_match = re.search(r"(?:governed by|laws of|jurisdiction of)\s+([a-z][a-z .'\-]{3,50})", lower)
    jurisdiction = text[jur_match.start():jur_match.end()].strip() if jur_match else NOT_FOUND
    dur_match = re.search(r"(?:term|duration|period)\s+of\s+(\d+\s+(?:year|month|day|week)s?)", lower) or re.search(r"(\d+\s+(?:year|month|day|week)s?)\s+term", lower)
    duration = dur_match.group(1) if dur_match else NOT_FOUND
    find_date = lambda label: next((d["date"] for d in dates if d["label"] == label), NOT_FOUND)

    contract_info = ContractInfo(
        contract_type=contract_type,
        purpose=(_sentences(text)[0][:200] if _sentences(text) else NOT_FOUND),
        parties=parties,
        effective_date=find_date("Effective Date"),
        termination_date=find_date("Termination Date"),
        renewal_date=find_date("Renewal Date"),
        jurisdiction=jurisdiction,
        duration=duration,
        currency=_extract_currency(text),
        important_numbers=_extract_numbers(text),
    )

    # Obligations
    obligations: list[ObligationRow] = []
    party_a = parties[0] if parties else "Party A"
    party_b = parties[1] if len(parties) > 1 else "Party B"
    obligation_re = re.compile(r"\b(shall|must|will|agrees?\s+to|obligated?\s+to|responsible\s+for)\b", re.I)
    for s in _sentences(text):
        if not obligation_re.search(s):
            continue
        party = party_a
        if re.search(re.escape(party_b), s, re.I):
            party = party_b
        elif re.search(r"provider|contractor|consultant|vendor|seller|landlord|employer|developer", s, re.I):
            party = party_b
        ob_type = "Responsibility"
        if re.search(r"\b(pay|payment|fee|invoice|remuneration|salary|compensat)", s, re.I):
            ob_type = "Payment"
        elif re.search(r"\b(within \d+ days|by \d+|no later than|deadline|on or before|prior to)", s, re.I):
            ob_type = "Deadline"
        elif re.search(r"\b(deliver|provide|submit|supply|furnish|produce|build|develop)", s, re.I):
            ob_type = "Deliverable"
        obligations.append(ObligationRow(s[:220], ob_type, party, ob_type))
        if len(obligations) >= 30:
            break

    # Timeline
    timeline: list[TimelineEvent] = []
    if contract_info.effective_date != NOT_FOUND:
        timeline.append(TimelineEvent("Effective Date", contract_info.effective_date, "effective"))
    if contract_info.renewal_date != NOT_FOUND:
        timeline.append(TimelineEvent("Renewal Date", contract_info.renewal_date, "renewal"))
    if contract_info.termination_date != NOT_FOUND:
        timeline.append(TimelineEvent("Termination / Expiry", contract_info.termination_date, "termination"))
    for d in dates:
        if any(e.date == d["date"] for e in timeline):
            continue
        if d["label"] == "Payment Date":
            timeline.append(TimelineEvent("Payment Date", d["date"], "payment"))
        elif d["label"] == "Milestone":
            timeline.append(TimelineEvent("Milestone", d["date"], "milestone"))
    timeline = timeline[:10]

    # Summary
    first_sents = " ".join(_sentences(text)[:3])
    short = f"This appears to be a {contract_type.lower()}"
    if parties:
        short += f" between {parties[0]} and {parties[1]}"
    short += f". {first_sents[:280]}".strip()

    detailed = " ".join(_sentences(text)[:8])
    bullets = [f"Document type: {contract_type}."]
    if parties:
        bullets.append(f"Parties involved: {', '.join(parties)}.")
    if dates:
        bullets.append(f"Key dates: {'; '.join(f\"{d['label']} ({d['date']})\" for d in dates[:4])}.")
    if contract_info.important_numbers:
        bullets.append(f"Notable figures: {', '.join(contract_info.important_numbers[:6])}.")
    plain_english = f"In plain terms, this is a {contract_type.lower()}"
    if parties:
        plain_english += f" between {parties[0]} and {parties[1]}"
    plain_english += ". It sets out what each side agrees to do, when, and what happens if things go wrong."

    summary = SummaryResult(short, detailed, bullets, plain_english)

    # Recommendations
    high_count = sum(1 for r in risks if r.level == "high")
    medium_count = sum(1 for r in risks if r.level == "medium")
    improvements = [r.suggestion for r in risks if r.level == "high"]
    improvements.extend(f"Add a {m.name.lower()} clause — {m.why}" for m in missing)
    legal_concerns = [f"{r.title}: {r.why}" for r in risks if r.level == "high"]
    negotiation_tips = []
    if high_count:
        negotiation_tips.append(f"Address {high_count} high-risk clause(s) before signing.")
    negotiation_tips.append("Request balanced mutual obligations between parties.")
    if missing:
        negotiation_tips.append(f"Negotiate to add {len(missing)} missing clause(s).")
    questions = [f"Should we include a {m.name.lower()} clause?" for m in missing]
    questions.extend([
        "Are the governing law and jurisdiction provisions acceptable?",
        "Do the indemnification and liability provisions fairly allocate risk?",
        "Are the notice and termination provisions workable for our operations?",
    ])
    score = max(10, min(100, 100 - high_count * 15 - medium_count * 6 - len(missing) * 5))
    recommendations = Recommendation(improvements[:10], negotiation_tips[:8], legal_concerns[:8], questions[:8], score)

    return DocumentAnalysis(summary, contract_info, clauses, risks, missing, obligations, timeline, recommendations)


def to_dict(analysis: DocumentAnalysis) -> dict:
    return {
        "summary": asdict(analysis.summary),
        "contract_info": asdict(analysis.contract_info),
        "clauses": [asdict(c) for c in analysis.clauses],
        "risks": [asdict(r) for r in analysis.risks],
        "missing": [asdict(m) for m in analysis.missing],
        "obligations": [asdict(o) for o in analysis.obligations],
        "timeline": [asdict(t) for t in analysis.timeline],
        "recommendations": asdict(analysis.recommendations),
    }


def compare(a: DocumentAnalysis, b: DocumentAnalysis) -> dict:
    a_clauses = {c.name for c in a.clauses if c.present}
    b_clauses = {c.name for c in b.clauses if c.present}
    added = list(b_clauses - a_clauses)
    removed = list(a_clauses - b_clauses)
    common = a_clauses & b_clauses
    modified = []
    risk_differences = []
    for name in common:
        ca = next(c for c in a.clauses if c.name == name)
        cb = next(c for c in b.clauses if c.name == name)
        if ca.severity != cb.severity:
            modified.append({"clause": name, "difference": f"Risk level changed from {ca.severity} to {cb.severity}."})
            risk_differences.append({"clause": name, "doc_a": ca.severity, "doc_b": cb.severity})
    summary = (
        f"Document A is a {a.contract_info.contract_type}; Document B is a {b.contract_info.contract_type}. "
        f"{len(added)} clause(s) added, {len(removed)} removed, {len(modified)} modified. "
        f"Health scores — A: {a.recommendations.health_score}, B: {b.recommendations.health_score}."
    )
    return {"added": added, "removed": removed, "modified": modified, "risk_differences": risk_differences, "summary": summary}
