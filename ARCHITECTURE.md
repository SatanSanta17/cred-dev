# CredDev Architecture

> Last verified: 2026-03-08 — every file path, service, and dependency confirmed against actual code.

---

## High-Level Design (HLD)

### What CredDev Does

CredDev is a developer credibility verification platform. A candidate submits their GitHub, LeetCode URLs, any additional profile links (Kaggle, CodeChef, Codeforces, LinkedIn, HuggingFace, etc.), and a resume. CredDev extracts raw data from each platform, feeds it to an LLM (OpenAI GPT-5-mini with web search), and generates three credibility reports — one comprehensive, one for the developer, one for recruiters. Reports are emailed as PDFs.

### System Topology

```
┌──────────────────────┐       ┌──────────────────────-┐       ┌──────────────────┐
│   Next.js Frontend   │       │   FastAPI Backend     │       │    Supabase      │
│   (Vercel)           │──────▶│   (Render)            │──────▶│   (PostgreSQL +  │
│                      │       │                       │       │    Storage)      │
│   cred-dev17.        │       │   cred-dev-production │       │                  │
│   vercel.app         │       │   .up.render.com      │       │                  │
└──────────────────────┘       └───────┬───────────────┘       └──────────────────┘
                                       │
                          ┌────────────┼───────────────┐
                          │            │               │
                    ┌─────▼────┐ ┌─────▼──────┐  ┌─────▼──────┐
                    │ GitHub   │ │ LeetCode   │  │ OpenAI     │
                    │ GraphQL  │ │ GraphQL    │  │ GPT-5-mini │
                    │ API      │ │ API        │  │ + web      │
                    └──────────┘ └────────────┘  │ search     │
                                                 └────────────┘
                                       │
                                 ┌─────▼──────┐
                                 │ Brevo      │
                                 │ Email API  │
                                 └────────────┘
```

### Data Flow — End to End

```
User submits form (/try)
       │
       ▼
POST /api/v1/extract  (FormData: name, email, URLs, platform_urls JSON, resume PDF)
       │
       ├── Creates AnalysisJob (status: "pending")
       ├── Returns job_id immediately
       └── Background task: safe_extraction()
              │
              ├── Resume → PyPDF2 text extraction
              ├── GitHub → GitHubFetcher (GraphQL API)
              ├── LeetCode → LeetCodeFetcher (GraphQL API)
              └── Additional URLs → WebSearchFetcher (OpenAI web_search_preview per URL)
              │
              └── All raw data → raw_data table
                  Job status → "extracted"
       │
       ▼
Frontend polls GET /api/v1/extract/{job_id} every 3s (max 40 polls)
       │
       ▼ (when status = "extracted")
       │
POST /api/v1/generate/{job_id}
       │
       ├── Job status → "generating"
       ├── Initializes SSE progress tracking
       └── Background task: _run_generation_pipeline()
              │
              ├── Load raw data from DB
              ├── LLM call #1: Extensive Report (citations on)
              ├── LLM call #2: Developer Insight (natural prose)
              ├── LLM call #3: Recruiter Insight (natural prose)
              ├── Store reports in DB
              ├── Generate PDFs (reportlab)
              ├── Email PDFs via Brevo API
              └── Job status → "completed"
       │
       ▼
Frontend connected via SSE: GET /api/v1/generate/{job_id}/stream
       │
       └── Receives progress: loading_data → generating_extensive →
           generating_developer → generating_recruiter → storing →
           sending_email → completed
```

### Job Status State Machine

```
pending → extracting → extracted → generating → completed
   │          │                        │
   └──────────┴────────────────────────┴──→ failed
```

Allowed transitions for generation retry: `extracted`, `failed`, `completed` → `generating`.
The status `generating` is NOT allowed to re-trigger generation (prevents duplicates).

---

## Low-Level Design (LLD)

### Frontend — Next.js 16 on Vercel

**Framework:** Next.js 16.1.6, React 19.2.3, TypeScript, Tailwind CSS 4
**UI Library:** shadcn/ui (Radix primitives), Framer Motion, Lucide icons
**Forms:** react-hook-form + zod validation
**State:** Supabase client-side SDK (recruiter waitlist), sonner toasts

#### Page Routes

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Landing page — Hero, HowItWorks, ProblemValidation, Footer |
| `/try` | `app/try/page.tsx` | Report generation flow — TryForm → extracting → generating → success/error |
| `/recruiters` | `app/recruiters/page.tsx` | Recruiter-focused "coming soon" page — hero, product vision, quotes, waitlist form |
| `/about` | `app/about/page.tsx` | Team page (Burhanuddin, Mariya), origin story |
| `/report/Burhanuddin` | `app/report/Burhanuddin/page.tsx` | Honest sample report page — real data from actual CredDev report (VERIFIED/UNVERIFIED skills, LeetCode stats, production signals, risk flags). PDF download available. |
| `/report/Pradeep` | `app/report/Pradeep/page.tsx` | Static sample report page |

#### Key Frontend Components

| Component | File | Responsibility |
|-----------|------|----------------|
| `TryFlow` | `app/try/_components/try-flow.tsx` | Orchestrates the full form → extract → generate → success flow. State machine: `form` → `extracting` → `generating` → `success`/`error`. Manages polling with `MAX_POLLS=40` and `generationTriggered` guard flag. |
| `TryForm` | `app/try/_components/try-form.tsx` | Input form: name, email, GitHub URL, LeetCode URL, dynamic "Add Profile Link" section for additional URLs (auto-detects platform from domain), resume (PDF, max 10MB). Requires at least one profile URL or resume. |
| `GenerationLoader` | `app/try/_components/generation-loader.tsx` | Animated progress display — orbital animation, percentage counter, progress bar, stage messages. |
| `useGenerationProgress` | `lib/use-generation-progress.ts` | SSE hook — connects to `/api/v1/generate/{job_id}/stream`. Includes fallback messages that cycle every 30s if SSE disconnects. |
| `RecruiterWaitlistForm` | `app/recruiters/_components/recruiter-waitlist-form.tsx` | Recruiter-only waitlist form. Inserts into Supabase `waitlist` table with `user_type: 'recruiter'`. |
| `WaitlistCount` | `components/shared/waitlist-count.tsx` | Real-time count via Supabase Realtime subscription + 30s polling. Used on recruiter page only. |

#### API Client (`lib/api.ts`)

```
API_BASE = NEXT_PUBLIC_CRED_SERVICE_API_URL || 'http://localhost:8000'

submitExtraction(formData)      → POST /api/v1/extract        (FormData)
getExtractionStatus(jobId)      → GET  /api/v1/extract/{id}
triggerGeneration(jobId)        → POST /api/v1/generate/{id}
getGenerationStatus(jobId)      → GET  /api/v1/generate/{id}
getSSEUrl(jobId)                → builds SSE URL for EventSource
resendEmail(jobId)              → POST /api/v1/generate/{id}/resend-email
```

#### Frontend Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CRED_SERVICE_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |

---

### Backend — FastAPI on Render

**Framework:** FastAPI 0.104+, Uvicorn, SQLAlchemy 2.0, Pydantic 2.5
**Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
**Python:** 3.11+

#### API Endpoints

| Method | Path | Handler | Purpose |
|--------|------|---------|---------|
| POST | `/api/v1/extract` | `extract.extract_raw_data` | Accept form data (platform_urls JSON + legacy URL params) + resume, start background extraction |
| GET | `/api/v1/extract/{job_id}` | `extract.get_extraction_status` | Poll extraction status, returns raw data when done |
| POST | `/api/v1/generate/{job_id}` | `generate.generate_reports` | Trigger LLM report generation |
| GET | `/api/v1/generate/{job_id}` | `generate.get_generation_status` | Poll generation status, returns reports when done |
| GET | `/api/v1/generate/{job_id}/stream` | `stream.stream_generation_progress` | SSE endpoint for real-time progress |
| POST | `/api/v1/generate/{job_id}/resend-email` | `generate.resend_email` | Resend report emails for a completed job |
| GET | `/health` | `main.health_check` | Health check (used by Render) |

#### Service Layer

| Service | File | What It Does |
|---------|------|--------------|
| `ExtractionService` | `services/extraction.py` | Orchestrates data fetching from all platforms. Accepts `platform_urls` dict. Routes GitHub/LeetCode to dedicated fetchers, all other URLs to WebSearchFetcher. Each platform is independent — one failure doesn't block others. Marks job "extracted" when at least one source succeeds, "failed" only if ALL sources fail. |
| `GitHubFetcher` | `services/github_fetcher.py` | Two-query architecture: Query 1 fetches profile, 100 repos (lightweight), pinned repos, organizations, and language bytes. Query 2 fetches production readiness signals (README, Dockerfile, CI, tests, .env.example, dependency files) for the top 15 repos (by stars), batched in groups of 5 to stay within GitHub's query complexity limit. Returns raw merged response. Requires `GITHUB_TOKEN`. |
| `LeetCodeFetcher` | `services/leetcode_fetcher.py` | Single GraphQL query to LeetCode's public API. Returns raw response — submission stats, tag problem counts, contest ranking, recent submissions (100), badges. Uses browser-like headers. |
| `WebSearchFetcher` | `services/web_search_fetcher.py` | Generic profile data extractor for any URL. Calls OpenAI GPT-5-mini with `web_search_preview` tool to visit the URL and extract structured profile data (username, bio, stats, achievements, skills, projects). Returns parsed JSON or raw text on parse failure. Used for all platforms except GitHub and LeetCode. |
| `platform_utils` | `services/platform_utils.py` | Domain-to-platform detection utility. Maps URL hostnames to platform IDs (e.g., kaggle.com → "kaggle"). Provides `detect_platform()`, `get_platform_name()`, and `is_dedicated_platform()`. |
| `ResumeParser` | `services/resume_parser.py` | Extracts raw text from PDF using PyPDF2. No structured parsing — LLM does all reasoning from raw text. |
| `RawDataLoader` | `services/raw_data_loader.py` | Reads raw_data table rows for a job, returns dynamically-keyed dict based on whatever platforms were extracted (e.g., `{resume: {}, github: {}, leetcode: {}, kaggle: {}, ...}`). |
| `ReportGenerator` | `services/report_generator.py` | Calls OpenAI GPT-5-mini (with web_search_preview tool) three times — one per report type. System message includes 7 immutable guardrails and dynamically lists the actual platforms submitted. Extensive report uses inline citations; developer and recruiter reports use natural prose with end-of-report disclaimers. Supports streaming via `_call_llm_streaming()` with progress callbacks — falls back to non-streaming on failure. |
| `ReportStorageService` | `services/report_storage.py` | Stores 4 records per job: raw_signals (JSON), extensive_report, developer_insight, recruiter_insight (text). |
| `ProgressManager` | `services/progress_manager.py` | In-memory singleton dict. Maps job_id → {stage, percentage, message, timestamp}. SSE endpoint reads from this every 1 second. Supports `extra` dict merge, `update_message()` for live message changes, and `increment_percentage()` for smooth progress within stage ranges. |
| `get_email_service()` | `services/email_service.py` | Factory: Brevo (if `BREVO_API_KEY`) > Resend (if `RESEND_API_KEY`, deprecated) > SMTP (fallback). All three services share the same `send_reports(to_email, candidate_name, reports)` interface. |
| PDF Generation | `services/email_service.py` | `generate_report_pdf()` — converts markdown-like report text to styled PDFs using reportlab. CredDev branding (purple accent, header line, page footer). |

#### Error Handling

**Background task crash protection (`extract.py`):**
```python
async def safe_extraction():
    try:
        await extraction_service.run_extraction(...)
    except Exception as e:
        # Opens new DB session, marks job as "failed"
        # Prevents job from staying stuck on "pending" forever
```

**Frontend poll timeout:**
- MAX_POLLS = 40 (40 × 3s = ~2 minutes)
- `generationTriggered` flag prevents duplicate generation API calls

**Email is non-fatal:**
- Email failure in generation pipeline is caught and logged but doesn't fail the job
- Reports are still stored in DB even if email fails
- SSE progress includes `email_failed: true` flag so the frontend can show a resend button
- Users can retry email delivery via `POST /api/v1/generate/{job_id}/resend-email`

#### Logging

Centralized logging configured in `app/logging_config.py`, called on startup from `main.py`.

| Setting | Production (`DEBUG=false`) | Development (`DEBUG=true`) |
|---------|---------------------------|---------------------------|
| Format | JSON (one object per line) | Human-readable with timestamps |
| Level | `LOG_LEVEL` env var (default: INFO) | DEBUG |
| Output | stdout (captured by Render) | stdout |

Every `logger.error()` call includes `exc_info=True` for full stack traces. Pipeline logs use `job_id=` consistently so a single grep traces a full request lifecycle. Request logging middleware logs method, path, status code, and duration for every HTTP request (except `/health`).

#### LLM Guardrails (system message — all 3 reports)

1. **Verification Rule** — skill is VERIFIED only with explicit platform evidence
2. **No Hallucination Rule** — missing data = "data not available", never assumptions
3. **Date Awareness Rule** — today's date injected, experience calculated from resume dates
4. **Cross-Platform Activity Rule** — must combine signals from ALL submitted platforms together
5. **Company Source Rule** — work history from resume only, ignore GitHub company field
6. **Claims vs Proof Rule** — resume bullets are claims, platform data is evidence
7. **Output Format Rule** — no conversational sign-offs, document ends at final section
8. **Citation/Style Rule** — extensive: inline citations; developer/recruiter: natural prose

---

### Database Schema

**Engine:** PostgreSQL on Supabase (SQLite fallback for local dev)
**ORM:** SQLAlchemy 2.0 declarative
**Connection:** Supabase pooler URL (IPv6 workaround for cloud platforms)

#### Table: `analysis_jobs`

| Column | Type | Notes |
|--------|------|-------|
| `id` | String (PK) | UUID generated at creation |
| `candidate_name` | String | Default: "Anonymous Candidate" |
| `candidate_email` | String | For email delivery |
| `user_id` | String | Optional, for future auth |
| `status` | String | pending → extracting → extracted → generating → completed / failed |
| `created_at` | DateTime | |
| `updated_at` | DateTime | |
| `error_message` | Text | Null unless failed |
| `platform_urls` | JSON | All submitted URLs: `{"github": "...", "leetcode": "...", "kaggle": "...", ...}` |
| `resume_url` | String | Currently unused (resume sent as bytes) |
| `github_url` | String | Legacy — populated from platform_urls for backward compat |
| `leetcode_url` | String | Legacy — populated from platform_urls for backward compat |
| `linkedin_url` | String | Legacy — populated from platform_urls for backward compat |

#### Table: `raw_data`

| Column | Type | Notes |
|--------|------|-------|
| `id` | Integer (PK) | Auto-increment |
| `job_id` | String (FK → analysis_jobs.id) | |
| `data_type` | String | Any platform_id: "github", "leetcode", "resume", "kaggle", "linkedin", etc. |
| `data` | JSON | Raw platform response |
| `fetched_at` | DateTime | |

#### Table: `reports`

| Column | Type | Notes |
|--------|------|-------|
| `id` | Integer (PK) | Auto-increment |
| `job_id` | String (FK → analysis_jobs.id) | |
| `layer` | String | "raw_signals", "extensive_report", "developer_insight", "recruiter_insight" |
| `content` | Text | JSON string (raw_signals) or markdown text (reports) |
| `created_at` | DateTime | |

#### Table: `waitlist` (managed by Supabase, not in SQLAlchemy)

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | |
| `email` | String | Unique constraint (code 23505 on duplicate) |
| `user_type` | String | "developer" or "recruiter" |
| `github_profile` | String | Optional |
| `organization` | String | Optional |
| `willing_to_connect` | Boolean | |
| `created_at` | Timestamp | |

---

### Third-Party Services

| Service | Purpose | Auth | Free Tier |
|---------|---------|------|-----------|
| **GitHub GraphQL API** | Repos, PRs, contributions, profile, production signals | `GITHUB_TOKEN` (PAT) | 5,000 requests/hour (up to 4 calls per extraction) |
| **LeetCode GraphQL API** | Submissions, stats, contests, badges | No auth (browser headers) | Public endpoint |
| **OpenAI API** | GPT-5-mini with web_search_preview for report generation | `OPENAI_API_KEY` | Pay per token |
| **Brevo Transactional API** | Send PDF reports via email | `BREVO_API_KEY` | 300 emails/day |
| **Supabase** | PostgreSQL database + waitlist + Realtime | `CRED_SERVICE_DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_*` | 500MB DB, 1GB storage |
| **Vercel** | Frontend hosting | Git integration | Free tier |
| **Render** | Backend hosting | Git integration | Free tier (spins down after inactivity) |

---

### Backend Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `CRED_SERVICE_DATABASE_URL` | Yes (prod) | PostgreSQL connection string (use Supabase pooler URL) |
| `GITHUB_TOKEN` | Yes | GitHub Personal Access Token for GraphQL API |
| `OPENAI_API_KEY` | Yes | OpenAI API key for report generation |
| `BREVO_API_KEY` | Yes (prod) | Brevo API key for transactional email |
| `BREVO_FROM_EMAIL` | No | Sender email (default: cred.dev17@gmail.com) |
| `BREVO_FROM_NAME` | No | Sender name (default: CredDev) |
| `RESEND_API_KEY` | No | Deprecated — kept for future custom domain use |
| `SMTP_HOST` | No | Local dev email (e.g., smtp.gmail.com) |
| `SMTP_PORT` | No | Default: 587 |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASSWORD` | No | SMTP password / app password |
| `CORS_ORIGINS` | No | Default: ["http://localhost:3000", "https://cred-dev17.vercel.app"] |
| `DEBUG` | No | Default: false |

---

### Project Structure

```
cred-dev/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout — Geist fonts, dark mode, Toaster
│   ├── page.tsx                  # Landing page — assembles section components
│   ├── globals.css               # Tailwind styles
│   ├── try/                      # /try — report generation flow
│   │   ├── page.tsx
│   │   └── _components/          # Route-specific (co-located)
│   │       ├── try-flow.tsx      # Core: form → extract → generate → result
│   │       ├── try-form.tsx      # Input form with zod validation
│   │       └── generation-loader.tsx # Animated progress display
│   ├── recruiters/               # /recruiters — "coming soon" recruiter page
│   │   ├── page.tsx
│   │   └── _components/          # Route-specific (co-located)
│   │       ├── recruiter-hero.tsx          # Recruiter-focused hero
│   │       ├── product-vision.tsx          # What recruiters will get
│   │       ├── recruiter-quotes.tsx        # Recruiter pain point quotes
│   │       └── recruiter-waitlist-form.tsx # Recruiter-only waitlist
│   ├── about/                    # /about — team + origin story
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── report/                   # Static sample report pages
│       ├── Burhanuddin/page.tsx
│       └── Pradeep/page.tsx
├── components/
│   ├── sections/                 # Landing page sections only
│   │   ├── hero.tsx              # Landing: developer-focused hero with Brand
│   │   ├── how-it-works.tsx      # Landing: compact 3-step process
│   │   ├── problem-validation.tsx # Landing: rotating quotes from real conversations
│   │   └── footer.tsx            # Landing: condensed CTA + copyright
│   ├── shared/                   # Reusable components (used across pages)
│   │   ├── back-link.tsx         # Back navigation (used on /try, /report)
│   │   ├── brand.tsx             # CredDev logo icon + gradient name
│   │   ├── gradient-text.tsx
│   │   ├── quote-card.tsx        # Single quote card (used by QuotesCarousel)
│   │   ├── quotes-carousel.tsx   # Rotating quote carousel — desktop 3-col, mobile 1-card
│   │   └── waitlist-count.tsx    # Real-time waitlist counter
│   └── ui/                       # shadcn/ui primitives
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── progress.tsx
│       ├── select.tsx
│       └── textarea.tsx
├── lib/
│   ├── api.ts                    # Backend API client (fetch-based)
│   ├── supabase.ts               # Supabase client (waitlist only)
│   ├── use-generation-progress.ts # SSE hook with fallback messages
│   └── utils.ts                  # cn() utility for Tailwind
├── public/                       # Static assets
├── reports/                      # Sample/historical report outputs
│   ├── Burhanuddin/
│   ├── Gauri/
│   └── Pradeep/
├── server/cred-service/          # Python backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI app, CORS, logging setup, request middleware, health check
│   │   ├── config.py             # Pydantic Settings — all env vars
│   │   ├── logging_config.py     # Centralized logging — JSON (prod) / readable (dev)
│   │   ├── database.py           # SQLAlchemy models: AnalysisJob, RawData, Report
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── extract.py        # POST/GET /api/v1/extract — extraction + polling
│   │       ├── generate.py       # POST/GET /api/v1/generate — generation + polling
│   │       └── stream.py         # GET /api/v1/generate/{id}/stream — SSE progress
│   ├── services/
│   │   ├── __init__.py
│   │   ├── extraction.py         # ExtractionService — orchestrates all fetchers
│   │   ├── github_fetcher.py     # GitHub GraphQL — raw response
│   │   ├── leetcode_fetcher.py   # LeetCode GraphQL — raw response
│   │   ├── web_search_fetcher.py # Generic profile extractor via OpenAI web search
│   │   ├── platform_utils.py     # Domain-to-platform detection utility
│   │   ├── resume_parser.py      # PyPDF2 raw text extraction
│   │   ├── raw_data_loader.py    # Loads raw_data from DB for a job (dynamic keys)
│   │   ├── report_generator.py   # LLM calls — 3 reports, guardrails, dynamic platforms
│   │   ├── report_storage.py     # Stores/retrieves reports in DB
│   │   ├── progress_manager.py   # In-memory progress singleton for SSE
│   │   └── email_service.py      # 3 email services + PDF generation + factory
│   ├── models/
│   │   └── __init__.py           # Pydantic schemas (request/response)
│   ├── utils/
│   │   └── helpers.py            # URL extraction, validation utilities
│   └── requirements.txt          # Python dependencies
├── package.json                  # Node dependencies
├── README.md                     # Project overview
├── ARCHITECTURE.md               # This file
├── CLAUDE.md                     # Project instructions for Claude sessions
├── CHANGELOG.md                  # Version history
└── .gitignore
```

---

### Known Limitations and Technical Debt

1. **WebSearchFetcher depends on OpenAI web search** — quality varies by platform. Some profiles may return partial data if the page requires login.
2. **Resume URL field unused** — `resume_url` column exists but resume is always sent as bytes in the request body. No Supabase Storage integration yet.
3. **ProgressManager is in-memory** — lost on server restart. Works fine for single-instance Render but won't scale to multiple workers.
4. **No authentication** — anyone can submit. `user_id` column exists but isn't populated.
5. **helpers.py is unused** — ExtractionService has its own URL extraction methods inline.
6. **About page values section** — commented out with placeholder descriptions.
7. **Render cold starts** — free tier spins down after inactivity, first request takes 30-50 seconds.
8. **ReportGenerator model** — hardcoded to `gpt-5-mini`. Not configurable via env var.
