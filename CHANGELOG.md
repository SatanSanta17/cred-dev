# Changelog

## [2026-03-30] — Progressive Auth Pipeline + PDF Delivery — Part 2 (PRD-010, Increments 2C–2F)

### Added
- `app/chat/_components/report-card.tsx` — glass-morphism PDF download cards rendered after generation completes. 3-card responsive grid (extensive, developer, recruiter) with staggered Framer Motion animations, per-card loading/error states, browser-triggered download via `downloadReportPdf()`
- `GET /api/v1/generate/{job_id}/pdf/{report_type}` — authenticated endpoint that generates and serves a report PDF for download. Validates job ownership via `user_id`
- `GET /api/v1/user/reports` — authenticated, paginated endpoint returning user's analysis jobs with report availability and total count. Registered before wildcard `{job_id}` routes to prevent FastAPI route swallowing
- `getUserReports(page, perPage)`, `downloadReportPdf(jobId, type)`, `getReportPdfUrl(jobId, type)` in `lib/api.ts`
- Anonymous IP-based rate limiting on `POST /api/v1/extract` — 3 extractions/hour per IP, in-memory tracker, returns 429 with actionable "Sign in to continue" message
- `fetchWithAuth()` centralized wrapper in `lib/api.ts` — injects Supabase access token on all API calls, emits `auth:expired` custom event on 401 for global re-authentication
- History-aware greeting for returning authenticated users — `GREETINGS.authenticatedWithHistory(name, reportCount)` template
- `HISTORY_MESSAGES` (fetching/empty/header) and `RATE_LIMIT_MESSAGES` in `chat-agent-messages.ts`
- Report history deduplication by exact platform URL match — prevents re-generating reports the user already has
- `idle → viewing_history` state transition with delegated fetch in `chat-interface.tsx`
- On-mount history check with `historyCheckedRef` guard to prevent duplicate fetches

### Changed
- `POST /api/v1/generate/{job_id}` — now requires authentication (`get_current_user`), binds `user_id` to job
- `POST /api/v1/generate/{job_id}/resend-email` — now requires authentication
- `POST /api/v1/extract` — accepts optional auth (`get_optional_user`), authenticated users bypass rate limit and get `user_id` bound to job
- `chat-interface.tsx` — rewritten to orchestrate full pipeline: extraction → 429 handling → auth gate → history check → generation (SSE progress with ephemeral messages) → PDF delivery via `ReportCards`. Declaration order of `useCallback` hooks is critical (TDZ-safe ordering)
- `chat-agent.ts` — `getGreeting()` now accepts `reportCount` parameter, `idle → viewing_history` transition returns empty messages (fetch delegated to interface)
- `lib/api.ts` — all functions now use `fetchWithAuth()` instead of raw `fetch()`
- `analysis_jobs.user_id` — now populated at generation time from authenticated user's Supabase ID

### Fixed
- FastAPI route ordering — `GET /user/reports` registered before `{job_id}` wildcard routes to prevent "user" being matched as a job_id (was returning 404)
- JavaScript temporal dead zone (TDZ) — `useCallback` declarations reordered so `startGeneration` and `checkHistoryAndGenerate` are defined before being referenced in dependency arrays

## [2026-03-27] — Chat Interface + Progressive Auth — Part 1 (PRD-010)

### Added
- `/chat` route — full-viewport chat interface with agent message list, auto-resizing input, and auto-scroll with "new messages" pill when scrolled up
- `app/chat/_components/chat-interface.tsx` — orchestrates header (brand + auth state), message list, input bar, and auth modal
- `app/chat/_components/chat-message.tsx` — discriminated union message renderer supporting `text`, `loading`, `action`, and `system` types. Agent messages left-aligned with brand avatar, user messages right-aligned with accent gradient
- `app/chat/_components/chat-input.tsx` — auto-resizing textarea (Enter sends, Shift+Enter newline), optional file upload button (PDF only, 10 MB max), disabled state with contextual placeholder
- `components/shared/auth-modal.tsx` — glass morphism overlay with Framer Motion enter/exit, GitHub + Google OAuth buttons, per-button loading spinners, error display, closes on backdrop click / Escape / successful auth
- `lib/supabase-auth.ts` — Supabase auth helper (`signInWithProvider`, `signOut`, `getSession`, `getUser`, `getAccessToken`, `onAuthStateChange`)
- `lib/auth-context.tsx` — `AuthProvider` React context + `useAuth()` hook exposing `user`, `isAuthenticated`, `isLoading`, `signIn`, `signOut`
- `server/cred-service/app/auth.py` — JWKS/ES256 JWT validation with `PyJWKClient`, lazy initialization, hourly key refresh, dual algorithm support (ES256 primary, HS256 fallback), `get_current_user` and `get_optional_user` FastAPI dependencies, 503 on JWKS fetch failure
- Sign-out button in chat header — clears local session and reverts UI to unauthenticated state
- Typing indicator animation (`typing-bounce` keyframes + staggered delay utilities) in `globals.css`

### Changed
- All CTAs across the app now link to `/chat` instead of `/try` — updated in `hero.tsx`, `footer.tsx`, `about-cta.tsx`, and `app/report/Burhanuddin/page.tsx`
- `/try` route retained for recruiter pipeline (not deleted)
- `server/cred-service/app/config.py` — added `supabase_project_ref` field and `get_supabase_jwks_url()` method
- `ARCHITECTURE.md` — added `/chat` route, chat component tree, auth files, `SUPABASE_PROJECT_REF` env var, updated limitation notes
- `README.md` — updated user flow diagram (form → chat, auth gate, PDF in chat), updated project structure tree with chat and auth files
- `docs/010-chat-progressive-auth/trd.md` — aligned with actual JWKS/ES256 implementation (was HS256), marked Increments 1A–1D complete, fixed env var name
- `docs/010-chat-progressive-auth/prd.md` — added P1.R11 (sign-out requirement) with acceptance criteria
- Fixed `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` across TRD, ARCHITECTURE.md, and README.md

## [2026-03-08] — Recruiter Landing Page + Waitlist Cleanup (PRD-006)

### Added
- `/recruiters` page — "coming soon" teaser with recruiter-specific hero, product vision (candidate reports + developer directory), pain point quotes (placeholders), and recruiter-only waitlist form
- "For Recruiters" link in the landing page footer

### Changed
- `problem-validation.tsx` — removed `WaitlistCount` (developers don't need waitlist numbers)
- `app/layout.tsx` — updated metadata description (removed "Join the waitlist" language)
- `app/about/page.tsx` — CTA now links to `/try` instead of `/#waitlist`, button text updated
- `components/sections/footer.tsx` — added "For Recruiters" link in bottom bar
- `CLAUDE.md` — waitlist section updated to reflect recruiter-only model

### Removed
- `/waitlist` page and all its components — developers go to `/try`, recruiters go to `/recruiters`

## [2026-03-08] — Branding + Component Restructure (PRD-005)

### Added
- `components/shared/brand.tsx` — reusable CredDev brand component (logo icon + gradient name). Props: `size` (sm/md/lg), `className`.
- CredDev branding at the top of the hero section (landing page)
- `app/try/_components/` — co-located try-page components (Next.js convention)
- `app/waitlist/_components/` — co-located waitlist components

### Changed
- `components/sections/hero.tsx` — Brand component added above headline
- `components/shared/back-link.tsx` — `showBrand` mode now uses Brand component instead of inline GradientText
- Moved `try-flow.tsx`, `try-form.tsx`, `generation-loader.tsx` from `components/sections/` to `app/try/_components/`
- Moved `waitlist-form.tsx` from `components/sections/` to `app/waitlist/_components/`
- `components/sections/` now contains only landing page sections (hero, how-it-works, problem-validation, footer)

## [2026-03-06] — Honest Sample Report Page (PRD-004)

### Changed
- `app/report/Burhanuddin/page.tsx` — complete rewrite. Replaced fabricated score dashboard (82/100, "Top 18-20%", "Hire Confidence 85%", "3% scam probability") with honest representation of real CredDev report output. Now shows: verdict from actual report, VERIFIED/UNVERIFIED skill tags, real LeetCode numbers (555 problems, 98.58% acceptance), production signals per repo, work history (labeled as resume-sourced), risk flags shown honestly. Collapsible source citations for each section.

### Added
- `public/reports/Burhanuddin_Comprehensive_Report.pdf` — downloadable full 9-page report PDF
- "Download Full PDF" button on the sample report page

### Removed
- All fabricated metrics: overall score, category scores, percentiles, hire confidence, scam probability, interview readiness badges, "Analysis Engine v1.0 • Confidence: 95%", fake Crunchbase/TechCrunch verification claims
- `Progress` component import (was used for fake score bars)

## [2026-03-06] — Developer-Focused Landing Page (PRD-003)

### Added
- `components/sections/problem-validation.tsx` — new section with rotating quotes from developer/recruiter conversations validating the hiring problem. Displays 3 quotes at a glance (desktop), 1 on mobile. Auto-rotates every 5s if more than 3 quotes exist, pauses on hover. Editable via a single `QUOTES` array. Includes real sample report link and waitlist count.

### Changed
- `app/page.tsx` — reduced from 7 sections to 4: Hero, HowItWorks, ProblemValidation, Footer
- `components/sections/hero.tsx` — rewritten: developer-only messaging ("Your code speaks. We verify it."), single CTA ("Generate Your Free Report"), mobile-first (no hidden elements), removed floating metric cards and waitlist link
- `components/sections/how-it-works.tsx` — rewritten: compact 3-step layout (horizontal on desktop, vertical on mobile), removed feature badges, fixed inaccurate copy ("One-click OAuth" → actual username input flow)
- `components/sections/footer.tsx` — simplified: single CTA + copyright + email contact, removed multi-column link grid

### Removed
- `components/sections/problem.tsx` — recruiter-framed problem section
- `components/sections/sample-output.tsx` — hardcoded fake scores (87/100, "Top 15%") that didn't exist in the real product
- `components/sections/for-developers.tsx` — 6 benefit cards consolidated into hero
- `components/sections/for-recruiters.tsx` — premature recruiter pitch (no recruiter flow exists)
- `components/shared/floating-card.tsx` — no longer used (was only in hero)
- `react-countup` package — was only used in sample-output.tsx

## [2026-03-04] — Enriched GitHub Data (PRD-002)

### Added
- Two-query architecture in `github_fetcher.py`: Query 1 (profile + 100 repos + pinned repos + organizations + language bytes) and Query 2 (production readiness signals for top 15 repos)
- `_fetch_profile_and_repos()` — enriched Query 1 with `pinnedItems(first: 6)`, `organizations(first: 10)`, and `languages edges { size }` for byte-level proficiency
- `_select_top_repos()` — filters out forks/archived/private, sorts by stars then pushedAt, returns top 15
- `_fetch_production_signals()` — GraphQL aliased query checking README, Dockerfile, CI workflows, test directories, .env.example, and dependency file content for up to 15 repos, batched in groups of 5 to avoid GitHub's query complexity limit (502 errors)
- `_clean_production_signals()` — strips null entries, collapses three test directory checks into one `testDirectory` key, caps dependency file text at 50KB
- `_merge_production_signals()` — attaches production signal data to matching repos in the response

### Changed
- GitHub API calls per extraction: up to 4 (was 1) — Query 1 + up to 3 batches for Query 2. Still well within 5,000/hour rate limit
- Language data now includes byte counts per language per repo (was names only)

### Removed
- Old monolithic `_fetch()` method — replaced by the two-query approach

## [2026-03-04] — Streaming Progress Messages (PRD-001)

### Added
- `_call_llm_streaming()` method in `report_generator.py` — streams OpenAI responses with `stream=True`, fires progress callbacks on web_search and text_progress events, falls back to `_call_llm()` on failure
- `update_message()` and `increment_percentage()` methods on `ProgressManager` — enables live message updates and smooth percentage increments within stage ranges
- Section-aware message lists for each report type in `generate.py` (9 extensive, 5 developer, 6 recruiter messages)
- `_make_progress_callback()` factory in `generate.py` — creates per-report closures that rotate messages based on token progress and handle web_search events

### Changed
- Generation pipeline now uses streaming LLM calls instead of blocking calls — progress messages update every ~4 seconds during generation
- `generating_extensive` stage starts at 10% (was 15%) to match updated percentage strategy: 0→5→10→48→50→78→80→93→95→98→100
- Web search events from the LLM now surface as real-time "Searching the web for..." messages

### Removed
- `ReportGenerator.generate_reports()` — dead code, pipeline calls individual LLM methods directly with streaming callbacks

## [2026-03-03] — Email Failure Visibility & Resend

### Added
- Resend email endpoint: `POST /api/v1/generate/{job_id}/resend-email` — lets users retry email delivery for completed jobs
- `email_failed` flag in SSE progress stream so the frontend knows when email delivery failed
- `extra` dict parameter on `ProgressManager.update()` for passing additional metadata through SSE
- `resendEmail()` function in the frontend API client (`lib/api.ts`)
- Resend Email button on the success screen when email delivery fails — amber warning with retry action
- "Resent to …" confirmation message after successful resend

### Changed
- Generation pipeline now tracks email errors in `job.error_message` (format: `email_failed: <reason>`) instead of silently swallowing them
- Success screen conditionally renders: warning + resend button (email failed) or "Sent to …" (email succeeded)
- `ProgressData` interface in `use-generation-progress.ts` now includes optional `email_failed` field
