import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Users,
  Lock,
  Zap,
  CheckCircle2,
  ChevronDown,
  ShieldCheck,
  Cpu,
  FileCheck,
  Clock,
  Plus,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';

const FEATURES = [
  {
    icon: ScrollText,
    title: 'Executive Summaries',
    desc: 'Generate short, detailed, bulleted, and plain-English contract summaries in seconds.',
    tag: 'RAG Pipeline',
  },
  {
    icon: ShieldAlert,
    title: 'Risk Identification',
    desc: 'Automatically flag high, medium, and low-risk clauses with legal impact explanations.',
    tag: 'Automated',
  },
  {
    icon: ListChecks,
    title: '15+ Clause Detection',
    desc: 'Extract and categorize Indemnification, Termination, IP Rights, Confidentiality, and more.',
    tag: 'Heuristics + LLM',
  },
  {
    icon: GitCompare,
    title: 'Side-by-Side Comparison',
    desc: 'Compare two contract versions to spot added, removed, or modified terms instantly.',
    tag: 'Diff Engine',
  },
  {
    icon: MessageSquare,
    title: 'Grounded AI Chat Assistant',
    desc: 'Ask questions about your uploaded agreements backed by exact document context.',
    tag: 'FAISS Vector Search',
  },
  {
    icon: Users,
    title: 'Party Obligation Matrix',
    desc: 'Extract structured tables detailing duties, payment schedules, and key deliverables.',
    tag: 'Structured Output',
  },
];

const METRICS = [
  { value: '100%', label: 'In-Browser Privacy', detail: 'Zero cloud document storage' },
  { value: '15+', label: 'Clause Types Detected', detail: 'Indemnity, IP, Liability, Termination' },
  { value: '< 2s', label: 'Local RAG Processing', detail: 'FAISS in-memory vector index' },
  { value: '0 Bytes', label: 'Server File Footprint', detail: 'Complete memory-only parsing' },
];

const STEPS = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload Contract',
    desc: 'Drag & drop your PDF or DOCX agreement. Parsing happens in-browser.',
  },
  {
    step: '02',
    icon: Cpu,
    title: 'RAG Indexing',
    desc: 'Text is chunked, embedded locally, and stored in an in-memory vector store.',
  },
  {
    step: '03',
    icon: FileCheck,
    title: 'Instant Intelligence',
    desc: 'Receive executive summaries, risk scores, clause breakdowns, and AI chat answers.',
  },
];

const FAQ = [
  {
    q: 'Is my document data kept private?',
    a: 'Yes, 100%. All PDF and DOCX parsing occurs in-browser memory. Document text and vector indexes are destroyed when you close or reload the browser session. No files are saved to any database.',
  },
  {
    q: 'Does LegalLens AI provide formal legal advice?',
    a: 'No. LegalLens AI is an analytical tool built to assist review workflows. It summarizes, flags risks, and extracts key terms, but should always be paired with professional legal counsel.',
  },
  {
    q: 'What document formats and limits are supported?',
    a: 'LegalLens AI supports standard .pdf and .docx files up to 20 MB each. You can upload multiple contracts simultaneously to compare them side-by-side.',
  },
  {
    q: 'How does the RAG pipeline work without sending full files to third parties?',
    a: 'The document text is split into semantic chunks and embedded locally using MiniLM-L6-v2. Only relevant retrieved passages are passed to the OpenRouter LLM context when answering specific queries.',
  },
];

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'summary' | 'risks' | 'obligations'>('summary');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-navy-900 dark:text-slate-100 selection:bg-gold-400/30">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200/80 dark:border-navy-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/features" className="text-slate-600 dark:text-slate-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
              Features
            </Link>
            <Link to="/about" className="text-slate-600 dark:text-slate-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
              Architecture
            </Link>
            <Link to="/upload" className="text-slate-600 dark:text-slate-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
              Workspace
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/upload">
              <Button variant="gold" size="sm" className="shadow-md">
                Launch Workspace <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Structural Outer Container with Vertical Architectural Lines */}
      <div className="max-w-7xl mx-auto border-x border-slate-200/60 dark:border-navy-800/60 relative">
        {/* Decorative Architectural Crosshair Pluses */}
        <div className="hidden lg:block absolute -top-3 -left-3 z-10 text-slate-400 dark:text-navy-700">
          <Plus className="w-6 h-6" />
        </div>
        <div className="hidden lg:block absolute -top-3 -right-3 z-10 text-slate-400 dark:text-navy-700">
          <Plus className="w-6 h-6" />
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 sm:pt-24 pb-20 border-b border-slate-200/70 dark:border-navy-800/70">
          <div className="absolute inset-0 grid-bg opacity-75 pointer-events-none" />

          {/* Ambient Lighting Orbs */}
          <div className="absolute top-12 left-1/4 w-96 h-96 bg-gold-400/10 dark:bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-32 right-1/4 w-80 h-80 bg-navy-600/10 dark:bg-navy-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative px-4 sm:px-6 max-w-5xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-sm text-xs font-semibold text-gold-600 dark:text-gold-400 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                <span>Enterprise Legal Document Intelligence</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-navy-950 dark:text-slate-50 mb-6 leading-[1.15]">
                Contract Review at the <br className="hidden sm:inline" />
                <span className="gradient-text font-serif italic">Speed of Thought.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
                Instantly extract executive summaries, flag critical risk clauses, compare contract revisions, and query your agreements with a private in-memory RAG pipeline.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/upload" className="w-full sm:w-auto">
                  <Button variant="gold" size="lg" className="w-full sm:w-auto shadow-float text-base px-8 py-3.5">
                    <Upload className="w-5 h-5" /> Analyze Contract Now
                  </Button>
                </Link>
                <Link to="/features" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-6 py-3.5">
                    View Architecture & Features <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>

              {/* Security reassurance badge */}
              <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>100% Client-Side Privacy · No Files Uploaded to Storage</span>
              </div>
            </motion.div>

            {/* Interactive Live Mockup Viewer */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="mt-14 max-w-4xl mx-auto text-left"
            >
              <div className="rounded-2xl glass-strong border border-slate-300/80 dark:border-navy-700 shadow-float overflow-hidden">
                {/* Header bar of window */}
                <div className="bg-slate-100/90 dark:bg-navy-900/90 px-4 py-3 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                    </div>
                    <div className="h-4 w-px bg-slate-300 dark:bg-navy-700" />
                    <div className="flex items-center gap-2 text-xs font-medium text-navy-800 dark:text-slate-200">
                      <Scale className="w-4 h-4 text-gold-500" />
                      <span>Software_Services_Agreement_2026.docx</span>
                    </div>
                  </div>
                  <Badge tone="green" className="text-xs">
                    <CheckCircle2 className="w-3 h-3" /> Contract Health Score: 84/100
                  </Badge>
                </div>

                {/* Sub-nav tabs inside mockup */}
                <div className="bg-slate-50/50 dark:bg-navy-900/50 px-4 py-2 border-b border-slate-200/80 dark:border-navy-800 flex items-center gap-2 text-xs font-medium">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'summary'
                        ? 'bg-navy-800 text-white dark:bg-gold-500 dark:text-navy-950 font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-navy-800'
                    }`}
                  >
                    Executive Summary
                  </button>
                  <button
                    onClick={() => setActiveTab('risks')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'risks'
                        ? 'bg-navy-800 text-white dark:bg-gold-500 dark:text-navy-950 font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-navy-800'
                    }`}
                  >
                    Risk Audit (2 High)
                  </button>
                  <button
                    onClick={() => setActiveTab('obligations')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'obligations'
                        ? 'bg-navy-800 text-white dark:bg-gold-500 dark:text-navy-950 font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-navy-800'
                    }`}
                  >
                    Party Obligations
                  </button>
                </div>

                {/* Tab content area */}
                <div className="p-6 bg-white dark:bg-navy-950/90 text-sm">
                  <AnimatePresence mode="wait">
                    {activeTab === 'summary' && (
                      <motion.div
                        key="summary"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="space-y-4"
                      >
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          <strong>Summary:</strong> This Master Services Agreement establishes a 24-month software licensing term between <strong>Acme Cloud Inc.</strong> and <strong>Vanguard Global</strong>. Total contract value is estimated at <strong>$145,000 USD</strong>.
                        </p>
                        <div className="grid sm:grid-cols-3 gap-3 pt-2">
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200/70 dark:border-navy-800">
                            <span className="text-xs uppercase text-slate-500 font-semibold">Jurisdiction</span>
                            <p className="text-sm font-semibold text-navy-900 dark:text-slate-100 mt-0.5">Delaware, USA</p>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200/70 dark:border-navy-800">
                            <span className="text-xs uppercase text-slate-500 font-semibold">Termination Notice</span>
                            <p className="text-sm font-semibold text-navy-900 dark:text-slate-100 mt-0.5">30 Days Written</p>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200/70 dark:border-navy-800">
                            <span className="text-xs uppercase text-slate-500 font-semibold">Auto-Renewal</span>
                            <p className="text-sm font-semibold font-mono text-gold-600 dark:text-gold-400 mt-0.5">Enabled (Annual)</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'risks' && (
                      <motion.div
                        key="risks"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="space-y-3"
                      >
                        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-3">
                          <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-semibold text-red-900 dark:text-red-200">Uncapped Liability Limit (Clause 14.2)</span>
                            <p className="text-xs text-red-700 dark:text-red-300 mt-1">Section 14.2 removes liability caps for data breach claims. Suggest negotiating a 2x annual fee cap.</p>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
                          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-semibold text-amber-900 dark:text-amber-200">Broad IP Assignment (Clause 9.1)</span>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Pre-existing background IP is not explicitly excluded from customer deliverables.</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'obligations' && (
                      <motion.div
                        key="obligations"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="overflow-x-auto"
                      >
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-navy-800 text-slate-500 font-medium">
                              <th className="pb-2">Party</th>
                              <th className="pb-2">Obligation Duty</th>
                              <th className="pb-2">Deadline</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                            <tr>
                              <td className="py-2.5 font-semibold text-navy-900 dark:text-slate-100">Acme Cloud</td>
                              <td className="py-2.5 text-slate-600 dark:text-slate-300">Deliver SOC-2 Type II audit report</td>
                              <td className="py-2.5 font-mono text-slate-500">Within 15 days of signing</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 font-semibold text-navy-900 dark:text-slate-100">Vanguard Global</td>
                              <td className="py-2.5 text-slate-600 dark:text-slate-300">Pay initial subscription invoice ($36,250)</td>
                              <td className="py-2.5 font-mono text-slate-500">Net 30 days</td>
                            </tr>
                          </tbody>
                        </table>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Executive Metrics Bar with Horizontal Border Dividers */}
        <section className="border-b border-slate-200/70 dark:border-navy-800/70 bg-white/60 dark:bg-navy-900/40">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200/70 dark:divide-navy-800/70 text-center">
            {METRICS.map((m) => (
              <div key={m.label} className="p-8">
                <p className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 dark:text-slate-50 mb-1">{m.value}</p>
                <p className="text-sm font-semibold text-navy-800 dark:text-slate-200">{m.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{m.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Grid Section with Clean Architectural Dividers */}
        <section className="py-24 px-4 sm:px-6 border-b border-slate-200/70 dark:border-navy-800/70">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge tone="navy" className="mb-3">
              Core Capabilities
            </Badge>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-navy-950 dark:text-slate-50 tracking-tight mb-4">
              Comprehensive Contract Intelligence
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
              Designed specifically for legal counsel, founders, and procurement teams who need deep document clarity without reading thousands of lines.
            </p>
          </div>

          {/* Bento Grid with Border Lines */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x border-t border-b border-slate-200/80 dark:border-navy-800/80">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="p-8 group hover:bg-slate-100/50 dark:hover:bg-navy-900/50 transition-colors relative"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-navy-900 dark:bg-navy-800 text-gold-400 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold px-2 py-0.5 rounded bg-slate-200/60 dark:bg-navy-800">
                    {f.tag}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-slate-100 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow Section */}
        <section className="py-24 px-4 sm:px-6 bg-slate-100/70 dark:bg-navy-950 text-navy-950 dark:text-white relative overflow-hidden border-b border-slate-200/80 dark:border-navy-800 transition-colors">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge tone="gold" className="mb-3">
              Workflow
            </Badge>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold mb-4 text-navy-950 dark:text-slate-50">
              Three Steps to Contract Clarity
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
              No software downloads or server configuration needed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative group">
                <div className="bg-white dark:bg-navy-900/90 rounded-2xl p-8 border border-slate-200/80 dark:border-navy-700/80 shadow-md hover:shadow-lg transition-all flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-2xl font-bold text-gold-600 dark:text-gold-400">{s.step}</span>
                      <div className="w-10 h-10 rounded-xl bg-gold-400/10 dark:bg-gold-400/20 flex items-center justify-center text-gold-600 dark:text-gold-400">
                        <s.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="font-serif text-xl font-bold mb-2 text-navy-950 dark:text-white">{s.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{s.desc}</p>
                  </div>
                </div>

                {/* Connecting Arrows between steps */}
                {i < STEPS.length - 1 && (
                  <>
                    {/* Desktop Arrow */}
                    <div className="hidden md:flex absolute top-1/2 -right-6 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-md items-center justify-center text-gold-500">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    {/* Mobile Down Arrow */}
                    <div className="md:hidden flex justify-center py-3 text-gold-500">
                      <ChevronDown className="w-6 h-6 animate-bounce" />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-4 sm:px-6 border-b border-slate-200/70 dark:border-navy-800/70">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <Badge tone="navy" className="mb-3">
                Questions & Answers
              </Badge>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 dark:text-slate-100">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {FAQ.map((f, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left font-medium text-navy-950 dark:text-slate-100 hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
                  >
                    <span className="font-serif text-lg">{f.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                        openFaq === i ? 'rotate-180 text-gold-500' : ''
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-navy-800/60 pt-3 leading-relaxed">
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-20 px-4 sm:px-6 text-center">
          <div className="max-w-4xl mx-auto glass-strong rounded-3xl p-10 sm:p-14 border border-slate-300 dark:border-navy-700 shadow-float relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-navy-950 dark:text-slate-50 mb-4">
              Start Analyzing Contracts Instantly
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto mb-8 text-base">
              Test LegalLens AI with sample contracts or your own PDF/DOCX files. No account registration required.
            </p>
            <Link to="/upload">
              <Button variant="gold" size="lg" className="shadow-float text-base px-8 py-3.5">
                <Upload className="w-5 h-5" /> Launch Workspace
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 dark:border-navy-800/80 py-10 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <Logo />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              LegalLens AI · Designed for legal document analysis demonstration · Not formal legal advice.
            </p>
            <div className="flex gap-6 text-sm font-medium">
              <Link to="/features" className="text-slate-600 dark:text-slate-300 hover:text-gold-500">
                Features
              </Link>
              <Link to="/about" className="text-slate-600 dark:text-slate-300 hover:text-gold-500">
                About
              </Link>
              <Link to="/upload" className="text-slate-600 dark:text-slate-300 hover:text-gold-500">
                Upload
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
