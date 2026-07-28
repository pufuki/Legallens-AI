// Local legal document analyzer.
// Uses deterministic heuristics to extract clauses, risks, obligations, dates,
// parties, and summaries from contract text. Runs entirely in-memory.
// When OpenRouter is configured, the chat/summary flows augment these heuristics
// with LLM-generated prose; otherwise the heuristics stand alone.

import type {
  ClauseHit,
  ContractInfo,
  DocumentAnalysis,
  MissingClause,
  ObligationRow,
  Recommendation,
  RiskItem,
  RiskLevel,
  SummaryResult,
  TimelineEvent,
} from '@/types';

// ---- Clause taxonomy -------------------------------------------------------

interface ClauseDef {
  name: string;
  keywords: string[];
  riskIndicators: string[];
  description: string;
}

const CLAUSE_TAXONOMY: ClauseDef[] = [
  { name: 'Confidentiality', keywords: ['confidential', 'non-disclosure', 'proprietary information', 'confidential information'], riskIndicators: ['perpetual', 'indefinite', 'survives'], description: 'Obligates parties to keep shared information secret.' },
  { name: 'Non-Compete', keywords: ['non-compete', 'non-compete clause', 'shall not compete', 'restrictive covenant', 'non-solicitation'], riskIndicators: ['broad', 'unlimited', 'worldwide', 'perpetual', 'excessive'], description: 'Restricts a party from competing or soliciting.' },
  { name: 'Non-Disclosure', keywords: ['non-disclosure', 'nda', 'disclose', 'confidentiality agreement'], riskIndicators: ['perpetual', 'no exception'], description: 'Explicit non-disclosure obligations.' },
  { name: 'Termination', keywords: ['termination', 'terminate', 'terminate this agreement', 'expiration', 'expire'], riskIndicators: ['at will', 'sole discretion', 'immediately', 'without cause', 'without notice'], description: 'How and when the agreement can end.' },
  { name: 'Indemnification', keywords: ['indemnify', 'indemnification', 'hold harmless', 'defend', 'indemnified'], riskIndicators: ['unlimited', 'broad', 'all claims', 'any third party'], description: 'One party compensates the other for certain losses.' },
  { name: 'Liability', keywords: ['liability', 'liable', 'damages', 'limitation of liability', 'consequential damages'], riskIndicators: ['unlimited liability', 'no cap', 'no limitation', 'punitive', 'indirect damages'], description: 'Allocates responsibility for losses.' },
  { name: 'Arbitration', keywords: ['arbitration', 'arbitrate', 'dispute resolution', 'mediation', 'binding arbitration'], riskIndicators: ['binding', 'exclusive', 'waive jury', 'class action waiver'], description: 'How disputes are resolved.' },
  { name: 'Intellectual Property', keywords: ['intellectual property', 'ip', 'copyright', 'patent', 'trademark', 'work product', 'ownership of', 'assigns all rights'], riskIndicators: ['assigns all', 'work for hire', 'irrevocable', 'perpetual license'], description: 'Ownership and rights to created works.' },
  { name: 'Payment Terms', keywords: ['payment', 'fees', 'compensation', 'invoice', 'payable', 'remuneration', 'salary', 'wage'], riskIndicators: ['net 90', 'upon demand', 'discretionary', 'no late fee'], description: 'How and when payments happen.' },
  { name: 'Force Majeure', keywords: ['force majeure', 'act of god', 'unforeseeable circumstances', 'beyond reasonable control'], riskIndicators: ['narrow', 'pandemic', 'no notice'], description: 'Excuses performance during extraordinary events.' },
  { name: 'Data Protection', keywords: ['data protection', 'personal data', 'gdpr', 'privacy', 'data processing', 'personal information'], riskIndicators: ['no safeguard', 'unrestricted transfer'], description: 'Handling of personal and sensitive data.' },
  { name: 'Governing Law', keywords: ['governing law', 'jurisdiction', 'venue', 'courts of', 'laws of', 'governed by'], riskIndicators: ['foreign jurisdiction', 'exclusive venue'], description: 'Which laws apply to the contract.' },
  { name: 'Notice', keywords: ['notice', 'written notice', 'shall notify', 'notice shall be'], riskIndicators: ['short notice', 'immediate'], description: 'How parties communicate formal notices.' },
  { name: 'Warranty', keywords: ['warranty', 'warranties', 'warrant', 'as-is', 'as is', 'disclaim', 'representation'], riskIndicators: ['as-is', 'no warranty', 'disclaim all', 'sole remedy'], description: 'Promises about quality or performance.' },
  { name: 'Limitation of Liability', keywords: ['limitation of liability', 'cap', 'aggregate liability', 'total liability shall not'], riskIndicators: ['no cap', 'excludes gross negligence', 'low cap'], description: 'Caps on recoverable damages.' },
];

// ---- Helpers --------------------------------------------------------------

function normalize(text: string): string {
  return text.replace(/\r/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n');
}

function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+(?=[A-Z])/).map((s) => s.trim()).filter((s) => s.length > 15);
}

function findContext(text: string, keyword: string, window = 220): string | null {
  const idx = text.toLowerCase().indexOf(keyword);
  if (idx === -1) return null;
  const start = Math.max(0, idx - window / 2);
  const end = Math.min(text.length, idx + keyword.length + window / 2);
  let excerpt = text.slice(start, end).trim();
  if (start > 0) excerpt = '…' + excerpt;
  if (end < text.length) excerpt = excerpt + '…';
  return excerpt;
}

function scoreRisk(excerpt: string, indicators: string[]): RiskLevel {
  const lower = excerpt.toLowerCase();
  const hits = indicators.filter((k) => lower.includes(k)).length;
  if (hits >= 2) return 'high';
  if (hits === 1) return 'medium';
  return 'low';
}

// ---- Contract type detection ---------------------------------------------

const CONTRACT_TYPES: { type: string; keywords: string[]; expectedClauses: string[] }[] = [
  { type: 'Employment Agreement', keywords: ['employment', 'employee', 'employer', 'employment agreement', 'position', 'compensation', 'salary'], expectedClauses: ['Confidentiality', 'Intellectual Property', 'Non-Compete', 'Termination', 'Notice'] },
  { type: 'Non-Disclosure Agreement (NDA)', keywords: ['non-disclosure', 'nda', 'confidentiality agreement', 'disclosing party', 'receiving party'], expectedClauses: ['Confidentiality', 'Non-Disclosure', 'Termination', 'Governing Law'] },
  { type: 'Software Development Agreement', keywords: ['software development', 'developer', 'development services', 'source code', 'deliverables', 'milestone'], expectedClauses: ['Intellectual Property', 'Payment Terms', 'Warranty', 'Termination', 'Liability'] },
  { type: 'SaaS Agreement', keywords: ['saas', 'software as a service', 'subscription', 'service provider', 'platform', 'usage'], expectedClauses: ['Data Protection', 'Payment Terms', 'Warranty', 'Liability', 'Termination'] },
  { type: 'Consulting Agreement', keywords: ['consulting', 'consultant', 'consulting services', 'advisory'], expectedClauses: ['Confidentiality', 'Intellectual Property', 'Payment Terms', 'Termination'] },
  { type: 'Service Agreement', keywords: ['service agreement', 'services', 'service provider', 'perform services'], expectedClauses: ['Payment Terms', 'Warranty', 'Liability', 'Termination', 'Indemnification'] },
  { type: 'Vendor Agreement', keywords: ['vendor', 'supplier', 'supply', 'goods', 'purchase order'], expectedClauses: ['Payment Terms', 'Warranty', 'Indemnification', 'Liability', 'Termination'] },
  { type: 'Lease Agreement', keywords: ['lease', 'landlord', 'tenant', 'premises', 'rent', 'lease agreement'], expectedClauses: ['Payment Terms', 'Termination', 'Liability', 'Notice'] },
  { type: 'Partnership Agreement', keywords: ['partnership', 'partner', 'joint venture', 'partners', 'partnership agreement'], expectedClauses: ['Intellectual Property', 'Liability', 'Termination', 'Confidentiality', 'Governing Law'] },
  { type: 'Freelancer Agreement', keywords: ['freelancer', 'freelance', 'independent contractor', 'contractor agreement'], expectedClauses: ['Intellectual Property', 'Payment Terms', 'Confidentiality', 'Termination'] },
];

function detectContractType(text: string): { type: string; expected: string[] } {
  const lower = text.toLowerCase();
  let best = 'Commercial Agreement';
  let bestScore = 0;
  let expected: string[] = [];
  for (const c of CONTRACT_TYPES) {
    const score = c.keywords.reduce((acc, k) => acc + (lower.includes(k) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = c.type;
      expected = c.expectedClauses;
    }
  }
  return { type: best, expected };
}

// ---- Date extraction ------------------------------------------------------

const MONTHS = 'january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec';
const DATE_RE = new RegExp(`\\b(${MONTHS})[\\s,]+\\d{1,2}(?:,?\\s*\\d{4})?\\b|\\b\\d{1,2}\\s+(${MONTHS})\\s+\\d{4}\\b|\\b\\d{4}-\\d{2}-\\d{2}\\b|\\b\\d{1,2}/\\d{1,2}/\\d{2,4}\\b`, 'gi');

function extractDates(text: string): { label: string; date: string }[] {
  const matches = [...text.matchAll(DATE_RE)].map((m) => m[0]).slice(0, 30);
  const seen = new Set<string>();
  const out: { label: string; date: string }[] = [];
  for (const d of matches) {
    if (seen.has(d.toLowerCase())) continue;
    seen.add(d.toLowerCase());
    const lower = text.toLowerCase();
    let label = 'Date';
    const idx = lower.indexOf(d.toLowerCase());
    const ctx = lower.slice(Math.max(0, idx - 60), idx);
    if (/effective|commenc|start|begin/.test(ctx)) label = 'Effective Date';
    else if (/termin|end|expire|expiration/.test(ctx)) label = 'Termination Date';
    else if (/renew|renewal|extend/.test(ctx)) label = 'Renewal Date';
    else if (/payment|invoice|due|payable/.test(ctx)) label = 'Payment Date';
    else if (/milestone|deliver|delivery/.test(ctx)) label = 'Milestone';
    out.push({ label, date: d });
  }
  return out;
}

// ---- Parties --------------------------------------------------------------

function extractParties(text: string): string[] {
  const parties = new Set<string>();
  const patterns = [
    /(?:between|by and between)\s+([A-Z][A-Za-z0-9 .,&'-]{2,60}?)(?:\s+\(?\s*"?[A-Z][a-z]+"?\)?\s*,)?\s+and\s+([A-Z][A-Za-z0-9 .,&'-]{2,60}?)(?:\s+\(|\.|\,|;)/g,
    /(?:the\s+)?(?:first|second)\s+(?:party|parties?)\s*(?:shall be|is|are)?\s*[:\-]?\s*([A-Z][A-Za-z0-9 .,&'-]{2,60})/g,
    /(")([A-Z][A-Za-z0-9 .,&'-]{2,40})(")\s+(?:and|,)\s+(")([A-Z][A-Za-z0-9 .,&'-]{2,40})(")/g,
  /([A-Z][A-Za-z0-9 .,&'-]{2,50})\s+\(the\s+"(?:Client|Company|Contractor|Consultant|Provider|Vendor|Employer|Employee|Landlord|Tenant|Partner|Licensor|Licensee|Seller|Buyer|Party|Disclosing Party|Receiving Party)"\)/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text)) !== null) {
      for (let i = 1; i < m.length; i++) {
        const p = m[i]?.trim();
        if (p && p.length > 2 && !/^(the|and|this|that|agreement|party|shall)$/i.test(p)) {
          parties.add(p.replace(/\s+/g, ' ').slice(0, 60));
        }
      }
    }
  }
  return [...parties].slice(0, 6);
}

// ---- Currency & numbers --------------------------------------------------

function extractCurrency(text: string): string {
  const cur = text.match(/\b(USD|EUR|GBP|CAD|AUD|JPY|INR|\$|€|£)\b/);
  return cur ? cur[0] : 'Not found in the uploaded document.';
}

function extractNumbers(text: string): string[] {
  const nums = new Set<string>();
  const re = /(?:USD|EUR|GBP|CAD|AUD|\$|€|£)\s?\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:\s?(?:million|billion|M|B))?|\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\s?(?:percent|%|per annum|days|months|years)\b/gi;
  const matches = text.match(re) ?? [];
  for (const n of matches) nums.add(n.trim());
  return [...nums].slice(0, 12);
}

// ---- Clause detection ----------------------------------------------------

function detectClauses(text: string): ClauseHit[] {
  const lower = text.toLowerCase();
  return CLAUSE_TAXONOMY.map((def) => {
    const found = def.keywords.find((k) => lower.includes(k));
    if (!found) {
      return { name: def.name, present: false, severity: 'none' as RiskLevel, excerpt: '', explanation: def.description };
    }
    const excerpt = findContext(text, found) ?? '';
    const severity = scoreRisk(excerpt, def.riskIndicators);
    return {
      name: def.name,
      present: true,
      severity,
      excerpt,
      explanation: def.description,
    };
  });
}

// ---- Risk analysis -------------------------------------------------------

function analyzeRisks(clauses: ClauseHit[], text: string): RiskItem[] {
  const risks: RiskItem[] = [];
  const lower = text.toLowerCase();
  const highRiskPatterns: { title: string; pattern: RegExp; why: string; consequence: string; suggestion: string }[] = [
    {
      title: 'Unlimited liability exposure',
      pattern: /unlimited liability|no (?:cap|limitation)|liable for (?:all|any) (?:damages|losses)/i,
      why: 'The contract exposes a party to uncapped financial liability.',
      consequence: 'A single incident could result in catastrophic financial loss with no ceiling.',
      suggestion: 'Negotiate a liability cap (e.g., 12 months of fees) and exclude indirect/consequential damages.',
    },
    {
      title: 'Broad non-compete restriction',
      pattern: /non-compete|shall not (?:compete|solicit|engage)/i,
      why: 'Non-compete clauses restrict future business opportunities and can be unenforceable if too broad.',
      consequence: 'May prevent working with competitors or clients for an extended period and geographic area.',
      suggestion: 'Limit scope to reasonable duration, geography, and specific services. Confirm enforceability in your jurisdiction.',
    },
    {
      title: 'Unilateral termination right',
      pattern: /terminate[^.]{0,80}(?:at will|sole discretion|without cause|without notice|immediately)/i,
      why: 'One party can end the agreement with little or no notice.',
      consequence: 'Sudden loss of the relationship with no time to plan or recover costs.',
      suggestion: 'Require mutual notice periods (e.g., 30-90 days) and define cause-based termination.',
    },
    {
      title: 'Aggressive indemnification',
      pattern: /indemnify[^.]{0,120}(?:all|any|every)\s+(?:claims|losses|damages|liabilities)/i,
      why: 'Indemnification is broad and may cover third-party claims beyond your control.',
      consequence: 'You could be forced to pay for losses you did not cause.',
      suggestion: 'Narrow indemnity to your own negligence or breach, and cap the indemnity amount.',
    },
    {
      title: 'Intellectual property assignment',
      pattern: /assigns?\s+all\s+(?:right|title|interest|ownership)|work for hire|irrevocable[^.]{0,60}license/i,
      why: 'All created IP transfers to the other party, including pre-existing or unrelated work.',
      consequence: 'Loss of ownership over your creations, tools, or methodologies.',
      suggestion: 'Carve out pre-existing IP and background materials. Use licenses instead of assignments where possible.',
    },
    {
      title: 'Automatic renewal',
      pattern: /auto(?:matically)?\s+renew|evergreen|shall renew|renew[sd]?\s+for[^.]{0,40}term/i,
      why: 'The contract renews automatically unless you actively cancel.',
      consequence: 'Unexpected ongoing obligations and fees if you forget to cancel in time.',
      suggestion: 'Require mutual opt-in for renewal and add a clear cancellation window (e.g., 60 days notice).',
    },
    {
      title: 'Waiver of jury trial / class action',
      pattern: /waive[^.]{0,40}jury|class action waiver|no class action/i,
      why: 'You give up the right to a jury trial or participate in class actions.',
      consequence: 'Limited ability to pursue disputes collectively or through the court system.',
      suggestion: 'Understand you must use arbitration individually. Consider whether this is acceptable.',
    },
  ];

  for (const p of highRiskPatterns) {
    const m = lower.match(p.pattern);
    if (m) {
      const excerpt = findContext(text, m[0]) ?? m[0];
      risks.push({ level: 'high', title: p.title, excerpt, why: p.why, consequences: p.consequence, suggestion: p.suggestion });
    }
  }

  // Medium risks from detected clauses
  for (const c of clauses) {
    if (c.present && c.severity === 'medium' && risks.length < 12) {
      risks.push({
        level: 'medium',
        title: `${c.name} clause needs review`,
        excerpt: c.excerpt,
        why: `The ${c.name.toLowerCase()} clause contains language that may be unfavorable.`,
        consequences: 'Could create obligations or restrictions that are broader than expected.',
        suggestion: `Review the ${c.name.toLowerCase()} clause with counsel and negotiate balanced terms.`,
      });
    }
  }

  if (risks.length === 0) {
    risks.push({
      level: 'low',
      title: 'No high-risk patterns detected',
      excerpt: '',
      why: 'No commonly problematic clauses were automatically detected.',
      consequences: 'The contract appears balanced, but manual review is still recommended.',
      suggestion: 'Have a lawyer review the full document before signing.',
    });
  }
  return risks;
}

// ---- Missing clauses -----------------------------------------------------

function detectMissing(clauses: ClauseHit[], expected: string[], contractType: string): MissingClause[] {
  const present = new Set(clauses.filter((c) => c.present).map((c) => c.name));
  const missing: MissingClause[] = [];
  const whyMap: Record<string, string> = {
    'Confidentiality': 'Protects sensitive business information shared during the relationship.',
    'Intellectual Property': 'Clarifies who owns created work and prevents future disputes.',
    'Non-Compete': 'Prevents unfair competition after the relationship ends.',
    'Termination': 'Defines how the agreement ends and protects both parties.',
    'Notice': 'Establishes how formal communications must be delivered.',
    'Payment Terms': 'Defines when and how payments are made.',
    'Warranty': 'Sets expectations about quality and remedies if expectations are not met.',
    'Liability': 'Allocates risk and caps potential damages.',
    'Indemnification': 'Protects against third-party claims.',
    'Data Protection': 'Required when personal data is processed.',
    'Governing Law': 'Determines which laws and courts apply.',
  };
  for (const name of expected) {
    if (!present.has(name)) {
      missing.push({
        name,
        why: whyMap[name] ?? `Commonly expected in a ${contractType.toLowerCase()}.`,
        recommendation: `Consider adding a ${name.toLowerCase()} clause. Consult a lawyer for appropriate language.`,
      });
    }
  }
  return missing;
}

// ---- Obligations ---------------------------------------------------------

function extractObligations(text: string, parties: string[]): ObligationRow[] {
  const rows: ObligationRow[] = [];
  const sents = sentences(text);
  const obligationRe = /\b(shall|must|will|agrees?\s+to|obligated?\s+to|responsible\s+for)\b/i;
  const partyA = parties[0] ?? 'Party A';
  const partyB = parties[1] ?? 'Party B';

  for (const s of sents) {
    if (!obligationRe.test(s)) continue;
    let party = partyA;
    if (new RegExp(partyB, 'i').test(s)) party = partyB;
    else if (new RegExp(partyA, 'i').test(s)) party = partyA;
    else if (/provider|contractor|consultant|vendor|seller|landlord|employer|developer/i.test(s)) party = partyB;
    else if (/client|company|buyer|tenant|employee|customer/i.test(s)) party = partyA;

    let type: ObligationRow['type'] = 'Responsibility';
    if (/\b(pay|payment|fee|invoice|remuneration|salary|compensat)/i.test(s)) type = 'Payment';
    else if (/\b(within \d+ days|by \d+|no later than|deadline|on or before|prior to)/i.test(s)) type = 'Deadline';
    else if (/\b(deliver|provide|submit|supply|furnish|produce|build|develop)/i.test(s)) type = 'Deliverable';

    rows.push({ obligation: s.slice(0, 220), type, party, detail: type });
    if (rows.length >= 30) break;
  }
  return rows;
}

// ---- Timeline ------------------------------------------------------------

function buildTimeline(text: string, info: ContractInfo): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  if (info.effectiveDate && info.effectiveDate !== 'Not found in the uploaded document.')
    events.push({ label: 'Effective Date', date: info.effectiveDate, type: 'effective' });
  if (info.renewalDate && info.renewalDate !== 'Not found in the uploaded document.')
    events.push({ label: 'Renewal Date', date: info.renewalDate, type: 'renewal' });
  if (info.terminationDate && info.terminationDate !== 'Not found in the uploaded document.')
    events.push({ label: 'Termination / Expiry', date: info.terminationDate, type: 'termination' });

  const dates = extractDates(text);
  for (const d of dates) {
    if (events.some((e) => e.date === d.date)) continue;
    if (d.label === 'Payment Date') events.push({ label: 'Payment Date', date: d.date, type: 'payment' });
    else if (d.label === 'Milestone') events.push({ label: 'Milestone', date: d.date, type: 'milestone' });
  }
  return events.slice(0, 10);
}

// ---- Summary -------------------------------------------------------------

function buildSummary(text: string, contractType: string, parties: string[]): SummaryResult {
  const sents = sentences(text);
  const firstSentences = sents.slice(0, 3).join(' ');
  const short = `This appears to be a ${contractType.toLowerCase()}${
    parties.length ? ` between ${parties.slice(0, 2).join(' and ')}` : ''
  }. ${firstSentences.slice(0, 280)}`.trim();

  const detailed = sents.slice(0, 8).join(' ');

  const bullets: string[] = [];
  bullets.push(`Document type: ${contractType}.`);
  if (parties.length) bullets.push(`Parties involved: ${parties.join(', ')}.`);
  const dates = extractDates(text);
  if (dates.length) bullets.push(`Key dates identified: ${dates.slice(0, 4).map((d) => `${d.label} (${d.date})`).join('; ')}.`);
  const nums = extractNumbers(text);
  if (nums.length) bullets.push(`Notable figures: ${nums.slice(0, 6).join(', ')}.`);
  bullets.push(`The document contains ${sents.length} sentences across its full text.`);

  const plainEnglish = `In plain terms, this is a ${contractType.toLowerCase()}${
    parties.length ? ` between ${parties.slice(0, 2).join(' and ')}` : ''
  }. It sets out what each side agrees to do, when, and what happens if things go wrong. Think of it as the rulebook for the relationship — who pays, who delivers, when it starts, when it ends, and how disputes get handled.`;

  return { short, detailed, bullets, plainEnglish };
}

// ---- Recommendations -----------------------------------------------------

function buildRecommendations(risks: RiskItem[], missing: MissingClause[], clauses: ClauseHit[]): Recommendation {
  const improvements: string[] = [];
  const negotiationTips: string[] = [];
  const legalConcerns: string[] = [];
  const questionsForLawyer: string[] = [];

  const high = risks.filter((r) => r.level === 'high');
  const medium = risks.filter((r) => r.level === 'medium');

  for (const r of high) {
    improvements.push(r.suggestion);
    legalConcerns.push(`${r.title}: ${r.why}`);
  }
  for (const m of missing) {
    improvements.push(`Add a ${m.name.toLowerCase()} clause — ${m.why}`);
    questionsForLawyer.push(`Should we include a ${m.name.toLowerCase()} clause? What language do you recommend?`);
  }
  if (high.length === 0 && medium.length > 0) {
    negotiationTips.push('No high-risk clauses were detected. Use the medium-risk items as your negotiation priorities.');
  }
  if (high.length > 0) {
    negotiationTips.push(`Address ${high.length} high-risk clause(s) before signing. Start with liability caps, termination rights, and IP ownership.`);
  }
  negotiationTips.push('Request balanced mutual obligations — ensure both parties have comparable duties and remedies.');
  if (missing.length > 0) {
    negotiationTips.push(`Negotiate to add ${missing.length} missing clause(s) that are standard for this contract type.`);
  }
  questionsForLawyer.push('Are the governing law and jurisdiction provisions acceptable for our business?');
  questionsForLawyer.push('Do the indemnification and liability provisions fairly allocate risk?');
  questionsForLawyer.push('Are the notice and termination provisions workable for our operations?');

  // Health score: start 100, subtract for high/medium risks and missing clauses
  let score = 100;
  score -= high.length * 15;
  score -= medium.length * 6;
  score -= missing.length * 5;
  const presentCount = clauses.filter((c) => c.present).length;
  if (presentCount < 5) score -= 10;
  score = Math.max(10, Math.min(100, score));

  return {
    improvements: [...new Set(improvements)].slice(0, 10),
    negotiationTips: [...new Set(negotiationTips)].slice(0, 8),
    legalConcerns: [...new Set(legalConcerns)].slice(0, 8),
    questionsForLawyer: [...new Set(questionsForLawyer)].slice(0, 8),
    healthScore: score,
  };
}

// ---- Contract info -------------------------------------------------------

function buildContractInfo(text: string, contractType: string): ContractInfo {
  const parties = extractParties(text);
  const dates = extractDates(text);
  const findDate = (label: string) => dates.find((d) => d.label === label)?.date ?? 'Not found in the uploaded document.';

  const lower = text.toLowerCase();
  let jurisdiction = 'Not found in the uploaded document.';
  const jurMatch = lower.match(/(?:governed by|laws of|jurisdiction of)\s+([a-z][a-z .'-]{3,50})/i);
  if (jurMatch) jurisdiction = text.slice(jurMatch.index ?? 0, (jurMatch.index ?? 0) + jurMatch[0].length).trim();

  let duration = 'Not found in the uploaded document.';
  const durMatch = lower.match(/(?:term|duration|period)\s+of\s+(\d+\s+(?:year|month|day|week)s?)/i) ?? lower.match(/(\d+\s+(?:year|month|day|week)s?)\s+term/i);
  if (durMatch) duration = durMatch[1];

  return {
    contractType,
    purpose: sentences(text)[0]?.slice(0, 200) ?? 'Not found in the uploaded document.',
    parties,
    effectiveDate: findDate('Effective Date'),
    terminationDate: findDate('Termination Date'),
    renewalDate: findDate('Renewal Date'),
    jurisdiction,
    duration,
    currency: extractCurrency(text),
    importantNumbers: extractNumbers(text),
  };
}

// ---- Main entry ----------------------------------------------------------

export function analyzeDocument(documentId: string, rawText: string): DocumentAnalysis {
  const text = normalize(rawText);
  const { type: contractType, expected } = detectContractType(text);
  const clauses = detectClauses(text);
  const risks = analyzeRisks(clauses, text);
  const missing = detectMissing(clauses, expected, contractType);
  const contractInfo = buildContractInfo(text, contractType);
  const obligations = extractObligations(text, contractInfo.parties);
  const timeline = buildTimeline(text, contractInfo);
  const summary = buildSummary(text, contractType, contractInfo.parties);
  const recommendations = buildRecommendations(risks, missing, clauses);

  return {
    documentId,
    summary,
    contractInfo,
    clauses,
    risks,
    missing,
    obligations,
    timeline,
    recommendations,
  };
}

// ---- Comparison ----------------------------------------------------------

export function compareDocuments(a: DocumentAnalysis, b: DocumentAnalysis): import('@/types').ComparisonResult {
  const aClauses = new Set(a.clauses.filter((c) => c.present).map((c) => c.name));
  const bClauses = new Set(b.clauses.filter((c) => c.present).map((c) => c.name));
  const added = [...bClauses].filter((c) => !aClauses.has(c));
  const removed = [...aClauses].filter((c) => !bClauses.has(c));
  const common = [...aClauses].filter((c) => bClauses.has(c));

  const modified: { clause: string; difference: string }[] = [];
  const riskDifferences: { clause: string; docA: RiskLevel; docB: RiskLevel }[] = [];
  for (const name of common) {
    const ca = a.clauses.find((c) => c.name === name);
    const cb = b.clauses.find((c) => c.name === name);
    if (ca && cb && ca.severity !== cb.severity) {
      modified.push({ clause: name, difference: `Risk level changed from ${ca.severity} to ${cb.severity}.` });
      riskDifferences.push({ clause: name, docA: ca.severity, docB: cb.severity });
    }
  }

  const summary = [
    `Document A is a ${a.contractInfo.contractType}; Document B is a ${b.contractInfo.contractType}.`,
    `${added.length} clause(s) appear in B but not A; ${removed.length} clause(s) appear in A but not B; ${modified.length} shared clause(s) differ in risk level.`,
    `Health scores — A: ${a.recommendations.healthScore}, B: ${b.recommendations.healthScore}.`,
  ].join(' ');

  return { added, removed, modified, riskDifferences, summary };
}

// ---- Chat (local retrieval) ---------------------------------------------

export function answerQuestion(text: string, question: string): string {
  const lower = text.toLowerCase();
  const q = question.toLowerCase().trim();

  // Simple keyword routing for common legal questions
  const routes: { match: RegExp; answer: () => string }[] = [
    {
      match: /payment|pay|fee|invoice|compensat|salary|owe/,
      answer: () => {
        const nums = extractNumbers(text);
        const ctx = findContext(text, 'payment') ?? findContext(text, 'fee') ?? '';
        return nums.length
          ? `Based on the document, the following payment-related figures appear: ${nums.slice(0, 6).join(', ')}. Relevant context: "${ctx}". Not found in the uploaded document for anything beyond this.`
          : 'Not found in the uploaded document.';
      },
    },
    {
      match: /terminat|end|expire|cancel/,
      answer: () => {
        const ctx = findContext(text, 'termination') ?? findContext(text, 'terminate') ?? findContext(text, 'expire') ?? '';
        return ctx ? `Termination provisions found: "${ctx}". Review this section for notice periods and conditions. Not found in the uploaded document for further detail.` : 'Not found in the uploaded document.';
      },
    },
    {
      match: /nda|confidential|non-disclosure|disclos/,
      answer: () => {
        const ctx = findContext(text, 'confidential') ?? findContext(text, 'non-disclosure') ?? '';
        return ctx ? `Yes — confidentiality language was found: "${ctx}". This indicates an NDA-style obligation is present.` : 'Not found in the uploaded document.';
      },
    },
    {
      match: /intellectual property|ip|copyright|patent|trademark|ownership|owns/,
      answer: () => {
        const ctx = findContext(text, 'intellectual property') ?? findContext(text, 'ownership') ?? '';
        return ctx ? `IP provisions found: "${ctx}". Review who owns created work.` : 'Not found in the uploaded document.';
      },
    },
    {
      match: /governing law|jurisdiction|venue|court|law/,
      answer: () => {
        const info = buildContractInfo(text, detectContractType(text).type);
        return info.jurisdiction !== 'Not found in the uploaded document.' ? `Governing law: ${info.jurisdiction}.` : 'Not found in the uploaded document.';
      },
    },
    {
      match: /parties|who are the|between whom|who is involved/,
      answer: () => {
        const parties = extractParties(text);
        return parties.length ? `The parties identified are: ${parties.join('; ')}.` : 'Not found in the uploaded document.';
      },
    },
    {
      match: /date|when|effective|expire|renewal|timeline/,
      answer: () => {
        const dates = extractDates(text);
        return dates.length ? `Key dates found: ${dates.slice(0, 6).map((d => `${d.label}: ${d.date}`)).join('; ')}.` : 'Not found in the uploaded document.';
      },
    },
    {
      match: /risk|dangerous|problem|concern/,
      answer: () => {
        const analysis = analyzeDocument('local', text);
        const high = analysis.risks.filter((r) => r.level === 'high');
        return high.length ? `${high.length} high-risk item(s) detected: ${high.map((r) => r.title).join('; ')}.` : 'No high-risk patterns were automatically detected, but manual review is still recommended.';
      },
    },
  ];

  for (const r of routes) {
    if (r.match.test(q)) return r.answer();
  }

  // Generic retrieval: find the most relevant sentence by keyword overlap
  const qWords = q.split(/\s+/).filter((w) => w.length > 3 && !/^(what|when|where|which|how|does|is|are|the|this|that|with|from|have|has|please|tell|me|about)\b/.test(w));
  const sents = sentences(text);
  let best: string | null = null;
  let bestScore = 0;
  for (const s of sents) {
    const sl = s.toLowerCase();
    const score = qWords.reduce((acc, w) => acc + (sl.includes(w) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; best = s; }
  }
  if (best && bestScore > 0) return `Based on the uploaded document: "${best.slice(0, 300)}". This is the most relevant passage found. For anything beyond this, the answer is: Not found in the uploaded document.`;
  return 'Not found in the uploaded document.';
}
