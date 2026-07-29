# LegalLens AI

**AI-Powered Legal Document Analysis Platform**

Upload legal documents and instantly receive AI-powered analysis — summaries, risk detection, clause extraction, obligation tables, timelines, contract comparison, and a chat assistant — powered by a Retrieval-Augmented Generation (RAG) pipeline.

Built for legal professionals, startups, and businesses who need to understand contracts faster.

---

## Project Overview

LegalLens AI helps users understand legal contracts without reading every word. Upload a PDF or DOCX and the application:

- Summarizes contracts (short, detailed, bullets, plain English)
- Extracts contract metadata (type, parties, dates, jurisdiction, currency)
- Detects 15+ clause types (confidentiality, termination, IP, liability, etc.)
- Highlights risky clauses with explanations and suggestions
- Identifies missing clauses based on contract type
- Extracts obligations for each party
- Generates a timeline of key dates
- Compares two contracts side-by-side
- Answers questions about uploaded documents via AI chat
- Generates recommendations and a contract health score

Everything runs in memory — no files are saved, no database, no user accounts.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)               │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Upload  │→│ Dashboard │→│  Compare  │  │   Chat   │  │
│  │   Page   │  │ (Analysis)│  │   Page   │  │   Page   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │              │              │              │       │
│       └──────────────┴──────────────┴──────────────┘       │
│                          │                                │
│              ┌───────────▼───────────┐                    │
│              │  Document Parser     │                    │
│              │  (PDF.js + Mammoth)  │                    │
│              └───────────┬───────────┘                    │
└──────────────────────────┼───────────────────────────────┘
                           │  (optional — frontend works standalone)
┌──────────────────────────▼───────────────────────────────┐
│                   Backend (FastAPI + Python)              │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ /upload  │  │ /summary │  │  /chat   │  │ /compare │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       └──────────────┴──────────────┴──────────────┘       │
│                          │                                │
│              ┌───────────▼───────────┐                    │
│              │     RAG Pipeline       │                    │
│              │  ┌─────────────────┐  │                    │
│              │  │  Chunker        │  │                    │
│              │  │  ↓              │  │                    │
│              │  │  Embeddings     │  │                    │
│              │  │  (MiniLM-L6)   │  │                    │
│              │  │  ↓              │  │                    │
│              │  │  FAISS Index    │  │                    │
│              │  │  (in-memory)    │  │                    │
│              │  │  ↓              │  │                    │
│              │  │  Retrieval      │  │                    │
│              │  └─────────────────┘  │                    │
│              └───────────┬───────────┘                    │
│                          │                                │
│              ┌───────────▼───────────┐                    │
│              │   OpenRouter LLM       │                    │
│              │   (deepseek-chat-v3)   │                    │
│              └───────────────────────┘                    │
└───────────────────────────────────────────────────────────┘
```

---

## Features

1. **Executive Summary** — Short, detailed, bullet, and plain-English summaries
2. **Contract Information** — Type, purpose, parties, dates, jurisdiction, currency, key numbers
3. **Clause Detection** — 15+ clause types in expandable cards
4. **Risk Analysis** — High/medium/low risk with consequences and suggestions
5. **Missing Clauses** — Contract-type-aware recommendations
6. **Obligation Extraction** — Two-party tables with deadlines, payments, deliverables
7. **Timeline** — Visual timeline of effective dates, renewals, milestones
8. **Compare Contracts** — Added, removed, modified clauses and risk differences
9. **AI Chat** — Ask questions grounded in uploaded documents
10. **AI Recommendations** — Improvements, negotiation tips, legal concerns, health score

---

## Folder Structure

```
legallens-ai/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Reusable UI primitives (Button, Card, Badge, etc.)
│   │   │   ├── layout/          # Sidebar, DashboardLayout
│   │   │   └── analysis/        # Analysis section components
│   │   ├── pages/               # Landing, Upload, Dashboard, Compare, Chat, About, 404
│   │   ├── hooks/               # useTheme, useDocuments
│   │   ├── services/            # documentParser, analyzer, openrouter
│   │   ├── utils/               # Formatting helpers
│   │   ├── types/               # TypeScript types
│   │   └── App.tsx              # Router + providers
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                     # FastAPI + Python backend
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py        # API endpoints
│   │   ├── core/
│   │   │   ├── config.py        # Central config (model name, limits)
│   │   │   └── prompts.py       # Legal system prompt
│   │   ├── services/
│   │   │   ├── document_parser.py  # PDF/DOCX extraction
│   │   │   ├── llm.py           # OpenRouter client
│   │   │   └── analyzer.py      # Heuristic analysis
│   │   ├── rag/
│   │   │   ├── chunker.py       # Text chunking
│   │   │   ├── embeddings.py    # Sentence-transformers
│   │   │   ├── vector_store.py  # FAISS in-memory index
│   │   │   └── pipeline.py      # Full RAG pipeline
│   │   ├── schemas/
│   │   │   └── models.py        # Pydantic schemas
│   │   ├── utils/
│   │   └── main.py              # FastAPI app entry point
│   ├── scripts/
│   │   └── download_datasets.py
│   ├── sample_data/
│   │   ├── sample_contracts/    # 10 synthetic contracts
│   │   └── README.md
│   ├── requirements.txt
│   └── .env.example
│
└── README.md
```

---

## Installation

### Prerequisites

- Node.js 18+
- Python 3.10+
- An OpenRouter API key (optional — the frontend works standalone with local heuristics)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and works standalone — documents are parsed in-browser and analyzed with local heuristics. No backend required for the demo.

### Backend (optional — for LLM-powered analysis)

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
uvicorn app.main:app --reload
```

The backend runs on `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

---

## Environment Variables

### Backend `.env`

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | (required for LLM features) |

All other settings (model name, chunk size, embedding model, etc.) are configured in `backend/app/core/config.py`.

---

## OpenRouter Setup

1. Create an account at [https://openrouter.ai](https://openrouter.ai)
2. Generate an API key at [https://openrouter.ai/keys](https://openrouter.ai/keys)
3. Add it to `backend/.env`:
   ```
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```
4. To switch models, edit `backend/app/core/config.py`:
   ```python
   openrouter_model: str = "deepseek/deepseek-chat-v3"  # change this line
   ```
   Popular alternatives: `openai/gpt-4o`, `anthropic/claude-3.5-sonnet`, `meta-llama/llama-3.1-70b-instruct`

The model name is stored in **one config file** and never hardcoded in services.

---

## How RAG Works

```
PDF/DOCX
   ↓
Extract text (PyMuPDF / python-docx)
   ↓
Clean and normalize text
   ↓
Split into semantic chunks (~500 chars, 80 overlap)
   ↓
Generate embeddings locally (all-MiniLM-L6-v2)
   ↓
Store vectors in FAISS (in-memory only)
   ↓
Retrieve top-k relevant chunks for each query
   ↓
Send retrieved context + question to OpenRouter LLM
   ↓
Return grounded answer
   ↓
Destroy all vectors and chunks (nothing persisted)
```

The RAG pipeline ensures answers are grounded in the actual document text, reducing hallucinations. If information is not in the retrieved context, the model is instructed to say: "Not found in the uploaded document."

---

## Dataset Sources

| Dataset | Source | License |
|---------|--------|---------|
| CUAD | https://github.com/TheAtticusProject/cuad | CC BY 4.0 |
| SEC EDGAR Contracts | https://www.sec.gov/edgar/search/ | Public domain |
| Kaggle Legal Contracts | https://www.kaggle.com/ | Varies (manual download) |

---

## Dataset Download Instructions

### Automatic (CUAD + SEC sample)

```bash
cd backend
python -m scripts.download_datasets
```

The script:
- Downloads datasets from official public sources where permitted
- Verifies successful download
- Organizes files into subdirectories
- Skips datasets that already exist
- Prints progress messages

### Manual (Kaggle)

Kaggle datasets are **not** downloaded automatically because:
1. Kaggle requires authentication (API token)
2. Many datasets restrict redistribution

To download manually:
1. Create a free Kaggle account
2. Visit a legal contract dataset page
3. Download and extract into `backend/sample_data/kaggle/`
4. Respect the dataset's license terms

---

## Synthetic Sample Contracts

The `backend/sample_data/sample_contracts/` directory contains 10 AI-generated synthetic contracts:

1. Employment Agreement
2. Non-Disclosure Agreement (NDA)
3. Software Development Agreement
4. SaaS Agreement
5. Consulting Agreement
6. Service Agreement
7. Vendor Agreement
8. Lease Agreement
9. Partnership Agreement
10. Freelancer Agreement

These are clearly labeled as synthetic and are for demonstration only.

---

## Backend API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check + config status |
| `/upload` | POST | Upload PDF/DOCX, returns full analysis |
| `/summary` | POST | Generate a summary (short/detailed/bullets/plain) |
| `/chat` | POST | Ask a question about a document |
| `/compare` | POST | Compare two contracts |
| `/docs` | GET | Interactive API documentation |

---

## Tech Stack

**Frontend:** React, Vite, TailwindCSS, React Router, Framer Motion, Lucide React, React Markdown, PDF.js, Mammoth, Axios

**Backend:** FastAPI, PyMuPDF, python-docx, SentenceTransformers, FAISS, NumPy, Pydantic, OpenRouter API, Uvicorn

---

## Future Improvements

- Multi-document RAG (query across several contracts at once)
- OCR support for scanned PDFs
- Export analysis as PDF report
- Clause-level redlining suggestions
- Multi-language contract support
- User annotation and collaboration
- Integration with e-signature platforms
- Fine-tuned legal embedding model
- Batch processing for contract portfolios

---

## Disclaimer

LegalLens AI is a demonstration project. It does **not** provide legal advice and should not replace a qualified lawyer. Always consult legal counsel for binding decisions.

