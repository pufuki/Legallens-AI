import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ScrollText,
  FileText,
  ListChecks,
  ShieldAlert,
  ShieldQuestion,
  Users,
  Calendar,
  Sparkles,
  Upload,
  ArrowLeft,
  Eye,
  MessageSquare,
  GitCompare,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useDocuments } from '@/hooks/useDocuments';
import { cn, riskColor } from '@/utils/format';
import {
  SummarySection,
  ContractInfoSection,
  ClausesSection,
  RiskSection,
  MissingClausesSection,
  ObligationsSection,
  TimelineSection,
  RecommendationsSection,
  DocumentViewerSection,
} from '@/components/analysis/AnalysisSections';

const SECTIONS = [
  { id: 'summary', label: 'Summary', icon: ScrollText },
  { id: 'info', label: 'Contract Info', icon: FileText },
  { id: 'clauses', label: 'Clauses', icon: ListChecks },
  { id: 'risks', label: 'Risk Analysis', icon: ShieldAlert },
  { id: 'missing', label: 'Missing Clauses', icon: ShieldQuestion },
  { id: 'obligations', label: 'Obligations', icon: Users },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
  { id: 'document', label: 'Document', icon: Eye },
];

export function DashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { documents, analyses } = useDocuments();
  const [active, setActive] = useState('summary');

  const doc = useMemo(() => documents.find((d) => d.id === id) ?? documents[0], [documents, id]);
  const analysis = doc ? analyses[doc.id] : undefined;

  if (!doc || !analysis) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-navy-900 dark:text-slate-100 mb-2">No document analyzed yet</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Upload a legal document to see a full AI-powered analysis.</p>
          <Button variant="primary" size="lg" onClick={() => navigate('/upload')}>
            <Upload className="w-5 h-5" /> Upload a document
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const scrollTo = (sectionId: string) => {
    setActive(sectionId);
    document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const highCount = analysis.risks.filter((r) => r.level === 'high').length;

  return (
    <DashboardLayout
      action={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/chat')}><MessageSquare className="w-4 h-4" /> Chat</Button>
          {documents.length >= 1 && <Button variant="outline" size="sm" onClick={() => navigate('/compare')}><GitCompare className="w-4 h-4" /> Compare</Button>}
        </div>
      }
    >
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/upload')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-700 dark:hover:text-gold-400 mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to uploads
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-slate-100">{doc.name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {doc.pages} page{doc.pages > 1 ? 's' : ''} · {analysis.contractInfo.contractType} · Health score {analysis.recommendations.healthScore}/100
            </p>
          </div>
          <div className="flex gap-2">
            {highCount > 0 && <Badge tone="red">{highCount} high-risk</Badge>}
            <Badge tone="navy">{analysis.clauses.filter((c) => c.present).length} clauses</Badge>
            <Badge tone="amber">{analysis.missing.length} missing</Badge>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[200px_1fr] gap-6">
        {/* Sticky section nav */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left',
                  active === s.id
                    ? 'bg-navy-700 text-white dark:bg-navy-600'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-800'
                )}
              >
                <s.icon className="w-4 h-4 flex-shrink-0" />
                {s.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Sections */}
        <div className="space-y-6 min-w-0">
          <motion.div id="section-summary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><SummarySection analysis={analysis} /></motion.div>
          <motion.div id="section-info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}><ContractInfoSection analysis={analysis} /></motion.div>
          <motion.div id="section-clauses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}><ClausesSection analysis={analysis} /></motion.div>
          <motion.div id="section-risks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}><RiskSection analysis={analysis} /></motion.div>
          <motion.div id="section-missing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}><MissingClausesSection analysis={analysis} /></motion.div>
          <motion.div id="section-obligations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}><ObligationsSection analysis={analysis} /></motion.div>
          <motion.div id="section-timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}><TimelineSection analysis={analysis} /></motion.div>
          <motion.div id="section-recommendations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}><RecommendationsSection analysis={analysis} /></motion.div>
          <motion.div id="section-document" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}><DocumentViewerSection text={doc.text} name={doc.name} /></motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
