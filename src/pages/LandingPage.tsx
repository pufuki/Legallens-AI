import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scale,
  ArrowRight,
  Upload,
  ScrollText,
  ShieldAlert,
  GitCompare,
  MessageSquare,
  Sparkles,
  FileSearch,
  ListChecks,
  Calendar,
  Users,
  Lock,
  Zap,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';

const FEATURES = [
  { icon: ScrollText, title: 'Executive Summaries', desc: 'Short, detailed, bulleted, and plain-English summaries in seconds.' },
  { icon: ShieldAlert, title: 'Risk Analysis', desc: 'High, medium, and low risk flags with consequences and suggestions.' },
  { icon: ListChecks, title: 'Clause Detection', desc: '15+ clause types automatically identified and explained.' },
  { icon: GitCompare, title: 'Contract Comparison', desc: 'Diff two contracts — added, removed, and modified clauses.' },
  { icon: MessageSquare, title: 'AI Chat', desc: 'Ask questions and get answers grounded in your documents.' },
  { icon: Users, title: 'Obligation Extraction', desc: 'Duties, deadlines, and deliverables for each party.' },
];

const STEPS = [
  { icon: Upload, title: 'Upload', desc: 'Drag and drop a PDF or DOCX. Files stay in your browser.' },
  { icon: FileSearch, title: 'Analyze', desc: 'Our RAG pipeline extracts, chunks, and indexes your contract.' },
  { icon: Sparkles, title: 'Review', desc: 'Get summaries, risks, clauses, obligations, and recommendations.' },
];

const FAQ = [
  { q: 'Is my document data safe?', a: 'Yes. In this demo, documents are parsed entirely in your browser memory and never uploaded to a server. Nothing is saved after you leave the page.' },
  { q: 'Does this provide legal advice?', a: 'No. LegalLens AI summarizes, explains, and highlights — it never provides legal advice. Always consult a qualified lawyer for legal decisions.' },
  { q: 'What file types are supported?', a: 'PDF and DOCX files up to 20 MB each. Encrypted or scanned PDFs without a text layer may not produce results.' },
  { q: 'Can I compare two contracts?', a: 'Yes. Upload two documents and use the Compare page to see added, removed, and modified clauses plus risk differences.' },
  { q: 'What powers the analysis?', a: 'A Retrieval-Augmented Generation pipeline with local embeddings (all-MiniLM-L6-v2) and FAISS in-memory retrieval, augmented by an OpenRouter LLM.' },
];

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      {/* Nav */}
      <nav className="sticky top-0 z-40 glass border-b border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/features" className="text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white">Features</Link>
            <Link to="/about" className="text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white">About</Link>
            <Link to="/upload" className="text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white">Upload</Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/upload"><Button variant="gold" size="sm">Get Started <ArrowRight className="w-4 h-4" /></Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-gold-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-navy-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge tone="gold" className="mb-5"><Sparkles className="w-3 h-3" /> AI-powered legal document analysis</Badge>
            <h1 className="font-serif text-4xl sm:text-6xl font-bold text-navy-900 dark:text-slate-100 mb-5 text-balance leading-tight">
              Understand any contract in <span className="gradient-text">seconds</span>, not hours.
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 text-balance">
              Upload your legal documents and instantly receive AI-powered summaries, risk analysis, clause detection, and side-by-side comparisons — all in your browser.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/upload"><Button variant="gold" size="lg"><Upload className="w-5 h-5" /> Analyze a document</Button></Link>
              <Link to="/features"><Button variant="outline" size="lg">Explore features <ArrowRight className="w-5 h-5" /></Button></Link>
            </div>
          </motion.div>

          {/* Floating mock card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="glass-strong rounded-2xl shadow-float p-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center"><Scale className="w-4 h-4 text-gold-400" /></div>
                <div>
                  <p className="text-sm font-medium text-navy-900 dark:text-slate-100">Employment_Agreement.pdf</p>
                  <p className="text-xs text-slate-500">Analysis complete · 8 pages</p>
                </div>
                <Badge tone="green" className="ml-auto"><CheckCircle2 className="w-3 h-3" /> Health: 72/100</Badge>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800/50">
                  <p className="text-xs text-slate-500 uppercase mb-1">Clauses</p>
                  <p className="text-2xl font-bold text-navy-800 dark:text-slate-100">12<span className="text-sm text-slate-400">/15</span></p>
                </div>
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30">
                  <p className="text-xs text-slate-500 uppercase mb-1">High risk</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">2</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30">
                  <p className="text-xs text-slate-500 uppercase mb-1">Missing</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">3</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <Badge tone="navy" className="mb-3">Features</Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 dark:text-slate-100 mb-3">Everything you need to review contracts</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">From summaries to risk analysis to side-by-side comparison, LegalLens AI covers the full contract review workflow.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card p-6 hover:shadow-float hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-gold-500" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-navy-900 dark:text-slate-100 mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-navy-900 dark:bg-navy-950 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge tone="gold" className="mb-3">How it works</Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">Three steps to clarity</h2>
            <p className="text-slate-400 max-w-xl mx-auto">No accounts, no servers, no setup. Just upload and analyze.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="glass rounded-2xl p-6 border border-navy-700">
                  <div className="w-12 h-12 rounded-xl bg-gold-400/20 flex items-center justify-center mb-4">
                    <s.icon className="w-6 h-6 text-gold-400" />
                  </div>
                  <p className="text-xs text-gold-400 font-semibold mb-1">Step {i + 1}</p>
                  <h3 className="font-serif text-xl font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-400">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 text-navy-600"><ArrowRight className="w-6 h-6" /></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: Lock, title: 'Private by design', desc: 'Documents never leave your browser in this demo.' },
            { icon: Zap, title: 'Instant analysis', desc: 'Summaries and risks in seconds, not hours.' },
            { icon: Sparkles, title: 'RAG-powered', desc: 'Local embeddings + FAISS retrieval for grounded answers.' },
          ].map((t) => (
            <div key={t.title}>
              <div className="w-12 h-12 rounded-xl bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center mx-auto mb-3">
                <t.icon className="w-6 h-6 text-gold-600 dark:text-gold-400" />
              </div>
              <h3 className="font-medium text-navy-900 dark:text-slate-100">{t.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-serif text-3xl font-bold text-navy-900 dark:text-slate-100 text-center mb-10">Frequently asked questions</h2>
        <div className="space-y-3">
          {FAQ.map((f, i) => (
            <div key={i} className="card overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                <span className="font-medium text-navy-900 dark:text-slate-100">{f.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-300">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="glass-strong rounded-3xl p-10 shadow-float">
          <h2 className="font-serif text-3xl font-bold text-navy-900 dark:text-slate-100 mb-3">Ready to analyze your first contract?</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">No sign-up required. Upload and get started instantly.</p>
          <Link to="/upload"><Button variant="gold" size="lg"><Upload className="w-5 h-5" /> Start analyzing</Button></Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-navy-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-xs text-slate-400">LegalLens AI — For demonstration only. Not legal advice.</p>
          <div className="flex gap-4 text-sm">
            <Link to="/features" className="text-slate-500 hover:text-navy-700 dark:hover:text-gold-400">Features</Link>
            <Link to="/about" className="text-slate-500 hover:text-navy-700 dark:hover:text-gold-400">About</Link>
            <Link to="/upload" className="text-slate-500 hover:text-navy-700 dark:hover:text-gold-400">Upload</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
