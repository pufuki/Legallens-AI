import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Sparkles, Lock, Zap, FileSearch, ArrowRight, Upload, GitBranch, Cpu, Database, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const STACK = [
  { icon: Cpu, name: 'React + Vite', desc: 'Frontend SPA with TypeScript' },
  { icon: FileSearch, name: 'FastAPI', desc: 'Python backend API' },
  { icon: Database, name: 'FAISS + SentenceTransformers', desc: 'In-memory vector retrieval' },
  { icon: Sparkles, name: 'OpenRouter', desc: 'LLM inference (deepseek-chat-v3)' },
  { icon: GitBranch, name: 'PyMuPDF + python-docx', desc: 'Document text extraction' },
];

const PRINCIPLES = [
  { icon: Lock, title: 'Privacy first', desc: 'Documents are processed in-memory and never persisted. No database, no accounts, no storage.' },
  { icon: Zap, title: 'Instant results', desc: 'Local embeddings and FAISS retrieval deliver grounded answers in seconds.' },
  { icon: ShieldCheck, title: 'Not legal advice', desc: 'LegalLens AI summarizes, explains, and highlights — it never replaces a qualified lawyer.' },
];

export function AboutPage() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-navy-800 dark:bg-navy-700 flex items-center justify-center mx-auto mb-5 shadow-float">
            <Scale className="w-8 h-8 text-gold-400" />
          </div>
          <Badge tone="gold" className="mb-3"><Sparkles className="w-3 h-3" /> About</Badge>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 dark:text-slate-100 mb-4">LegalLens AI</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            An AI-powered legal document analysis platform that helps legal professionals, startups, and businesses understand contracts faster. Upload a PDF or DOCX and receive instant summaries, risk analysis, clause detection, and side-by-side comparisons — powered by a Retrieval-Augmented Generation pipeline.
          </p>
        </motion.div>

        {/* Principles */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {PRINCIPLES.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card p-5 text-center">
              <div className="w-11 h-11 rounded-xl bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center mx-auto mb-3">
                <p.icon className="w-5 h-5 text-gold-600 dark:text-gold-400" />
              </div>
              <h3 className="font-medium text-navy-900 dark:text-slate-100 mb-1">{p.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Tech stack */}
        <div className="card p-6 mb-8">
          <h2 className="font-serif text-xl font-semibold text-navy-900 dark:text-slate-100 mb-4">Technology stack</h2>
          <div className="space-y-3">
            {STACK.map((s) => (
              <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-800/50">
                <div className="w-9 h-9 rounded-lg bg-navy-100 dark:bg-navy-800 flex items-center justify-center"><s.icon className="w-4 h-4 text-gold-500" /></div>
                <div>
                  <p className="font-medium text-sm text-navy-900 dark:text-slate-100">{s.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RAG explanation */}
        <div className="card p-6 mb-8">
          <h2 className="font-serif text-xl font-semibold text-navy-900 dark:text-slate-100 mb-3">How the RAG pipeline works</h2>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {[
              'Extract text from PDF or DOCX',
              'Clean and normalize the text',
              'Split into semantic chunks',
              'Generate local embeddings with all-MiniLM-L6-v2',
              'Store vectors in FAISS (in-memory only)',
              'Retrieve the most relevant chunks for each query',
              'Send retrieved context to the OpenRouter LLM',
              'Return a grounded answer and destroy all data',
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-navy-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 mb-8">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>Disclaimer:</strong> LegalLens AI is a demonstration project. It does not provide legal advice and should not replace a qualified lawyer. Always consult legal counsel for binding decisions.
          </p>
        </div>

        <div className="text-center">
          <Link to="/upload"><Button variant="gold" size="lg"><Upload className="w-5 h-5" /> Get started <ArrowRight className="w-4 h-4" /></Button></Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
