# CredDev — The Credibility Layer for Developers

**Verify skills. Generate intelligence. Build trust.**

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green)
![Python](https://img.shields.io/badge/Python-3.11+-yellow)

---

## What is CredDev?

CredDev is a developer credibility platform that pulls real data from GitHub, LeetCode, LinkedIn, and resumes — then uses AI to generate three intelligence reports delivered as PDFs to the candidate's inbox.

Just verified, fact-based developer analysis.

---

## How It Works

```
User submits form (GitHub, LeetCode, LinkedIn, Resume)
        ↓
Phase 1: Extraction — fetch raw data from each platform
        ↓
Phase 2: Generation — LLM analyzes raw data, produces 3 reports
        ↓
PDF reports emailed to the candidate
```

### Three Reports Generated

1. **Comprehensive Technical Report** — deep-dive with inline citations, 4-domain analysis, VERIFIED/PLAUSIBLE/CLAIMED classification
2. **Developer Growth Insight** — career positioning, skill gaps, actionable 30-60 day focus areas
3. **Recruiter Hiring Signal** — screening clarity, interview guidance, risk assessment, hire/no-hire confidence

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router), TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui, Radix UI
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Hosting**: Vercel — [cred-dev17.vercel.app](https://cred-dev17.vercel.app)

### Backend
- **API**: FastAPI (Python 3.11+)
- **AI**: OpenAI GPT with guardrails system
- **Database**: Supabase (PostgreSQL) via SQLAlchemy
- **Email**: Brevo (production), SMTP (local dev)
- **PDF**: reportlab for styled PDF generation
- **Hosting**: Render — [cred-dev-production.onrender.com](https://cred-dev-production.onrender.com)

---

## Project Structure

```
cred-dev/
├── app/                              # Next.js App Router pages
│   ├── page.tsx                      # Landing page
│   ├── try/                          # /try — report generation flow
│   │   ├── page.tsx
│   │   └── _components/              # Co-located route components
│   │       ├── try-flow.tsx          # State machine: form → extract → generate → success
│   │       ├── try-form.tsx          # Input form (5 fields + resume upload)
│   │       └── generation-loader.tsx # Animated progress display
│   ├── recruiters/                   # /recruiters — "coming soon" recruiter page
│   │   ├── page.tsx
│   │   └── _components/              # Co-located route components
│   ├── about/                        # /about — team + origin story
│   ├── report/                       # Static sample report pages
│   └── layout.tsx
├── components/
│   ├── sections/                     # Landing page sections
│   │   ├── hero.tsx                  # Developer-focused hero with branding
│   │   ├── how-it-works.tsx          # 3-step process
│   │   ├── problem-validation.tsx    # Rotating pain point quotes
│   │   └── footer.tsx               # CTA + copyright
│   ├── shared/                       # Reusable across pages
│   │   ├── brand.tsx                 # CredDev logo + gradient name
│   │   ├── back-link.tsx             # Back navigation
│   │   ├── gradient-text.tsx
│   │   └── waitlist-count.tsx        # Real-time waitlist counter
│   └── ui/                           # shadcn/ui primitives
├── lib/                              # Frontend utilities
│   ├── api.ts                        # Backend API client
│   ├── use-generation-progress.ts    # SSE hook for real-time progress
│   ├── supabase.ts                   # Supabase client
│   └── utils.ts
├── server/cred-service/              # FastAPI backend (see server README)
└── reports/                          # Sample analysis reports
```

---

## Getting Started

### Frontend

```bash
npm install
npm run dev
# → http://localhost:3000
```

**Environment variables** (`.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CRED_SERVICE_API_URL=http://localhost:8000   # backend URL
```

### Backend

```bash
cd server/cred-service
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Environment variables** (`.env` in `server/cred-service/`):
```bash
# Database (Supabase pooler URL recommended)
CRED_SERVICE_DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres

# APIs
GITHUB_TOKEN=ghp_xxx
OPENAI_API_KEY=sk-xxx

# Email (choose one)
BREVO_API_KEY=xkeysib-xxx          # Production (Brevo)
SMTP_HOST=smtp.gmail.com           # Local dev (SMTP)
SMTP_USER=your@gmail.com
SMTP_PASSWORD=your-app-password
```

See [`server/cred-service/README.md`](server/cred-service/README.md) for full backend documentation.

---

## Deployment

| Service  | Platform | URL |
|----------|----------|-----|
| Frontend | Vercel   | `cred-dev17.vercel.app` |
| Backend  | Render   | `cred-dev-production.onrender.com` |
| Database | Supabase | PostgreSQL (pooler connection) |

### Key deployment notes

- Backend needs the Supabase **pooler URL** (`pooler.supabase.com:6543`), not the direct connection — cloud platforms can't reach Supabase's IPv6 addresses
- Set `NEXT_PUBLIC_CRED_SERVICE_API_URL` in Vercel to point to the Render backend URL
- CORS is configured to allow `localhost:3000` and `cred-dev17.vercel.app`
- SMTP is blocked on cloud platforms — use Brevo (HTTP API) in production

---

## License

Private project — All rights reserved.

---

**Made with 💜 by the CredDev team**

*"We don't sell candidates. We verify them."*
