import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { DocumentAnalysis, UploadedDocument } from '@/types';
import { analyzeDocument } from '@/services/analyzer';
import { parseDocument, ParseError } from '@/services/documentParser';
import { uid } from '@/utils/format';

interface UploadResult {
  document: UploadedDocument;
  analysis: DocumentAnalysis;
}

interface DocumentsContextValue {
  documents: UploadedDocument[];
  analyses: Record<string, DocumentAnalysis>;
  uploading: boolean;
  error: string | null;
  addFiles: (files: File[]) => Promise<UploadResult[]>;
  removeDocument: (id: string) => void;
  clearAll: () => void;
  getAnalysis: (id: string) => DocumentAnalysis | undefined;
}

const DocumentsContext = createContext<DocumentsContextValue | undefined>(undefined);

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, DocumentAnalysis>>({});
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(async (files: File[]): Promise<UploadResult[]> => {
    setUploading(true);
    setError(null);
    const results: UploadResult[] = [];
    try {
      for (const file of files) {
        try {
          const parsed = await parseDocument(file);
          const id = uid();
          const doc: UploadedDocument = {
            id,
            file,
            name: parsed.name,
            size: parsed.size,
            type: parsed.type,
            pages: parsed.pages,
            text: parsed.text,
            uploadedAt: Date.now(),
          };
          const analysis = analyzeDocument(id, parsed.text);
          setDocuments((prev) => [...prev, doc]);
          setAnalyses((prev) => ({ ...prev, [id]: analysis }));
          results.push({ document: doc, analysis });
        } catch (e) {
          const msg = e instanceof ParseError ? e.message : 'Failed to process file.';
          setError(msg);
        }
      }
    } finally {
      setUploading(false);
    }
    return results;
  }, []);

  const removeDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setAnalyses((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setDocuments([]);
    setAnalyses({});
  }, []);

  const getAnalysis = useCallback((id: string) => analyses[id], [analyses]);

  const value = useMemo(
    () => ({ documents, analyses, uploading, error, addFiles, removeDocument, clearAll, getAnalysis }),
    [documents, analyses, uploading, error, addFiles, removeDocument, clearAll, getAnalysis]
  );

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
}

export function useDocuments(): DocumentsContextValue {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error('useDocuments must be used within DocumentsProvider');
  return ctx;
}
