export type RiskLevel = 'high' | 'medium' | 'low' | 'none';

export interface UploadedDocument {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  pages: number;
  text: string;
  uploadedAt: number;
}

export interface ClauseHit {
  name: string;
  present: boolean;
  severity: RiskLevel;
  excerpt: string;
  explanation: string;
}

export interface RiskItem {
  level: RiskLevel;
  title: string;
  excerpt: string;
  why: string;
  consequences: string;
  suggestion: string;
}

export interface ObligationRow {
  obligation: string;
  type: 'Payment' | 'Deadline' | 'Responsibility' | 'Deliverable';
  party: string;
  detail: string;
}

export interface TimelineEvent {
  label: string;
  date: string;
  type: 'effective' | 'renewal' | 'expiry' | 'payment' | 'milestone' | 'termination';
}

export interface ContractInfo {
  contractType: string;
  purpose: string;
  parties: string[];
  effectiveDate: string;
  terminationDate: string;
  renewalDate: string;
  jurisdiction: string;
  duration: string;
  currency: string;
  importantNumbers: string[];
}

export interface SummaryResult {
  short: string;
  detailed: string;
  bullets: string[];
  plainEnglish: string;
}

export interface Recommendation {
  improvements: string[];
  negotiationTips: string[];
  legalConcerns: string[];
  questionsForLawyer: string[];
  healthScore: number;
}

export interface MissingClause {
  name: string;
  why: string;
  recommendation: string;
}

export interface DocumentAnalysis {
  documentId: string;
  summary: SummaryResult;
  contractInfo: ContractInfo;
  clauses: ClauseHit[];
  risks: RiskItem[];
  missing: MissingClause[];
  obligations: ObligationRow[];
  timeline: TimelineEvent[];
  recommendations: Recommendation;
}

export interface ComparisonResult {
  added: string[];
  removed: string[];
  modified: { clause: string; difference: string }[];
  riskDifferences: { clause: string; docA: RiskLevel; docB: RiskLevel }[];
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}
