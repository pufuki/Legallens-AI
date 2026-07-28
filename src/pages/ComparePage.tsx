import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitCompare, Upload, ArrowRight, Plus, Minus, Edit3, ShieldAlert, FileText } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader } from '@/components/ui/Card';
import { useDocuments } from '@/hooks/useDocuments';
import { compareDocuments } from '@/services/analyzer';
import { riskColor, cn } from '@/utils/format';

export function ComparePage() {
  const navigate = useNavigate();
  const { documents, analyses } = useDocuments();
  const [docAId, setDocAId] = useState<string>('');
  const [docBId, setDocBId] = useState<string>('');

  const docA = documents.find((d) => d.id === docAId);
  const docB = documents.find((d) => d.id === docBId);
  const analysisA = docA ? analyses[docA.id] : undefined;
  const analysisB = docB ? analyses[docB.id] : undefined;

  const comparison = useMemo(() => {
    if (!analysisA || !analysisB) return null;
    return compareDocuments(analysisA, analysisB);
  }, [analysisA, analysisB]);

  if (documents.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center mx-auto mb-4">
            <GitCompare className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-navy-900 dark:text-slate-100 mb-2">Upload documents to compare</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Upload at least two legal documents to compare their clauses, risks, and differences.</p>
          <Button variant="primary" size="lg" onClick={() => navigate('/upload')}><Upload className="w-5 h-5" /> Upload documents</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-slate-100 flex items-center gap-2">
          <GitCompare className="w-7 h-7 text-gold-500" /> Compare Contracts
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select two documents to see added, removed, and modified clauses.</p>
      </div>

      {/* Document selectors */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {(['A', 'B'] as const).map((label) => {
          const selectedId = label === 'A' ? docAId : docBId;
          const selected = documents.find((d) => d.id === selectedId);
          const otherId = label === 'A' ? docBId : docAId;
          return (
            <Card key={label} className="p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Document {label}</p>
              {selected ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-gold-500 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{selected.name}</span>
                  </div>
                  <button onClick={() => (label === 'A' ? setDocAId('') : setDocBId(''))} className="text-xs text-slate-400 hover:text-red-500">Change</button>
                </div>
              ) : (
                <select
                  value={selectedId}
                  onChange={(e) => (label === 'A' ? setDocAId(e.target.value) : setDocBId(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-gold-400/40"
                >
                  <option value="">Select a document…</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id} disabled={d.id === otherId}>
                      {d.name}
                    </option>
                  ))}
                </select>
              )}
            </Card>
          );
        })}
      </div>

      {comparison ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader title="Summary of Differences" icon={<GitCompare className="w-5 h-5" />} />
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{comparison.summary}</p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <Stat icon={<Plus className="w-4 h-4" />} label="Added" value={comparison.added.length} tone="green" />
              <Stat icon={<Minus className="w-4 h-4" />} label="Removed" value={comparison.removed.length} tone="red" />
              <Stat icon={<Edit3 className="w-4 h-4" />} label="Modified" value={comparison.modified.length} tone="amber" />
            </div>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Added */}
            <Card>
              <CardHeader title="Added in B" icon={<Plus className="w-5 h-5 text-emerald-500" />} action={<Badge tone="green">{comparison.added.length}</Badge>} />
              {comparison.added.length === 0 ? <Empty text="No clauses added." /> : (
                <ul className="space-y-2">
                  {comparison.added.map((c) => <li key={c} className="flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{c}</li>)}
                </ul>
              )}
            </Card>
            {/* Removed */}
            <Card>
              <CardHeader title="Removed in B" icon={<Minus className="w-5 h-5 text-red-500" />} action={<Badge tone="red">{comparison.removed.length}</Badge>} />
              {comparison.removed.length === 0 ? <Empty text="No clauses removed." /> : (
                <ul className="space-y-2">
                  {comparison.removed.map((c) => <li key={c} className="flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{c}</li>)}
                </ul>
              )}
            </Card>
            {/* Modified */}
            <Card>
              <CardHeader title="Modified" icon={<Edit3 className="w-5 h-5 text-amber-500" />} action={<Badge tone="amber">{comparison.modified.length}</Badge>} />
              {comparison.modified.length === 0 ? <Empty text="No clauses modified." /> : (
                <ul className="space-y-2">
                  {comparison.modified.map((m, i) => <li key={i} className="text-sm"><span className="font-medium">{m.clause}</span><p className="text-xs text-slate-500 mt-0.5">{m.difference}</p></li>)}
                </ul>
              )}
            </Card>
          </div>

          {/* Risk differences */}
          {comparison.riskDifferences.length > 0 && (
            <Card>
              <CardHeader title="Risk Differences" subtitle="Clauses with changed risk levels" icon={<ShieldAlert className="w-5 h-5" />} />
              <div className="space-y-2">
                {comparison.riskDifferences.map((r, i) => {
                  const ca = riskColor(r.docA);
                  const cb = riskColor(r.docB);
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-800/50">
                      <span className="font-medium text-sm flex-1">{r.clause}</span>
                      <Badge tone={r.docA === 'high' ? 'red' : r.docA === 'medium' ? 'amber' : 'green'}>{r.docA}</Badge>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <Badge tone={r.docB === 'high' ? 'red' : r.docB === 'medium' ? 'amber' : 'green'}>{r.docB}</Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </motion.div>
      ) : (
        <Card className="text-center py-12">
          <GitCompare className="w-10 h-10 text-slate-300 dark:text-navy-700 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Select two documents above to generate a comparison.</p>
        </Card>
      )}
    </DashboardLayout>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: 'green' | 'red' | 'amber' }) {
  const tones = { green: 'text-emerald-600 dark:text-emerald-400', red: 'text-red-600 dark:text-red-400', amber: 'text-amber-600 dark:text-amber-400' };
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-navy-800/50">
      <div className={cn(tones[tone])}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 uppercase">{label}</p>
        <p className={cn('text-lg font-semibold', tones[tone])}>{value}</p>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-slate-400 italic">{text}</p>;
}
