import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  FileText,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  ListChecks,
  Calendar,
  Users,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  MessageSquareQuote,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Lightbulb,
  Handshake,
  HelpCircle,
  Gauge,
} from 'lucide-react';
import type { DocumentAnalysis, RiskLevel } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AccordionItem } from '@/components/ui/Accordion';
import { ProgressBar, Stat } from '@/components/ui/ProgressBar';
import { riskColor, cn } from '@/utils/format';

// ---- Summary section -----------------------------------------------------

export function SummarySection({ analysis }: { analysis: DocumentAnalysis }) {
  const [view, setView] = useState<'short' | 'detailed' | 'bullets' | 'plain'>('short');
  const views = [
    { key: 'short' as const, label: 'Short' },
    { key: 'detailed' as const, label: 'Detailed' },
    { key: 'bullets' as const, label: 'Bullets' },
    { key: 'plain' as const, label: 'Plain English' },
  ];

  return (
    <Card>
      <CardHeader title="Executive Summary" subtitle="AI-generated overview of the contract" icon={<ScrollText className="w-5 h-5" />} />
      <div className="flex gap-1.5 mb-4 p-1 bg-slate-100 dark:bg-navy-800 rounded-xl w-fit">
        {views.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              view === v.key
                ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-soft'
                : 'text-slate-500 dark:text-slate-400 hover:text-navy-700'
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
      <motion.div key={view} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {view === 'short' && <p>{analysis.summary.short}</p>}
        {view === 'detailed' && <p>{analysis.summary.detailed}</p>}
        {view === 'bullets' && (
          <ul className="space-y-2">
            {analysis.summary.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-2 flex-shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
        {view === 'plain' && <p className="italic">{analysis.summary.plainEnglish}</p>}
      </motion.div>
    </Card>
  );
}

// ---- Contract info section ----------------------------------------------

export function ContractInfoSection({ analysis }: { analysis: DocumentAnalysis }) {
  const info = analysis.contractInfo;
  const items = [
    { label: 'Contract Type', value: info.contractType, icon: <FileText className="w-4 h-4" /> },
    { label: 'Effective Date', value: info.effectiveDate, icon: <Calendar className="w-4 h-4" /> },
    { label: 'Termination Date', value: info.terminationDate, icon: <Clock className="w-4 h-4" /> },
    { label: 'Renewal Date', value: info.renewalDate, icon: <RefreshCw className="w-4 h-4" /> },
    { label: 'Jurisdiction', value: info.jurisdiction, icon: <Gauge className="w-4 h-4" /> },
    { label: 'Duration', value: info.duration, icon: <Clock className="w-4 h-4" /> },
    { label: 'Currency', value: info.currency, icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <Card>
      <CardHeader title="Contract Information" subtitle="Key metadata extracted from the document" icon={<FileText className="w-5 h-5" />} />
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-800/50">
            <div className="text-gold-500 mt-0.5">{item.icon}</div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">{item.label}</p>
              <p className="text-sm font-medium text-navy-900 dark:text-slate-100 mt-0.5 break-words">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
      {info.parties.length > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-navy-800/50">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Parties Involved
          </p>
          <div className="flex flex-wrap gap-2">
            {info.parties.map((p, i) => (
              <Badge key={i} tone="navy">{p}</Badge>
            ))}
          </div>
        </div>
      )}
      {info.importantNumbers.length > 0 && (
        <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-800/50">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Important Numbers</p>
          <div className="flex flex-wrap gap-2">
            {info.importantNumbers.map((n, i) => (
              <Badge key={i} tone="gold">{n}</Badge>
            ))}
          </div>
        </div>
      )}
      <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-800/50">
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Purpose</p>
        <p className="text-sm text-navy-900 dark:text-slate-100">{info.purpose}</p>
      </div>
    </Card>
  );
}

// ---- Clause detection section -------------------------------------------

export function ClausesSection({ analysis }: { analysis: DocumentAnalysis }) {
  const present = analysis.clauses.filter((c) => c.present);
  const absent = analysis.clauses.filter((c) => !c.present);
  return (
    <Card>
      <CardHeader
        title="Clause Detection"
        subtitle={`${present.length} clauses detected · ${absent.length} not found`}
        icon={<ListChecks className="w-5 h-5" />}
        action={
          <div className="flex gap-2">
            <Badge tone="green">{present.length} found</Badge>
            <Badge tone="slate">{absent.length} absent</Badge>
          </div>
        }
      />
      <div className="space-y-2">
        {present.map((c) => (
          <AccordionItem
            key={c.name}
            title={c.name}
            subtitle={c.explanation}
            icon={<ShieldCheck className="w-4 h-4" />}
            badge={<Badge tone={c.severity === 'high' ? 'red' : c.severity === 'medium' ? 'amber' : 'green'}>{c.severity} risk</Badge>}
            defaultOpen={c.severity === 'high'}
          >
            <div className="space-y-2">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Excerpt</p>
                <p className="text-sm italic text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-navy-800/50 p-2 rounded-lg">{c.excerpt}</p>
              </div>
            </div>
          </AccordionItem>
        ))}
        {absent.length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Not detected in document</p>
            <div className="flex flex-wrap gap-2">
              {absent.map((c) => (
                <Badge key={c.name} tone="slate">
                  <XCircle className="w-3 h-3" /> {c.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ---- Risk analysis section ----------------------------------------------

export function RiskSection({ analysis }: { analysis: DocumentAnalysis }) {
  const high = analysis.risks.filter((r) => r.level === 'high').length;
  const medium = analysis.risks.filter((r) => r.level === 'medium').length;
  const low = analysis.risks.filter((r) => r.level === 'low').length;

  return (
    <Card>
      <CardHeader
        title="Risk Analysis"
        subtitle="Highlighted risk areas with explanations and suggestions"
        icon={<ShieldAlert className="w-5 h-5" />}
        action={
          <div className="flex gap-2">
            <Badge tone="red">{high} high</Badge>
            <Badge tone="amber">{medium} medium</Badge>
            <Badge tone="green">{low} low</Badge>
          </div>
        }
      />
      <div className="space-y-3">
        {analysis.risks.map((r, i) => {
          const c = riskColor(r.level);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn('rounded-xl border p-4', c.bg, c.border)}
            >
              <div className="flex items-start gap-3">
                <div className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0', c.dot)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={cn('font-medium', c.text)}>{r.title}</h4>
                    <Badge tone={r.level === 'high' ? 'red' : r.level === 'medium' ? 'amber' : 'green'}>{r.level}</Badge>
                  </div>
                  {r.excerpt && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Flagged text</p>
                      <p className="text-sm italic bg-white/60 dark:bg-navy-900/40 p-2 rounded-lg border border-slate-200 dark:border-navy-800">{r.excerpt}</p>
                    </div>
                  )}
                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Why risky</p>
                      <p className="text-slate-600 dark:text-slate-300">{r.why}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Consequences</p>
                      <p className="text-slate-600 dark:text-slate-300">{r.consequences}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Suggestion</p>
                      <p className="text-slate-600 dark:text-slate-300">{r.suggestion}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

// ---- Missing clauses section --------------------------------------------

export function MissingClausesSection({ analysis }: { analysis: DocumentAnalysis }) {
  if (analysis.missing.length === 0) {
    return (
      <Card>
        <CardHeader title="Missing Clauses" subtitle="Based on contract type" icon={<ShieldQuestion className="w-5 h-5" />} />
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300">All expected clauses for this contract type were detected.</p>
        </div>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader
        title="Missing Clauses"
        subtitle={`Recommended for a ${analysis.contractInfo.contractType.toLowerCase()}`}
        icon={<ShieldQuestion className="w-5 h-5" />}
        action={<Badge tone="amber">{analysis.missing.length} missing</Badge>}
      />
      <div className="space-y-2">
        {analysis.missing.map((m) => (
          <div key={m.name} className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h4 className="font-medium text-amber-800 dark:text-amber-300">{m.name}</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{m.why}</p>
            <p className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              {m.recommendation}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ---- Obligations section ------------------------------------------------

export function ObligationsSection({ analysis }: { analysis: DocumentAnalysis }) {
  const partyA = analysis.contractInfo.parties[0] ?? 'Party A';
  const partyB = analysis.contractInfo.parties[1] ?? 'Party B';
  const aRows = analysis.obligations.filter((o) => o.party === partyA || (!analysis.contractInfo.parties[1] && o.party === partyA));
  const bRows = analysis.obligations.filter((o) => o.party === partyB);

  const typeTone = (t: string) => (t === 'Payment' ? 'gold' : t === 'Deadline' ? 'amber' : t === 'Deliverable' ? 'blue' : 'navy');

  const renderTable = (rows: typeof analysis.obligations, title: string) => (
    <div>
      <p className="font-medium text-navy-900 dark:text-slate-100 mb-2 flex items-center gap-2">
        <Users className="w-4 h-4 text-gold-500" /> {title}
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400 italic p-3">No obligations detected for this party.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-800 text-left text-xs text-slate-500 uppercase">
                <th className="py-2 pr-3 font-medium">Type</th>
                <th className="py-2 pr-3 font-medium">Obligation</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-navy-800/50">
                  <td className="py-2 pr-3 align-top"><Badge tone={typeTone(r.type) as 'gold' | 'amber' | 'blue' | 'navy'}>{r.type}</Badge></td>
                  <td className="py-2 text-slate-600 dark:text-slate-300">{r.obligation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader title="Obligation Extraction" subtitle="Duties assigned to each party" icon={<ListChecks className="w-5 h-5" />} />
      <div className="grid lg:grid-cols-2 gap-6">
        {renderTable(aRows, partyA)}
        {renderTable(bRows, partyB)}
      </div>
    </Card>
  );
}

// ---- Timeline section ----------------------------------------------------

export function TimelineSection({ analysis }: { analysis: DocumentAnalysis }) {
  if (analysis.timeline.length === 0) {
    return (
      <Card>
        <CardHeader title="Timeline" subtitle="Key dates and milestones" icon={<Calendar className="w-5 h-5" />} />
        <p className="text-sm text-slate-400 italic">No dates were detected in the uploaded document.</p>
      </Card>
    );
  }
  const typeColor: Record<string, string> = {
    effective: 'bg-emerald-500',
    renewal: 'bg-blue-500',
    expiry: 'bg-red-500',
    payment: 'bg-gold-400',
    milestone: 'bg-navy-500',
    termination: 'bg-red-500',
  };
  return (
    <Card>
      <CardHeader title="Timeline" subtitle="Important dates and milestones" icon={<Calendar className="w-5 h-5" />} />
      <div className="relative pl-6">
        <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-200 dark:bg-navy-800" />
        {analysis.timeline.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative pb-4 last:pb-0"
          >
            <div className={cn('absolute -left-[18px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-navy-900', typeColor[e.type] ?? 'bg-slate-400')} />
            <div className="flex items-center gap-2">
              <p className="font-medium text-navy-900 dark:text-slate-100 text-sm">{e.label}</p>
              <Badge tone="slate">{e.date}</Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

// ---- Recommendations section --------------------------------------------

export function RecommendationsSection({ analysis }: { analysis: DocumentAnalysis }) {
  const r = analysis.recommendations;
  const score = r.healthScore;
  const scoreTone = score >= 75 ? 'green' : score >= 50 ? 'amber' : 'red';

  return (
    <Card>
      <CardHeader title="AI Recommendations" subtitle="Improvements, negotiation tips, and questions for your lawyer" icon={<Sparkles className="w-5 h-5" />} />

      {/* Health score */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-navy-50 to-gold-50 dark:from-navy-800/50 dark:to-navy-900/50 border border-slate-200 dark:border-navy-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-gold-500" />
            <p className="font-medium text-navy-900 dark:text-slate-100">Contract Health Score</p>
          </div>
          <span className={cn('text-2xl font-bold', scoreTone === 'green' ? 'text-emerald-600 dark:text-emerald-400' : scoreTone === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400')}>
            {score}/100
          </span>
        </div>
        <ProgressBar value={score} tone={scoreTone === 'green' ? 'green' : scoreTone === 'amber' ? 'amber' : 'red'} />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          {score >= 75 ? 'This contract is in good shape. Review remaining items before signing.' : score >= 50 ? 'Moderate concerns detected. Address the high-risk items before signing.' : 'Significant risks detected. Strongly recommend legal review before signing.'}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <p className="font-medium text-navy-900 dark:text-slate-100 mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-gold-500" /> Suggested Improvements</p>
          <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
            {r.improvements.map((x, i) => <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-2 flex-shrink-0" />{x}</li>)}
          </ul>
        </div>
        <div>
          <p className="font-medium text-navy-900 dark:text-slate-100 mb-2 flex items-center gap-2"><Handshake className="w-4 h-4 text-gold-500" /> Negotiation Tips</p>
          <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
            {r.negotiationTips.map((x, i) => <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-navy-400 mt-2 flex-shrink-0" />{x}</li>)}
          </ul>
        </div>
        <div>
          <p className="font-medium text-navy-900 dark:text-slate-100 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-gold-500" /> Legal Concerns</p>
          <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
            {r.legalConcerns.map((x, i) => <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />{x}</li>)}
          </ul>
        </div>
        <div>
          <p className="font-medium text-navy-900 dark:text-slate-100 mb-2 flex items-center gap-2"><HelpCircle className="w-4 h-4 text-gold-500" /> Questions to Ask a Lawyer</p>
          <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
            {r.questionsForLawyer.map((x, i) => <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />{x}</li>)}
          </ul>
        </div>
      </div>
    </Card>
  );
}

// ---- Document text viewer -----------------------------------------------

export function DocumentViewerSection({ text, name }: { text: string; name: string }) {
  const [open, setOpen] = useState(false);
  const preview = text.slice(0, 800);
  return (
    <Card>
      <CardHeader title="Document Preview" subtitle={name} icon={<FileText className="w-5 h-5" />} action={<Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)}>{open ? 'Collapse' : 'Expand'} <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} /></Button>} />
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
        {open ? text : preview + (text.length > 800 ? '…' : '')}
      </p>
    </Card>
  );
}
