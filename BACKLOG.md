# CredDev Backlog

Items noted for future work. Each requires a proper PRD before implementation.

---

## Platform & Data

- **LinkedIn Implementation** — Replace the stub with OAuth integration for real profile data (education, experience, endorsements, recommendations)
- **More Platform Onboarding** — Add support for additional platforms (e.g., Stack Overflow, Codeforces, HackerRank, personal portfolio sites)
- **Hiring Confidence Scoring Rubric** — Define a structured rubric for the recruiter report's hire recommendation instead of pure LLM judgment

## Frontend

- **UI Improvements — Declutter the Page** — Simplify the landing page, reduce visual noise, tighten the flow
- **UI Profile Implementation** — Candidate profile pages where users can view their reports, track history
- **Fancy Shareable Card Generation** — Generate a visual credibility card (image/PDF) candidates can share on LinkedIn, portfolios, etc.

## Architecture

- **User Service Implementation** — Authentication, user accounts, saved reports, usage tracking
- **Frontend to Backend Communication Architecture** — Evaluate current polling/SSE approach, consider WebSockets, improve error handling and retry logic across the stack
- **Recruiter Flow** — Separate recruiter-facing experience: bulk candidate lookup, comparison views, saved searches

## Exploratory / Long-Term Vision

- **AI Collaboration Sandbox** — A sandboxed chat environment within CredDev where candidates interact with an LLM on a system design problem tailored to their background (from GitHub/LeetCode/resume data). No copy-paste from outside, no audio — pure back-and-forth conversation. The objective is not to test knowledge but to assess how the candidate approaches problems, what clarifying questions they ask, and how they command the LLM. Evaluation based on thinking process, not answers. Specific rubrics: did the candidate ask clarifying questions before jumping in? Did they challenge assumptions? Did they break the problem into components? Did they iterate when the LLM pushed back? These are measurable signals.
- **Job Portal Integration** — Build CredDev as a layer that sits on top of existing job portals (or an organization's own job portal). When a company publishes a job opening, CredDev takes over the application flow — the candidate applies by filling the form, provides their profiles, schedules a sandbox interview time, and completes their application. This embeds CredDev into the recruiter's existing workflow instead of asking them to adopt a new tool. Easier adoption, zero workflow change for recruiters.

## Technical Debt

- **ProgressManager is in-memory** — Lost on server restart. Works for single-instance Render but won't scale to multiple workers
- **No authentication** — Anyone can submit. `user_id` column exists but isn't populated
- **Resume URL field unused** — Column exists but resume is always sent as bytes
- **helpers.py is unused** — ExtractionService has its own URL extraction methods inline
- **ReportGenerator model hardcoded** — `gpt-5-mini` not configurable via env var
- **Render cold starts** — Free tier spins down, first request takes 30-50s
