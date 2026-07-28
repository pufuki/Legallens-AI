import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ScrollText,
  ShieldAlert,
  ListChecks,
  GitCompare,
  MessageSquare,
  Users,
  Calendar,
  Sparkles,
  FileSearch,
  ArrowRight,
  Upload,
  ShieldQuestion,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const FEATURES = [
  { icon: ScrollText, title: 'Executive Summary', desc: 'Generate short, detailed, bulleted, and plain-English summaries of any contract instantly.', points: ['Short summary', 'Detailed summary', 'Bullet summary', 'Plain-English explanation'] },
  { icon: FileSearch, title: 'Contract Information', desc: 'Extract contract type, parties, dates, jurisdiction, currency, and important numbers.', points: ['Contract type & purpose', 'Parties involved', 'Effective, termination & renewal dates', 'Jurisdiction, duration & currency'] },
  { icon: ListChecks, title: 'Clause Detection', desc: 'Automatically identify 15+ clause types including confidentiality, termination, IP, and more.', points: ['Confidentiality & NDA', 'Termination & Liability', 'IP & Payment Terms', 'Governing Law & Force Majeure'] },
  { icon: ShieldAlert, title: 'Risk Analysis', desc: 'Highlight high, medium, and low risk clauses with explanations and suggested improvements.', points: ['Risk-level classification', 'Why it is risky', 'Possible consequences', 'Suggested improvements'] },
  { icon: ShieldQuestion, title: 'Missing Clauses', desc: 'Based on contract type, suggest clauses that are missing but should be included.', points: ['Contract-type aware', 'Why each clause matters', 'Recommended language', 'Priority guidance'] },
  { icon: Users, title: 'Obligation Extraction', desc: 'Create tables of obligations for each party including deadlines, payments, and deliverables.', points: ['Party A obligations', 'Party B obligations', 'Deadlines & payments', 'Deliverables & responsibilities'] },
  { icon: Calendar, title: 'Timeline', desc: 'Automatically generate a timeline of effective dates, renewals, expirations, and milestones.', points: ['Effective & renewal dates', 'Expiry & termination', 'Payment dates', 'Milestones'] },
  { icon: GitCompare, title: 'Compare Contracts', desc: 'Upload two contracts and see added, removed, modified clauses and risk differences.', points: ['Added clauses', 'Removed clauses', 'Modified clauses', 'Risk differences & summary'] },
  { icon: MessageSquare, title: 'AI Chat', desc: 'Ask questions about your uploaded contracts and get answers grounded in the document.', points: ['"What are my payment obligations?"', '"Who can terminate this?"', '"Is there an NDA?"', '"Who owns the IP?"'] },
  { icon: Sparkles, title: 'AI Recommendations', desc: 'Get suggested improvements, negotiation tips, legal concerns, and a contract health score.', points: ['Suggested improvements', 'Negotiation tips', 'Questions for a lawyer', 'Contract health score'] },
  { icon: TrendingUp, title: 'RAG Pipeline', desc: 'Retrieval-Augmented Generation with local embeddings and FAISS in-memory retrieval.', points: ['Local all-MiniLM-L6-v2 embeddings', 'FAISS in-memory index', 'Context-grounded answers', 'No data persistence'] },
  { icon: Upload, title: 'Secure Upload', desc: 'Drag-and-drop PDF and DOCX with graceful error handling for unsupported or corrupted files.', points: ['PDF & DOCX support', '20 MB max size', 'Drag & drop or browse', 'Graceful error handling'] },
];

export function FeaturesPage() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Badge tone="gold" className="mb-3"><Sparkles className="w-3 h-3" /> Capabilities</Badge>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 dark:text-slate-100 mb-3">Features</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Ten analysis capabilities plus a RAG pipeline and secure upload — everything you need to review legal contracts with AI.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card p-6 hover:shadow-float hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-gold-500" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-navy-900 dark:text-slate-100 mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{f.desc}</p>
              <ul className="space-y-1.5">
                {f.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="w-1 h-1 rounded-full bg-gold-400 mt-1.5 flex-shrink-0" />{p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/upload"><Button variant="gold" size="lg"><Upload className="w-5 h-5" /> Try it now <ArrowRight className="w-4 h-4" /></Button></Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
