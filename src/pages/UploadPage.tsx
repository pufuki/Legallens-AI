import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  FileStack,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useDocuments } from '@/hooks/useDocuments';
import { formatBytes } from '@/utils/format';
import { MAX_FILE_SIZE, isAccepted } from '@/services/documentParser';

const STEPS = [
  'Extracting text from document…',
  'Cleaning and normalizing text…',
  'Splitting into semantic chunks…',
  'Generating local embeddings…',
  'Indexing chunks in FAISS (in-memory)…',
  'Retrieving relevant passages…',
  'Analyzing clauses and risks…',
  'Generating summary and recommendations…',
];

export function UploadPage() {
  const navigate = useNavigate();
  const { documents, addFiles, uploading, error, removeDocument } = useDocuments();
  const [dragOver, setDragOver] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files);
      setStepIndex(0);
      const stepTimer = setInterval(() => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1)), 700);
      await addFiles(arr);
      clearInterval(stepTimer);
    },
    [addFiles]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const validateAndAdd = useCallback(
    (files: File[]) => {
      const errors: string[] = [];
      const valid: File[] = [];
      for (const f of files) {
        if (!isAccepted(f)) errors.push(`${f.name}: unsupported format (PDF or DOCX only).`);
        else if (f.size > MAX_FILE_SIZE) errors.push(`${f.name}: exceeds 20 MB limit.`);
        else valid.push(f);
      }
      if (valid.length) handleFiles(valid);
      return errors;
    },
    [handleFiles]
  );

  return (
    <DashboardLayout
      action={
        documents.length > 0 ? (
          <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}>
            View Analysis <ArrowRight className="w-4 h-4" />
          </Button>
        ) : undefined
      }
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 dark:text-slate-100 mb-2">
            Upload your legal document
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Drag and drop a PDF or DOCX file. Analysis runs in your browser — nothing is saved.
          </p>
        </div>

        {/* Dropzone */}
        <motion.div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
            dragOver
              ? 'border-gold-400 bg-gold-50/50 dark:bg-gold-900/10 scale-[1.01]'
              : 'border-slate-300 dark:border-navy-700 hover:border-gold-400/60 hover:bg-slate-50 dark:hover:bg-navy-900/40'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) validateAndAdd(Array.from(e.target.files));
              e.target.value = '';
            }}
          />
          <motion.div
            animate={{ y: dragOver ? -6 : 0 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-16 h-16 rounded-2xl bg-navy-800 dark:bg-navy-700 flex items-center justify-center shadow-float">
              <UploadCloud className="w-8 h-8 text-gold-400" />
            </div>
            <div>
              <p className="font-medium text-navy-900 dark:text-slate-100">
                Drop your document here, or <span className="text-gold-600 dark:text-gold-400">browse</span>
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                PDF or DOCX · up to 20 MB · up to 2 documents
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Processing animation */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 card p-5 overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4">
                <Spinner />
                <p className="font-medium text-navy-900 dark:text-slate-100">Analyzing document…</p>
              </div>
              <div className="space-y-2">
                {STEPS.map((step, i) => (
                  <div
                    key={step}
                    className={`flex items-center gap-2 text-sm transition-opacity ${
                      i <= stepIndex ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    {i < stepIndex ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : i === stepIndex ? (
                      <Spinner size={14} />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-navy-700" />
                    )}
                    <span className={i <= stepIndex ? 'text-navy-700 dark:text-slate-200' : 'text-slate-400'}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Uploaded documents list */}
        {documents.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-xl font-semibold text-navy-900 dark:text-slate-100 flex items-center gap-2">
                <FileStack className="w-5 h-5 text-gold-500" />
                Uploaded documents
              </h2>
              <Badge tone="navy">{documents.length} document{documents.length > 1 ? 's' : ''}</Badge>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {documents.map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="card p-4 flex items-center gap-4"
                  >
                    <div className="w-11 h-11 rounded-xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-navy-700 dark:text-gold-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-navy-900 dark:text-slate-100 truncate">{doc.name}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{doc.pages} page{doc.pages > 1 ? 's' : ''}</span>
                        <span>·</span>
                        <span>{formatBytes(doc.size)}</span>
                        <span>·</span>
                        <span className="uppercase">{doc.type}</span>
                      </div>
                    </div>
                    <Badge tone="green">
                      <CheckCircle2 className="w-3 h-3" /> Analyzed
                    </Badge>
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button variant="primary" size="lg" className="flex-1" onClick={() => navigate('/dashboard')}>
                <Sparkles className="w-5 h-5" />
                View full analysis
              </Button>
              {documents.length >= 1 && (
                <Button variant="outline" size="lg" onClick={() => navigate('/compare')}>
                  Compare contracts
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Empty state tips */}
        {documents.length === 0 && !uploading && (
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { icon: '🔒', title: 'Private by design', desc: 'Files are parsed in-memory and never uploaded to a server.' },
              { icon: '⚡', title: 'Instant analysis', desc: 'Summaries, risks, and clauses in seconds.' },
              { icon: '📊', title: 'Compare & chat', desc: 'Upload two contracts to compare, then ask questions.' },
            ].map((f) => (
              <div key={f.title} className="card p-4">
                <div className="text-2xl mb-2">{f.icon}</div>
                <p className="font-medium text-navy-900 dark:text-slate-100 text-sm">{f.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
