# Changelog

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
