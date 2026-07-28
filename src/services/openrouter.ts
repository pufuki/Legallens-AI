// OpenRouter LLM integration.
// Reads OPENROUTER_API_KEY from env (Vite exposes VITE_ prefixed vars).
// In this hosted demo there is no key, so callers fall back to the local analyzer.
// When running locally with a backend, the FastAPI service handles OpenRouter calls.

import axios from 'axios';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Vite env var (optional). The real key lives in the backend .env.
const API_KEY = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_OPENROUTER_API_KEY ?? '';

export const DEFAULT_MODEL = 'deepseek/deepseek-chat-v3';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export function isLLMConfigured(): boolean {
  return Boolean(API_KEY);
}

export async function callLLM(messages: LLMMessage[], options: LLMOptions = {}): Promise<string> {
  if (!API_KEY) {
    throw new Error('OpenRouter API key not configured. Set VITE_OPENROUTER_API_KEY or use the backend.');
  }
  const res = await axios.post(
    OPENROUTER_URL,
    {
      model: options.model ?? DEFAULT_MODEL,
      messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 1500,
    },
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'LegalLens AI',
      },
      timeout: 60000,
    }
  );
  return res.data?.choices?.[0]?.message?.content ?? '';
}

// Prompt engineering helpers — keep legal-disclaimer framing consistent.
export const LEGAL_SYSTEM_PROMPT = `You are LegalLens AI, a legal document analysis assistant.
You analyze contracts that are provided to you in context.
Rules:
- Never provide legal advice. You summarize, explain, identify, highlight, recommend, and warn.
- Base every answer ONLY on the provided document context.
- If information is not present in the context, say exactly: "Not found in the uploaded document."
- Avoid hallucinations. Do not invent clauses, dates, parties, or terms.
- Be precise, professional, and neutral.`;
