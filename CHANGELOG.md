# Changelog

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
