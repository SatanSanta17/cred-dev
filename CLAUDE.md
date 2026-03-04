# CredDev — Project Instructions

## First Steps Every Session

1. Read `ARCHITECTURE.md` before making any changes — it contains the full system design, file map, and data flow.
2. If modifying backend services, read the relevant service file first — don't assume from memory.
3. If modifying frontend flow, read `components/sections/try-flow.tsx` — it's the orchestrator.
4. Always take ask for plan confirmation before coding
5. Never make a document without being asked for explicitly 

## Project Overview

CredDev is a two-phase developer credibility platform:
- **Phase 1 (Extraction):** Fetch raw data from GitHub, LeetCode, LinkedIn, resume
- **Phase 2 (Generation):** LLM generates 3 reports → stored in DB → emailed as PDFs

Stack: Next.js 16 (Vercel) + FastAPI (Render) + Supabase (PostgreSQL) + OpenAI GPT-5-mini

## Critical Rules — Do NOT Violate

- **No code changes without a documented PRD.** Every feature, fix, or refactor must have a written PRD (Product Requirements Document) reviewed and approved before any code is touched. No exceptions — not even "small" changes.
- **Never add "generating" to allowed statuses in `generate.py`.** Allowed list is `["extracted", "failed", "completed"]`. The frontend `generationTriggered` flag prevents duplicate triggers. We explicitly decided this.
- **Never remove the `safe_extraction()` wrapper in `extract.py`.** It catches background task crashes and marks jobs as "failed". Without it, jobs get stuck on "pending" forever.
- **Never remove the `MAX_POLLS=40` limit or `generationTriggered` guard in `try-flow.tsx`.** These prevent infinite polling and duplicate generation calls.
- **Email failure must never fail the job.** In `generate.py`, the email send is wrapped in try/except — reports are still stored even if email fails.

## Backend Conventions

### Backend Services Architecture
- The backend is designed for multiple independent services under `server/`
- Currently only `server/cred-service/` exists (the credibility engine)
- Future services (e.g., user service) would live at `server/<service-name>/` with their own FastAPI app
- When adding a new module **within cred-service**, put it in `server/cred-service/services/`
- Follow the existing pattern: class with async methods, no global state
- Import in the route file, not in `__init__.py`

### Adding a New Route
- Create file in `server/cred-service/app/routes/`
- Register in `app/main.py` with `app.include_router(module.router, prefix="/api/v1", tags=[...])`

### Background Tasks
- Always wrap in a crash-safe function (see `safe_extraction()` pattern in `extract.py`)
- Open a new `SessionLocal()` in the wrapper's except block — the original DB session may be dead
- Mark the job as "failed" with an error message if the task crashes

### Database
- ORM: SQLAlchemy 2.0 declarative, defined in `app/database.py`
- Always use `SessionLocal()` for background tasks (not `Depends(get_db)`)
- For SSE/streaming endpoints, use short-lived sessions to avoid pinning connection pool slots

### Email Service
- Factory pattern: `get_email_service()` in `services/email_service.py`
- Priority: Brevo (production) > Resend (deprecated) > SMTP (local dev)
- All three implement the same interface: `send_reports(to_email, candidate_name, reports)`
- To add a new provider: create a class with `is_configured` property and `send_reports` method, add to factory

### LLM / Report Generation
- Model: `gpt-5-mini` with `web_search_preview` tool
- System message contains 7 immutable guardrails — do not weaken or remove them
- Extensive report uses inline citations; developer and recruiter reports use natural prose
- Raw platform data is passed directly to LLM — no pre-processing or scoring

## Frontend Conventions

### State Flow in /try
```
form → extracting → generating → success | error
```
- `try-flow.tsx` manages the state machine
- `try-form.tsx` handles input and validation
- `generation-loader.tsx` shows animated progress
- `use-generation-progress.ts` manages SSE connection with fallback messages

### API Calls
- All backend calls go through `lib/api.ts`
- Base URL from `NEXT_PUBLIC_CRED_SERVICE_API_URL` env var
- No auth headers — public API currently

### Waitlist
- Inserts directly into Supabase from client side via `lib/supabase.ts`
- Real-time count via Supabase Realtime subscriptions
- No backend involvement

## Deployment

### Frontend (Vercel)
- Auto-deploys from git push
- Env vars: `NEXT_PUBLIC_CRED_SERVICE_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Backend (Render)
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Must use Supabase **pooler URL** (not direct DB URL) — cloud platforms can't resolve IPv6
- SMTP ports are blocked on cloud platforms — must use HTTP-based email APIs (Brevo)
- Required env vars: `CRED_SERVICE_DATABASE_URL`, `GITHUB_TOKEN`, `OPENAI_API_KEY`, `BREVO_API_KEY`
- Health check: GET `/health`

## Testing Locally

```bash
# Frontend
cd cred-dev && npm run dev

# Backend
cd server/cred-service && uvicorn app.main:app --reload --port 8000
```

## After Making Changes

1. Update `ARCHITECTURE.md` if you changed any file structure, added routes, services, or env vars.
2. Verify all file references in documentation still exist.
3. If you modified the generation pipeline, test the full flow: submit form → extraction → generation → email.
