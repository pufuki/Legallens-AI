import { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { MessageSquare, Send, Upload, Sparkles, FileText, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useDocuments } from '@/hooks/useDocuments';
import { answerQuestion } from '@/services/analyzer';
import { uid, cn } from '@/utils/format';
import type { ChatMessage } from '@/types';

const SUGGESTED = [
  'What are my payment obligations?',
  'Who can terminate this agreement?',
  'Is there an NDA?',
  'Who owns the IP?',
  'When does it expire?',
  'What are the key risks?',
];

export function ChatPage() {
  const navigate = useNavigate();
  const { documents } = useDocuments();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const doc = useMemo(() => documents.find((d) => d.id === selectedDocId) ?? documents[0], [documents, selectedDocId]);

  useEffect(() => {
    if (doc) setSelectedDocId(doc.id);
  }, [doc]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const send = (text: string) => {
    if (!text.trim() || !doc) return;
    const userMsg: ChatMessage = { id: uid(), role: 'user', content: text, createdAt: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const answer = answerQuestion(doc.text, text);
      const aiMsg: ChatMessage = { id: uid(), role: 'assistant', content: answer, createdAt: Date.now() };
      setMessages((m) => [...m, aiMsg]);
      setThinking(false);
    }, 600 + Math.random() * 500);
  };

  if (documents.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-navy-900 dark:text-slate-100 mb-2">Upload a document to chat</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Ask questions about your contracts once you upload them.</p>
          <Button variant="primary" size="lg" onClick={() => navigate('/upload')}><Upload className="w-5 h-5" /> Upload a document</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      action={
        messages.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={() => setMessages([])}><Trash2 className="w-4 h-4" /> Clear</Button>
        ) : undefined
      }
    >
      <div className="max-w-3xl mx-auto h-[calc(100vh-180px)] flex flex-col">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-navy-900 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-gold-500" /> AI Chat
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Ask questions about your uploaded documents.</p>
          </div>
          {documents.length > 1 && (
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="p-2.5 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/40 max-w-[200px]"
            >
              {documents.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          )}
        </div>

        {doc && (
          <div className="mb-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <FileText className="w-3.5 h-3.5 text-gold-500" />
            <span>Chatting with: <span className="font-medium text-navy-700 dark:text-slate-200">{doc.name}</span></span>
            <Badge tone="navy">{doc.pages}p</Badge>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.length === 0 && !thinking && (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-gold-500" />
              </div>
              <p className="font-medium text-navy-900 dark:text-slate-100 mb-1">Ask anything about your contract</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Answers reference only the uploaded document.</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="px-3 py-2 rounded-xl text-sm bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-gold-100 dark:hover:bg-gold-900/30 hover:text-navy-800 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  m.role === 'user' ? 'bg-navy-700 text-white' : 'bg-gold-100 dark:bg-gold-900/40 text-gold-600 dark:text-gold-400'
                )}>
                  {m.role === 'user' ? <span className="text-xs font-bold">You</span> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'bg-navy-700 text-white rounded-tr-sm'
                    : 'bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-navy-700 rounded-tl-sm'
                )}>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {thinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gold-100 dark:bg-gold-900/40 flex items-center justify-center"><Sparkles className="w-4 h-4 text-gold-500" /></div>
              <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-2xl rounded-tl-sm px-4 py-3">
                <Spinner size={16} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="pt-3 border-t border-slate-200 dark:border-navy-800">
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your contract…"
              className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/40 text-navy-900 dark:text-slate-100 placeholder:text-slate-400"
            />
            <Button type="submit" variant="primary" size="md" disabled={!input.trim()}><Send className="w-4 h-4" /></Button>
          </form>
          <p className="text-xs text-slate-400 mt-2 text-center">LegalLens AI provides analysis, not legal advice. Consult a lawyer for legal decisions.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
