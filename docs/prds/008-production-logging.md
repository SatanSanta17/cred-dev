# PRD-008: Production Logging System

**Status:** Approved
**Created:** 2026-03-08

---

## Emotion

When something crashes in production, we're flying blind. The backend has 40 logger calls but zero centralized configuration — no timestamps, no structured output, no stack traces. Debugging means guessing. A proper logging system means every crash is traceable, every slow request is measurable, and every pipeline run can be replayed from logs.

This PRD also adds logging as a permanent development rule so every future feature ships with proper observability from day one.

---

## What Changes

### 1. Centralized Logging Configuration

New `logging_config.py` module with a single `setup_logging()` function:
- JSON format in production (Render logs are searchable when structured)
- Human-readable format in development
- `LOG_LEVEL` env var support (default: INFO, DEBUG mode overrides to DEBUG)
- Uvicorn and SQLAlchemy loggers set to appropriate levels

### 2. Request Logging Middleware

FastAPI middleware that logs every HTTP request:
- Method, path, status code, duration in milliseconds
- Extracts `job_id` from URL path when present

### 3. Fix All Existing Logging

- Add `exc_info=True` to every `logger.error()` call (only 1 of 17 has it today)
- Add logging to 6 service files that currently have none
- Ensure consistent `job_id=` format in all pipeline logs

### 4. CLAUDE.md Logging Rule

Permanent rule: every service method must log entry, exit, and errors. No silent failures.

---

## Design Decisions

- **Python built-in `logging`** — no new dependencies. Structlog/loguru are overkill at this scale.
- **`job_id` as correlation key** — `grep job_id` traces a full request lifecycle.
- **`exc_info=True` on all errors** — stack traces are mandatory for debugging crashes.
- **JSON in prod, readable in dev** — JSON is searchable in Render; readable format is better for local development.

---

## Out of Scope

- Log aggregation service (Datadog, Sentry, etc.) — future PRD
- Frontend error logging — backend only for now
- Log rotation — Render handles stdout log retention
