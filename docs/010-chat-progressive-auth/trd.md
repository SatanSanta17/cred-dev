# TRD-010: Chat Interface + Progressive Authentication

**Status:** Draft
**Created:** 2026-03-24
**Mirrors:** `prd.md` in this folder

---

## Tech Stack Decisions

| Concern | Decision | Rationale |
|---------|----------|-----------|
| Auth provider | Supabase Auth | Already in the stack for waitlist. Built-in OAuth, JWT, session management. Free tier covers this. No new infrastructure. |
| OAuth methods | GitHub + Google | Developer audience uses GitHub. Google covers everyone else. Two providers, maximum coverage, minimum complexity. |
| Auth state (frontend) | Supabase JS SDK + React context | SDK handles tokens, refresh, persistence. Context exposes state to all components per CLAUDE.md auth conventions. |
| Auth validation (backend) | PyJWT + JWKS (ES256) | Asymmetric JWT validation via Supabase's JWKS endpoint. `PyJWKClient` fetches and caches the public signing key — the backend can only *verify* tokens, never forge them. Lazy initialization + hourly refresh handles key rotation. Dual algorithm support (ES256 primary, HS256 fallback). Single `Depends()` function, no new auth server. |
| Chat state machine | Client-side TypeScript | Deterministic in Phase 1 — no LLM needed. Runs entirely in the browser. Discriminated union type for states per CLAUDE.md TypeScript patterns. |
| Chat UI | Co-located route components | Private to the chat route. Follows existing `_components/` co-location pattern. |
| PDF delivery | Backend-generated PDFs served via API | Existing `generate_report_pdf()` in email service already creates PDFs. New endpoint serves them as downloadable files. |

---

## Database Changes

**No new tables.** Supabase Auth manages `auth.users` internally.

**No schema migrations.** The only change is populating an existing column:
- `analysis_jobs.user_id` — currently always `NULL`. After auth, populated with the Supabase Auth user ID (`UUID` string from `auth.users.id`).

**Query path for report history:**
`user → analysis_jobs (WHERE user_id = ?) → reports (WHERE job_id = ?)` — this chain already works with the existing schema and foreign keys.

---

## New Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `SUPABASE_PROJECT_REF` | Backend `.env` (optional) | Supabase project reference ID, used to construct the JWKS endpoint URL (`https://{ref}.supabase.co/auth/v1/jwks`). If not set, derived automatically from `CRED_SERVICE_SUPABASE_URL`. Found in Supabase Dashboard → Project Settings → General. |

Frontend uses existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — no new frontend env vars. No `SUPABASE_JWT_SECRET` needed — the backend uses asymmetric JWKS validation (public key only), not symmetric HS256.

---

## Part 1: Auth Infrastructure + Chat UI Shell

### Frontend — Auth Module

**New file: `lib/supabase-auth.ts`** ✅ Implemented
Auth helper wrapping the existing Supabase JS SDK client (`lib/supabase.ts`):
- `signInWithProvider(provider: OAuthProvider, redirectTo?)` — generic OAuth trigger for any provider (`'github' | 'google'`). Defaults redirect to `/chat`.
- `signOut()` — `supabase.auth.signOut()`
- `getSession()` — returns current `Session` or null
- `getUser()` — returns current `User` or null (swallows auth errors for unauthenticated state)
- `getAccessToken()` — convenience wrapper, returns `session.access_token` or null
- `onAuthStateChange(callback)` — subscribes to auth events, returns unsubscribe function for cleanup

**New file: `lib/auth-context.tsx`** ✅ Implemented
`'use client'` React context provider:
- State: `user: User | null`, `session: Session | null`, `isAuthenticated: boolean`, `isLoading: boolean`
- Actions: `signIn(provider: OAuthProvider)`, `signOut()`
- On mount: calls `getSession()` to restore existing session with mounted-flag guard to prevent state updates after unmount
- Subscribes to `onAuthStateChange` to keep state in sync across tabs
- Uses `useCallback` for stable `signIn`/`signOut` references
- Wraps the app in `app/layout.tsx` (wired in layout)
- Exported: `AuthProvider` component + `useAuth()` hook (throws if used outside provider)

**New file: `components/shared/auth-modal.tsx`**
`'use client'` modal component:
- Props: `interface AuthModalProps { isOpen: boolean; onClose: () => void; onSuccess: () => void }`
- Renders: GitHub OAuth button, Google OAuth button, loading state, error message
- Uses existing `glass-card` utility class for styling
- Framer Motion `AnimatePresence` for enter/exit
- Backdrop click or escape key closes the modal
- On successful auth (detected via `onAuthStateChange`): calls `onSuccess` and closes

### Frontend — Chat UI

**New file: `app/chat/page.tsx`**
Thin page shell. Exports `metadata` for SEO. Dark background with `bg-page-gradient`. Composes `ChatInterface`.

**New file: `app/chat/_components/chat-interface.tsx`**
`'use client'` main container:
- Full viewport height (`h-dvh flex flex-col`)
- Header bar: CredDev brand (left), user avatar or "Sign in" button (right)
- Message list: scrollable `flex-1 overflow-y-auto`, renders `ChatMessage` for each item
- Chat input: pinned to bottom
- State: `messages: Message[]`, managed via `useState`
- Message type (discriminated union):
  ```typescript
  type MessageType = 'text' | 'loading' | 'action' | 'system'
  type MessageRole = 'agent' | 'user'
  interface Message {
    id: string
    role: MessageRole
    type: MessageType
    content: string
    timestamp: Date
    metadata?: Record<string, unknown> // for action buttons, PDF links, etc.
  }
  ```
- On mount: pushes agent greeting message
- Auto-scroll logic: track `isUserScrolledUp` via scroll event listener, show "new message" pill when suppressed

**New file: `app/chat/_components/chat-message.tsx`**
Single message bubble:
- Props: `interface ChatMessageProps { message: Message; className?: string }`
- Agent messages: left-aligned, CredDev avatar (Brand component), `glass-card-light` background
- User messages: right-aligned, `bg-cta-gradient` background
- Loading type: animated typing dots (3 dots with staggered bounce, CSS keyframes in globals.css)
- Action type: renders buttons/links from `message.metadata`
- System type: centered, muted text, no bubble

**New file: `app/chat/_components/chat-input.tsx`**
Text input + send button + file upload:
- Props: `interface ChatInputProps { onSend: (message: string) => void; onFileUpload: (file: File) => void; disabled: boolean; placeholder: string; showFileUpload: boolean }`
- Enter sends, Shift+Enter for newline
- Paperclip icon for file upload (only visible when `showFileUpload` is true)
- File picker: accept `.pdf`, max 10MB, validate on selection
- Disabled state: input grayed out, send button inactive, placeholder shows context
- `input-dark` utility class for styling

### Backend — Auth Dependency

**New file: `app/auth.py`** ✅ Implemented
JWKS-based asymmetric JWT validation (ES256 primary, HS256 fallback):
```python
import jwt
from jwt import PyJWKClient
from fastapi import Header, HTTPException
import httpx

# JWKS client — lazy init, hourly refresh for key rotation
_jwks_client: PyJWKClient | None = None
_JWKS_REFRESH_INTERVAL = 3600

def _get_jwks_client() -> PyJWKClient:
    """Return cached PyJWKClient, refreshing periodically."""
    # Lazy init on first request — avoids startup failures if network unavailable
    # Re-creates client every hour to pick up key rotations
    ...

async def get_current_user(authorization: str = Header(None)) -> dict:
    """Validate Supabase JWT via JWKS public key. Returns {id, email, role}."""
    # 1. Extract Bearer token
    # 2. Fetch signing key from JWKS endpoint (cached)
    # 3. Decode with ES256/HS256, audience="authenticated"
    # 4. Return user dict
    # Error handling:
    #   - RuntimeError (config) → 500
    #   - ExpiredSignatureError → 401
    #   - InvalidTokenError → 401 (logged with exc_info)
    #   - httpx.HTTPError (JWKS fetch) → 503 "Auth service temporarily unavailable"

async def get_optional_user(authorization: str = Header(None)) -> dict | None:
    """Return user dict if valid token present, None otherwise.
    Use for endpoints that work both authenticated and anonymous
    (e.g., extraction — anonymous allowed, but attach user_id if available)."""
    # Delegates to get_current_user, swallows HTTPException → returns None
```

**Modified: `app/config.py`** ✅ Implemented
- Added field: `supabase_project_ref: Optional[str] = None`
- Added method: `get_supabase_jwks_url() -> str` — constructs `https://{ref}.supabase.co/auth/v1/jwks`. Falls back to deriving project ref from `cred_service_supabase_url` if `supabase_project_ref` is not set directly.

**Modified: `lib/api.ts`**
- Import `getSession` from `supabase-auth`
- Before every API call, check for session and attach `Authorization: Bearer <token>` header
- Global 401 interceptor: if any response is 401, dispatch a custom event or call auth context to trigger re-auth modal

### Supabase Dashboard Setup

**GitHub OAuth:**
1. [github.com/settings/developers](https://github.com/settings/developers) → New OAuth App
2. App name: `CredDev`, Homepage: `https://cred-dev17.vercel.app`
3. Callback URL: `https://<project-ref>.supabase.co/auth/v1/callback`
4. Copy Client ID + Client Secret → Supabase Dashboard → Auth → Providers → GitHub → Enable + paste

**Google OAuth:**
1. [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth client ID
2. Type: Web application, Name: `CredDev`
3. Redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
4. Copy Client ID + Client Secret → Supabase Dashboard → Auth → Providers → Google → Enable + paste

**URL Configuration:**
- Site URL: `https://cred-dev17.vercel.app`
- Redirect URLs: `https://cred-dev17.vercel.app/chat`, `http://localhost:3000/chat`

### Implementation Increments (Part 1)

**Increment 1A: Auth infrastructure (no UI)** ✅ Complete
- ✅ Create `lib/supabase-auth.ts` — generic `signInWithProvider()` + `getAccessToken()` helper
- ✅ Create `lib/auth-context.tsx` — `AuthProvider` + `useAuth()` hook with mounted guard
- ✅ Wire `AuthProvider` into `app/layout.tsx`
- ✅ Create `app/auth.py` — JWKS-based ES256 validation (more robust than originally planned HS256)
- ✅ Add `supabase_project_ref` + `get_supabase_jwks_url()` to `app/config.py`
- ✅ Add `PyJWT[crypto]>=2.8` to `requirements.txt`

**Increment 1B: Chat UI shell (visual only)**
- Create `app/chat/page.tsx`
- Create `chat-interface.tsx`, `chat-message.tsx`, `chat-input.tsx`
- Add typing indicator keyframes to `globals.css`
- Hardcoded greeting message on mount
- User can type and see messages (no agent logic yet)
- Auto-scroll + disabled input states
- Verify: page loads, messages render correctly for all types, scroll works, mobile layout works

**Increment 1C: Auth modal + integration**
- Create `components/shared/auth-modal.tsx`
- Wire modal into chat interface (triggered programmatically via state)
- Test OAuth flow from within the chat page
- Verify: modal opens with animation, OAuth redirects correctly, modal closes on success, session persists on reload

**Increment 1D: Landing page migration + sign-out**
- Update hero CTA link → `/chat`
- Update footer CTA link → `/chat`
- **Keep** `app/try/` directory — reused for the recruiter flow. Do NOT delete.
- Keep `lib/use-generation-progress.ts` (reused by chat)
- Add sign-out to chat header: when authenticated, the user avatar area includes a `LogOut` icon button. Clicking calls `useAuth().signOut()`, clears the session, and the header reverts to the "Sign in" button. Conversation messages are preserved — only auth state resets.
- Update `ARCHITECTURE.md`: new routes, file structure, auth section
- Update `README.md`: new user flow
- Verify: no broken links, landing page → chat works, sign-out clears session without disrupting conversation

---

## Part 2: Guided Chat Agent + Pipeline Integration

### Chat Agent State Machine

**New file: `app/chat/_components/chat-agent.ts`**

Type definition:
```typescript
type AgentState =
  | 'greeting'
  | 'collecting_links'
  | 'confirming_links'
  | 'resume_prompt'
  | 'awaiting_resume'
  | 'extracting'
  | 'auth_gate'
  | 'generating'
  | 'delivering_report'
  | 'idle'
  | 'viewing_history'
```

State transitions:
```
greeting → collecting_links        (on: any user message)
collecting_links → collecting_links (on: URLs detected, acknowledge + ask for more)
collecting_links → confirming_links (on: user signals they're done adding links)
confirming_links → resume_prompt   (on: user confirms links are correct)
confirming_links → collecting_links (on: user wants to change/add links)
resume_prompt → awaiting_resume    (on: user wants to upload resume)
resume_prompt → extracting         (on: user declines resume)
awaiting_resume → extracting       (on: resume uploaded successfully)
extracting → auth_gate             (on: extraction complete + user NOT authenticated)
extracting → generating            (on: extraction complete + user IS authenticated)
auth_gate → generating             (on: auth success)
generating → delivering_report     (on: generation complete)
delivering_report → idle           (on: PDF cards rendered)
idle → collecting_links            (on: user wants a new report)
idle → viewing_history             (on: user asks for old reports)
viewing_history → idle             (on: history presented)

Any state → (same state)           (on: off-topic message → redirect)
```

**Collected data interface:**
```typescript
interface CollectedData {
  platformUrls: Record<string, string>  // { github: "url", leetcode: "url", ... }
  resumeFile: File | null
  jobId: string | null
}
```

**URL detection utility:**
New file or inline in chat-agent.ts. TypeScript port of the backend `platform_utils.py` domain map:
```typescript
const DOMAIN_MAP: Record<string, string> = {
  'github.com': 'github',
  'leetcode.com': 'leetcode',
  'linkedin.com': 'linkedin',
  'kaggle.com': 'kaggle',
  // ... same platforms as backend
}

function detectPlatformUrls(text: string): Record<string, string>
// Returns { platformId: url } for all URLs found in the text
```

**Agent message templates:**
Named constants with template variables `{name}`, `{platform}`, `{date}`, `{count}`. Minimum 3 variations for redirect messages. Example:
```typescript
const GREETINGS = {
  anonymous: "Hey! I'm CredDev's analysis agent. I verify developer credibility by analyzing real data from GitHub, LeetCode, and other platforms. Share your profile links and I'll get started.",
  authenticated: "Hey {name}, welcome back to CredDev! {history}",
}

const REDIRECTS = [
  "Interesting! I'm built for developer credibility analysis though. Share a profile link and I'll show you what I can do.",
  "Good question! My specialty is analyzing developer profiles. Drop your GitHub or LeetCode URL and let's get started.",
  "I appreciate the chat! I'm most useful when analyzing developer profiles though. Got any links to share?",
]
```

### API Changes

**Modified: `routes/generate.py`**
- `POST /api/v1/generate/{job_id}` — Add `current_user: dict = Depends(get_current_user)`. Set `job.user_id = current_user["id"]` before starting generation. Commit immediately so user_id persists even if generation fails.
- `POST /api/v1/generate/{job_id}/resend-email` — Add `Depends(get_current_user)` (protected but not actively used in Phase 1).

**Modified: `routes/extract.py`**
- No auth changes. Extraction stays anonymous.

**New endpoint: `GET /api/v1/user/reports`**
```python
@router.get("/user/reports")
async def get_user_reports(
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Returns paginated list of user's analysis jobs with report availability."""
    offset = (page - 1) * per_page
    jobs = (
        db.query(AnalysisJob)
        .filter(AnalysisJob.user_id == current_user["id"])
        .order_by(AnalysisJob.created_at.desc())
        .offset(offset)
        .limit(per_page)
        .all()
    )
    return {
        "reports": [
            {
                "job_id": job.id,
                "candidate_name": job.candidate_name,
                "status": job.status,
                "created_at": job.created_at.isoformat(),
                "platform_urls": job.platform_urls,
            }
            for job in jobs
        ],
        "page": page,
        "per_page": per_page,
    }
```

**New endpoint: `GET /api/v1/generate/{job_id}/pdf/{report_type}`**
```python
@router.get("/generate/{job_id}/pdf/{report_type}")
async def download_report_pdf(
    job_id: str,
    report_type: str,  # "extensive_report" | "developer_insight" | "recruiter_insight"
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate and serve a report PDF for download."""
    # Validate job belongs to user
    job = db.query(AnalysisJob).filter(
        AnalysisJob.id == job_id,
        AnalysisJob.user_id == current_user["id"],
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Report not found")

    # Fetch report content
    report = db.query(Report).filter(
        Report.job_id == job_id,
        Report.layer == report_type,
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not generated yet")

    # Generate PDF using existing generate_report_pdf()
    pdf_bytes = generate_report_pdf(report_type, job.candidate_name, report.content)

    filename = f"creddev-{report_type.replace('_', '-')}-{job.candidate_name.lower().replace(' ', '-')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
```

**Modified: `lib/api.ts` (frontend)**
- Add auth token injection in a centralized `fetchWithAuth()` wrapper
- Add `getUserReports(page?, perPage?)` — calls `GET /api/v1/user/reports`
- Add `getReportPdfUrl(jobId, reportType)` — returns the download URL for a specific report PDF
- Add global 401 interceptor: on any 401 response, emit a custom `auth:expired` event. Auth context listens and triggers re-auth modal.

### PDF Card Component

**New file: `app/chat/_components/report-card.tsx`**
Rendered as an `action` type message in the chat:
- Props: `interface ReportCardProps { jobId: string; reportType: string; title: string; description: string }`
- Glass morphism card styling
- Report icon (Lucide), title, 1-line description
- Download button: triggers `getReportPdfUrl()` → opens PDF download
- Three cards rendered in a row (desktop) or stacked (mobile)

Report metadata:
```typescript
const REPORT_META = {
  extensive_report: {
    title: "Comprehensive Technical Report",
    description: "Deep-dive analysis with inline citations and skill verification",
  },
  developer_insight: {
    title: "Developer Growth Insight",
    description: "Career positioning, skill gaps, and 30-60 day focus areas",
  },
  recruiter_insight: {
    title: "Recruiter Hiring Signal",
    description: "Screening clarity, interview guidance, and hire confidence",
  },
}
```

### Ephemeral Progress Messages

Progress messages use the `loading` message type with special handling:
- When extraction or generation starts, a `loading` message is added to the message array
- The message `content` is updated in place as SSE events arrive (stage name changes)
- When the operation completes, the `loading` message is removed from the array and replaced with a persistent `text` message summarizing the result
- Animation: Framer Motion `AnimatePresence` handles the fade-out of loading and fade-in of summary

### Rate Limiting

**New file or addition to `app/main.py`:**
In-memory rate limiter for anonymous extraction:
```python
# Simple in-memory tracker (same pattern as ProgressManager)
_extraction_tracker: Dict[str, Dict] = {}  # { ip: { count: int, window_start: datetime } }

ANON_EXTRACTION_LIMIT = 3
ANON_EXTRACTION_WINDOW = 3600  # 1 hour in seconds
```

Applied as a check inside `POST /api/v1/extract` when no auth token is present. Returns 429 with `detail: "Rate limit exceeded. Sign in to continue."` Chat agent interprets 429 and surfaces the auth modal.

### Implementation Increments (Part 2)

**Increment 2A: Chat agent state machine**
- Create `chat-agent.ts` with all states, transitions, and type definitions
- Create URL detection utility (TypeScript `DOMAIN_MAP` mirror)
- Create agent message templates (greetings, redirects, confirmations, prompts)
- Wire state machine into `ChatInterface` — agent responds to user messages based on current state
- Off-topic redirect with varied messages (no consecutive repeats)
- Verify: walk through every state manually, each path produces correct responses and transitions

**Increment 2B: Resume upload + link confirmation flow**
- Add file upload to `ChatInput` (paperclip icon, PDF picker, 10MB validation)
- Wire resume prompt state — agent asks about resume, handles yes/no/upload
- Wire confirmation flow — agent asks "want to add more?", waits for explicit confirmation
- Verify: can collect links, confirm them, upload resume, decline resume — all paths work

**Increment 2C: Connect extraction pipeline**
- Chat agent calls `submitExtraction()` on user confirmation (with collected URLs + resume)
- Extraction polling produces ephemeral loading messages (stage updates)
- On completion: loading message fades, persistent summary appears
- Verify: share links → confirm → extract → ephemeral progress → summary

**Increment 2D: Auth gate + generation pipeline + PDF delivery**
- Auth modal triggers post-extraction for unauthenticated users
- On auth success: attach token to API client, call generation endpoint with user_id
- SSE progress from `useGenerationProgress` feeds ephemeral loading messages
- On completion: create PDF download endpoint, render 3 report cards
- Create `report-card.tsx` component
- `user_id` populated on the job
- Verify: full end-to-end flow works, PDF downloads work, user_id in database

**Increment 2E: Report history + returning users**
- Create `GET /api/v1/user/reports` endpoint
- Create `GET /api/v1/generate/{job_id}/pdf/{report_type}` endpoint
- Chat agent checks auth + report history on mount → personalized greeting
- Agent handles "show my reports" → fetches history → renders report cards
- Verify: returning user sees name greeting, can view/download old reports

**Increment 2F: Rate limiting + hardening**
- Add IP-based rate limiting for anonymous extractions (3/hour)
- Chat agent interprets 429 → surfaces auth modal with contextual message
- Global 401 interceptor triggers re-auth, preserves conversation state
- Verify: 4th anonymous extraction returns 429, modal appears, auth resolves it

---

## What Stays the Same

- Extraction pipeline (GitHub, LeetCode, WebSearch fetchers) — no changes
- Generation pipeline (LLM calls, report storage) — no changes
- SSE progress streaming system — reused by chat, no changes to backend
- Email service — stays in codebase but not triggered in this phase
- PDF generation function (`generate_report_pdf()`) — reused by new download endpoint
- Database schema — no new tables, no migrations
- Recruiter page and waitlist flow — untouched
- About page and sample report pages — untouched

---

## New Dependencies

| Package | Where | Purpose |
|---------|-------|---------|
| `PyJWT[crypto]>=2.8` | Backend `requirements.txt` | Decode and validate Supabase Auth JWTs. The `[crypto]` extra provides `cryptography` for asymmetric ES256 key support (required by JWKS validation). |

Frontend: No new packages. `@supabase/supabase-js` is already installed.

---

## Files Changed Summary

### New Files
| File | Purpose |
|------|---------|
| `lib/supabase-auth.ts` | Auth helper wrapping Supabase SDK |
| `lib/auth-context.tsx` | React context provider for auth state |
| `components/shared/auth-modal.tsx` | OAuth modal component |
| `app/chat/page.tsx` | Chat page route |
| `app/chat/_components/chat-interface.tsx` | Main chat container |
| `app/chat/_components/chat-message.tsx` | Message bubble component |
| `app/chat/_components/chat-input.tsx` | Chat text input + file upload |
| `app/chat/_components/chat-agent.ts` | State machine + message templates + URL detection |
| `app/chat/_components/report-card.tsx` | PDF report download card |
| `app/auth.py` | FastAPI auth dependency |

### Modified Files
| File | Change |
|------|--------|
| `app/layout.tsx` | Wrap with `AuthProvider` |
| `app/globals.css` | Add typing indicator keyframes |
| `app/config.py` | Add `supabase_jwt_secret` field |
| `lib/api.ts` | Add auth token injection, 401 interceptor, `getUserReports()`, `getReportPdfUrl()` |
| `routes/generate.py` | Add auth dependency to generation + resend endpoints, add PDF download endpoint |
| `routes/extract.py` | Add rate limiting check for anonymous requests |
| `app/_components/hero.tsx` | Update CTA link to `/chat` |
| `components/shared/footer.tsx` | Update CTA link to `/chat` |
| `requirements.txt` | Add `PyJWT` |
| `ARCHITECTURE.md` | Add chat route, auth system, new endpoints, updated file structure |
| `README.md` | Update user flow description |

### Retained Files (originally planned for deletion)
| File | Reason for Keeping |
|------|-------------------|
| `app/try/page.tsx` | Reused for recruiter flow |
| `app/try/_components/try-flow.tsx` | Reused for recruiter flow |
| `app/try/_components/try-form.tsx` | Reused for recruiter flow |
| `app/try/_components/generation-loader.tsx` | Reused for recruiter flow |
