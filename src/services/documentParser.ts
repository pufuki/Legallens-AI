// Client-side document parsing for PDF and DOCX.
// PDFs are parsed with pdfjs-dist; DOCX with mammoth. Everything stays in memory.

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Use the worker bundled by pdfjs-dist via Vite's ?url import.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
export const ACCEPTED_TYPES = ['application/pdf', '.pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx'];

export interface ParsedDocument {
  name: string;
  size: number;
  type: string;
  pages: number;
  text: string;
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

export function isAccepted(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type === 'application/pdf' ||
    name.endsWith('.pdf') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  );
}

async function parsePdf(file: File): Promise<ParsedDocument> {
  try {
    const buffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    const doc = await loadingTask.promise;
    const pages = doc.numPages;
    const textParts: string[] = [];
    for (let i = 1; i <= pages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items
        .map((item) => ('str' in item ? (item as { str: string }).str : ''))
        .filter(Boolean);
      textParts.push(strings.join(' '));
      page.cleanup();
    }
    await loadingTask.destroy();
    const text = textParts.join('\n\n');
    if (!text.trim()) throw new ParseError('No readable text found — the PDF may be a scanned image or encrypted.');
    return { name: file.name, size: file.size, type: 'pdf', pages, text };
  } catch (e) {
    if (e instanceof ParseError) throw e;
    throw new ParseError(
      'Could not read this PDF. It may be corrupted, encrypted, or password-protected.'
    );
  }
}

async function parseDocx(file: File): Promise<ParsedDocument> {
  try {
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    const text = result.value;
    if (!text.trim()) throw new ParseError('No readable text found in this DOCX file.');
    // Estimate pages from word count (~500 words/page)
    const words = text.split(/\s+/).length;
    const pages = Math.max(1, Math.ceil(words / 500));
    return { name: file.name, size: file.size, type: 'docx', pages, text };
  } catch (e) {
    if (e instanceof ParseError) throw e;
    throw new ParseError('Could not read this DOCX file. It may be corrupted.');
  }
}

export async function parseDocument(file: File): Promise<ParsedDocument> {
  if (file.size > MAX_FILE_SIZE) {
    throw new ParseError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 20 MB.`);
  }
  if (!isAccepted(file)) {
    throw new ParseError('Unsupported file type. Please upload a PDF or DOCX file.');
  }
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return parsePdf(file);
  if (name.endsWith('.docx')) return parseDocx(file);
  throw new ParseError('Unsupported file type. Please upload a PDF or DOCX file.');
}
