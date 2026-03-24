# CredDev — Development Rules

## First Steps Every Session

1. Read `ARCHITECTURE.md` before making any changes — it contains the full system design, file map, data flow, and platform-specific conventions.
2. If modifying any file, read it first — don't assume from memory.
3. If modifying a page, read its `_components/` or relevant section files first.
4. Always ask for plan confirmation before coding.
5. Never make a document without being asked for explicitly.

## Critical Rules — Do NOT Violate

- **Follow the development process — no shortcuts.** Every change follows this sequence: (1) Understand the emotion — why does this matter to the user? (2) Write a PRD and TRD in `docs/<feature-folder>/` (3) Get explicit approval on the PRD before any code is touched (4) Implement one PRD section at a time in small, pushable increments (5) Review, merge, move to the next section. No step is skipped.
- **No code changes without a documented PRD and TRD.** Every feature, fix, or refactor must have a written PRD (Product Requirements Document) and TRD (Technical Requirements Document) reviewed and approved before any code is touched. No exceptions — not even "small" changes. **One exception:** trivial fixes (typos, CSS tweaks, one-line bugs) may skip the PRD/TRD — but still require explicit approval before any code is changed. Never change code silently.
- **PRD/TRD folder convention.** Each feature gets its own folder under `docs/` named `<number>-<feature-name>/` (e.g., `docs/009-recruiter-job-matching/`). Inside: `prd.md` (product requirements) and `trd.md` (technical design). The PRD is product-only — requirements, acceptance criteria, user stories. The TRD is technical — DB schemas, API contracts, file changes, implementation increments. Legacy PRDs (001–008) in `docs/prds/` stay as-is; all new features use this structure.
- **PRDs are sectioned, not monolithic.** Large features are split into numbered parts within a single PRD (Part 1, Part 2, Part 3). Each part has its own requirements (P1.R1, P1.R2, etc.) and acceptance criteria. The TRD mirrors the same part structure. Implementation happens one part at a time — the owner says "implement Part 1," that part ships, then "implement Part 2" when ready. Parts that aren't ready yet stay in the document as roadmap, not commitment.
- **PRD contains: emotion, user story, requirements (numbered), acceptance criteria (checkboxes), and a backlog section** for deferred ideas that don't belong in the current scope but shouldn't be forgotten. No technical details in the PRD — those go in the TRD.
- **TRD mirrors the PRD structure** — same part numbers, same feature boundaries. Each part includes: database models, API endpoints, frontend pages, files changed, and implementation increments (PR-sized units of work). The TRD is the implementation blueprint — it answers "how" for everything the PRD says "what."
- **Break large changes into small, pushable increments.** The PRD defines the full scope (the big picture). The TRD breaks each part into PR-sized increments. Each increment is self-contained, verifiable, and non-breaking. Never lose sight of the PRD's end goal, but never try to ship it all at once either.
- **Verify before every push.** Before code is pushed, every change must pass four checks: (1) **Code quality** — read every modified file end-to-end for syntax errors, unused imports, broken references, and consistency with existing patterns. (2) **PRD compliance** — walk through each PRD requirement and confirm the implementation covers it. (3) **No regressions** — trace existing flows through modified files to confirm the happy path still works and new code only activates in the intended scenario. (4) **Documentation consistency** — check if ARCHITECTURE.md or any README in the modified area is now factually incorrect. If it contradicts the new code, fix it.
- **Respect existing architecture decisions.** `ARCHITECTURE.md` documents platform-specific rules, error handling patterns, and constraints that must not be violated. Read and follow them.

---

## Development Practices — SOLID & Clean Code

These principles apply to every change across both frontend and backend.

- **Single Responsibility (S).** Each file, component, and function does one thing. If a component handles both UI rendering and data fetching, split them. If a service method does validation and persistence, separate them.
- **Open/Closed (O).** Extend behavior without modifying existing code. Use props, composition, and factory patterns instead of editing working code to add new behavior.
- **Liskov Substitution (L).** All implementations of an interface must be interchangeable. Every shared component works with its default props alone.
- **Interface Segregation (I).** Don't force consumers to depend on things they don't use. Keep component prop interfaces minimal. Keep service methods focused — don't add optional parameters that only one caller needs.
- **Dependency Inversion (D).** High-level modules should not depend on low-level details. Route handlers call service classes, not raw DB queries. Components consume props, not global state.

Additional practices:

- **DRY — Extract shared patterns into reusable components.** If the same UI pattern or logic appears in two or more places, extract it into a shared location. Don't duplicate code across files.
- **Delete dead code immediately.** Unused files, imports, and components are never left "just in case." If it's not imported anywhere, it's deleted.
- **Naming reflects purpose.** File names, component names, and function names describe what they do — not how they're implemented.
- **Composition over inheritance.** Build complex components by composing simple ones. Use props and children, not deep class hierarchies.
- **Fail explicitly.** Errors are caught, logged, and surfaced to the user — never silently swallowed unless explicitly documented in the architecture.
- **Log everything that matters.** Every service method must log: entry with input context, exit with outcome, and errors with `exc_info=True`. Use `job_id=` in all pipeline logs so a single grep traces the full lifecycle. No silent failures — if you catch an exception, you log it before handling it. New features must ship with logging from day one.

---

## Frontend — Next.js Conventions

These rules apply to every file under `app/`, `components/`, and `lib/`. They are derived from the existing codebase patterns and must be followed for consistency.

### Component Architecture

- **Page routes are thin.** Page files set up the shell (background, nav, layout) and compose from smaller components. No business logic in page files.
- **Co-locate private components with their route.** Route-specific components live next to their page file and are never imported outside that route.
- **Shared components are extracted once reused.** If a component is used across two or more routes, extract it into a shared location. Single-route components stay co-located.
- **UI primitives are untouchable.** shadcn/ui components are never modified with business logic. Extend via composition, not modification.
- **Default to Server Components.** Every component is a React Server Component unless it needs client-side interactivity (`useState`, `useEffect`, event handlers, browser APIs). Only add `'use client'` when the component genuinely requires it. Never mark a parent as `'use client'` just because one child needs it — push the client boundary as deep as possible.
- **Metadata is co-located with routes.** Every page exports a `metadata` object or `generateMetadata` function for SEO. Never hardcode `<title>` or `<meta>` tags in components.
- **Use `next/image` for all images.** Never use raw `<img>` tags. Configure `width`, `height`, or `fill` to prevent layout shift. Use `priority` only for above-the-fold images.
- **Use `next/link` for all internal navigation.** Never use `<a>` tags for internal routes. Never use `window.location` for client-side navigation — use `useRouter()` from `next/navigation`.
- **Environment variables follow the `NEXT_PUBLIC_` convention.** Client-accessible env vars must be prefixed with `NEXT_PUBLIC_`. Server-only secrets must never be prefixed. Never expose API keys or secrets to the client bundle.

### TypeScript Patterns

- **Strict mode is enabled.** No `any` types unless absolutely unavoidable and documented with a comment explaining why.
- **Props use interfaces, not types.** Define `interface ComponentProps { ... }` above the component. Always include `className?: string` for composability.
- **Zod for validation, infer for types.** Forms use `z.object()` schemas with `type FormFields = z.infer<typeof schema>`. Never duplicate types manually when Zod can infer them.
- **Discriminated unions for state machines.** Use `type FlowState = 'form' | 'extracting' | 'generating' | 'success' | 'error'` — never booleans for multi-state flows.
- **Error narrowing.** Always use `err instanceof Error ? err.message : 'Something went wrong'` in catch blocks. Never assume `err` is an Error.
- **Prefer `satisfies` over `as`.** Use `const config = { ... } satisfies Config` for type-safe object literals. Reserve `as` for genuinely narrowing an unknown type, never to silence errors.

### State Management

- **React hooks only.** No Redux, Zustand, or external state libraries. `useState` for component state, `useRef` for mutable values that don't trigger renders, `useCallback` for stable function references.
- **Custom hooks in `lib/`.** Prefix with `use-` (file) and `use` (function). Return objects, not arrays. Include cleanup in `useEffect` return. Support enable/disable via parameters.
- **Forms use react-hook-form + zod.** Always: `useForm<T>({ resolver: zodResolver(schema), defaultValues: {...} })`. Never manage form state manually.
- **No global state.** Components receive data via props. Context is used only for cross-cutting concerns (auth, theme). Never use context as a general state store.
- **Derive state, don't sync it.** If a value can be computed from existing state or props, compute it inline or with `useMemo`. Never use `useEffect` to sync one state variable to another — that's a bug waiting to happen.

### Styling Rules

- **Tailwind CSS 4 with dark mode default.** The app is dark-themed. All color choices must work on dark backgrounds.
- **Use a utility function for conditional classes.** Never concatenate class strings manually. Always use a merge utility that handles Tailwind class conflicts.
- **Glass morphism is the design language.** Translucent surfaces with backdrop blur and subtle borders. Purple gradients for accent glows. All new surfaces must match the existing visual language.
- **cva for variant-based components.** Use `class-variance-authority` for components with multiple visual states (buttons, badges, status indicators).
- **Mobile-first responsive.** Default styles are mobile. Use `md:` and `lg:` breakpoints to add desktop layout. Touch targets minimum 44px. Test on mobile viewports.
- **Custom animations in global CSS only.** Define `@keyframes` and utility classes in the global stylesheet. Components reference these classes, never inline `@keyframes`.
- **Theme and typography are defined globally.** All shared colours, font sizes, font weights, border radii, shadows, and brand tokens (accent colours, status colours, badge colours) must be defined in `globals.css` using CSS custom properties or Tailwind's `@layer` directives — never scattered as inline values across components. Components reference these global tokens via Tailwind classes or `var(--token-name)`. This makes theme-wide changes a single-file edit instead of a project-wide find-and-replace. If a colour, font size, or spacing value appears in more than one component, it belongs in the global stylesheet.

### Animation Conventions

- **Framer Motion for all state-driven animations.** Use `motion.div` with `initial`, `animate`, `exit` props. Never use CSS transitions for component state changes.
- **`AnimatePresence mode="wait"` for view transitions.** When switching between views (form → loading → success), wrap in `AnimatePresence` and give each child a unique `key`.
- **Scroll-triggered: `whileInView` with `viewport={{ once: true }}`.** Sections animate on scroll, but only once.
- **Staggered children: `delay: index * 0.15`.** Lists and grids stagger their entrance. Duration range: 0.3s–0.8s.
- **Respect `prefers-reduced-motion`.** Provide instant alternatives for users who disable animations. Never use animation as the sole indicator of state change.

### API & Data Fetching

- **Centralize all backend calls in a single API client module.** Never call `fetch()` directly from components. Every endpoint gets a typed function with proper error handling.
- **Polling pattern for async operations.** Use `setInterval` in a `useEffect` with `useRef` for the timer. Always include a `MAX_POLLS` limit and cleanup on unmount.
- **SSE via `EventSource`.** For real-time progress, connect to SSE endpoints. Include fallback messages that cycle if the connection drops. Parse JSON from `event.data`. Always close the connection on unmount.
- **FormData for file uploads.** Use `new FormData()`, append fields individually. Serialize objects with `JSON.stringify()` before appending.
- **Error handling: throw from the API client, catch in components.** API functions throw `Error` with descriptive messages. Components catch and display via toast notifications.
- **Attach auth tokens in the API client, not in components.** The centralized API client reads the session token and injects the `Authorization` header. Individual components never touch auth headers.

### Naming Conventions (Frontend)

| Category | Convention | Example |
|----------|-----------|---------|
| Files | kebab-case | `auth-modal.tsx`, `chat-input.tsx` |
| Directories | kebab-case | `_components/`, `components/shared/` |
| Components | PascalCase | `AuthModal`, `ChatMessage` |
| Props interfaces | PascalCase + Props | `ChatMessageProps`, `AuthModalProps` |
| Event handlers | handle + Action | `handleSubmit`, `handleRetry` |
| Custom hooks | use + Name | `useGenerationProgress`, `useAuth` |
| Constants | UPPER_SNAKE_CASE | `MAX_POLLS`, `API_BASE` |
| Zod schemas | camelCase + Schema | `loginSchema`, `profileSchema` |

### Exports

- **Named exports only.** Use `export function Component()` — not `export default`. Exception: Next.js page components use `export default` as required by the framework.
- **Co-export related items.** If a file defines a component and its variants, export both.
- **Types exported alongside code.** `export interface`, `export type` in the same file as the component or function that uses them.

### Import Order

1. React and Next.js: `import { useState } from 'react'`, `import Link from 'next/link'`
2. Third-party libraries: `import { motion } from 'framer-motion'`
3. Internal utilities: `import { cn } from '@/lib/utils'`
4. Internal components: `import { Button } from '@/components/ui/button'`
5. Types (if separate): `import type { FlowState } from './types'`

---

## Backend — FastAPI / Python Conventions

These rules apply to every file under `server/cred-service/`. They are derived from the existing codebase patterns and must be followed for consistency.

### Route Handler Patterns

- **Always `async def`.** All route handlers are async to leverage FastAPI's event loop.
- **Dependency injection for DB sessions.** Use `db: Session = Depends(get_db)` in route parameters. Never instantiate sessions directly in route handlers.
- **Background tasks for long-running work.** Call `background_tasks.add_task(safe_wrapper)` and return a job identifier immediately. The safe wrapper catches all exceptions and marks the job as failed.
- **Read file bytes before returning.** `UploadFile` objects become invalid after the request handler returns. Always `await file.read()` before adding background tasks.
- **HTTP status codes are explicit.** 400 = bad input, 404 = not found, 409 = conflict (e.g., duplicate operation), 500 = server error. Always include a `detail` message.
- **Route handlers don't contain business logic.** They validate input, call services, and format responses. If a route handler is longer than ~30 lines, logic should be extracted to a service.
- **Type every parameter and return value.** Use Pydantic models for request bodies and response schemas. Use `-> JSONResponse` or `-> dict` for return types. Never leave function signatures untyped.

### Service Layer Patterns

- **Services are classes with `__init__` dependencies.** Dependencies (sub-services, fetchers, clients) are injected at construction, not per-method.
- **Background tasks use their own DB session.** Create a new session in a `try/finally` block. Never reuse a route handler's session in a background task — it will be closed.
- **Fault isolation.** When orchestrating multiple independent operations, one failure must not block others. Accumulate errors in a list and decide final status based on how many succeeded.
- **Return error dicts, don't raise.** Services that interact with external APIs return `{"error": str(e), "data_source": "..."}` on failure. The calling layer (route or pipeline) decides how to handle it.
- **Services never raise `HTTPException`.** Only route handlers raise HTTP exceptions. Services return results or error dicts — they don't know about HTTP.

### Database Conventions

- **SQLAlchemy 2.0 declarative.** Models inherit from `Base`. Use `Column`, `String`, `Integer`, `JSON`, `DateTime`, `Text`, `ForeignKey`.
- **Yield-based dependency for route handlers.** The dependency function yields a session and closes it in the `finally` block, ensuring cleanup even on exceptions.
- **Manual session management for background tasks.** Always wrapped in `try/finally` with `db.close()`. Never leave sessions open.
- **Commit after each meaningful write.** Don't batch unrelated writes into a single commit. Store data as it arrives, not all at the end.
- **Handle database URL variations.** Support `postgres://` → `postgresql://` conversion for SQLAlchemy compatibility. Support SQLite for local development with appropriate connection args.
- **Migrations are intentional.** Never let SQLAlchemy auto-create tables in production without review. Schema changes are documented and reviewed.

### Logging Rules

- **`logger = logging.getLogger(__name__)` at module top.** Every file gets its own logger.
- **JSON format in production, human-readable in dev.** Centralized logging configuration that switches based on environment.
- **Always include `job_id` in pipeline logs.** Use f-strings: `logger.info(f"Extraction started for job_id={job_id}")`. This enables single-grep tracing of a full request lifecycle.
- **`exc_info=True` on every `logger.error()`.** Full stack traces are essential for debugging. No exceptions to this rule.
- **Log entry, exit, and errors for every service method.** Entry: what was called and with what input. Exit: what the outcome was. Error: what went wrong and why.
- **Suppress noisy third-party loggers.** ORM engines, HTTP clients, and AI SDK loggers are set to WARNING to keep logs readable.

### Error Handling Hierarchy

1. **Route handlers** raise `HTTPException` with status code and detail message.
2. **Background task wrappers** catch all exceptions, log them, and mark the job as failed in a fresh DB session.
3. **Services** catch exceptions per-operation, log them, and return error dicts. Services never crash the pipeline — they degrade gracefully.
4. **External API calls** are always wrapped in try/except. On failure, return a dict with `"error"` key and metadata (`"data_source"`, `"url"`, `"platform"`).

### Async Patterns

- **`httpx.AsyncClient` for external HTTP calls.** Always use `async with` context manager — never leave clients unclosed.
- **No explicit threading.** Rely on FastAPI/uvicorn's async runtime. Background tasks run in the event loop.
- **`asyncio.sleep()` in SSE streams.** Poll progress every 1 second. Include a timeout to prevent infinite streams.

### SSE (Server-Sent Events) Conventions

- **Short-lived DB sessions in SSE loops.** Open, query, close — on every iteration. Never hold a DB session open for the duration of a stream.
- **`StreamingResponse` with proper headers.** Always include: `Cache-Control: no-cache`, `Connection: keep-alive`, `X-Accel-Buffering: no` (prevents Nginx/proxy buffering).
- **Use raw ASGI middleware, not `BaseHTTPMiddleware`.** BaseHTTPMiddleware buffers streaming responses and breaks SSE. The request logging middleware must be implemented as a raw ASGI middleware class.
- **Terminal states close the stream.** When a job reaches a completed or failed state, yield the final event and break the loop.

### Configuration & Environment

- **Pydantic `BaseSettings` for all config.** Define fields with `Optional[str] = None` for optional vars. Use `case_sensitive = False` and `extra = "ignore"`.
- **Priority-based resolution for env vars.** When multiple env vars can serve the same purpose (e.g., database URL), check them in a defined priority order with a local fallback as the last resort.
- **Factory pattern for interchangeable services.** When multiple implementations exist for the same interface (e.g., email providers), use a factory function that selects the provider based on which env vars are configured. All implementations must share the same method signatures.

### Naming Conventions (Backend)

| Category | Convention | Example |
|----------|-----------|---------|
| Files | snake_case | `extraction.py`, `github_fetcher.py` |
| Classes | PascalCase | `ExtractionService`, `GitHubFetcher` |
| Functions/methods | snake_case | `run_extraction`, `fetch_user_data` |
| Private methods | _prefix | `_store_raw`, `_update_job_status` |
| Constants | UPPER_SNAKE_CASE | `DOMAIN_MAP`, `GUARDRAILS_BASE` |
| Route paths | kebab-style REST | `/api/v1/extract`, `/api/v1/generate/{job_id}` |
| DB tables | snake_case plural | `analysis_jobs`, `raw_data`, `reports` |
| Pydantic models | PascalCase + purpose | `ExtractionResponse`, `GenerationStatusResponse` |

### Import Order (Backend)

1. Standard library: `import os, sys, json, logging, uuid` and `from datetime import datetime`
2. Third-party: `from fastapi import ...`, `from sqlalchemy import ...`, `import httpx`
3. Local app modules: `from app.config import settings`, `from app.database import ...`
4. Local services: `from services.extraction import ExtractionService`

---

## Chat Interface — Conventions

The chat interface is the primary interaction surface for CredDev. These rules govern **how** chat features are built. For specific routes, states, and flows, see `ARCHITECTURE.md` and the relevant PRD.

### Chat UI Patterns

- **Full-viewport layout.** Chat interfaces fill the screen height. No page scrolling — only the message list scrolls internally.
- **Message alignment convention.** Agent messages left-aligned with avatar. User messages right-aligned with distinct accent styling.
- **Typed message system.** Every message has a `type` discriminant. At minimum support: `text`, `loading`, `action`, `system`. Extend with new types as features grow — never overload existing types.
- **Smart auto-scroll.** On new messages, scroll to bottom. If the user has scrolled up, don't force scroll — show a "new message" indicator instead.
- **Input reflects agent state.** The input field is disabled with contextual placeholder text when the agent is processing, waiting for auth, or in any non-input-accepting state.
- **Visual consistency.** Chat surfaces follow the same glass morphism, purple accent, and dark theme conventions as the rest of the app. No separate design language for chat.
- **Optimistic rendering.** User messages appear in the chat immediately on send, before any server response. Never wait for a round-trip to show the user their own message.
- **Graceful reconnection.** If the SSE connection drops or the network is lost mid-conversation, detect the disconnection, show a subtle indicator, and auto-reconnect when possible. Never silently lose messages.
- **Message ordering is guaranteed.** Messages are rendered in chronological order by timestamp. If messages arrive out of order (e.g., SSE reconnection), sort before rendering.

### Conversation Design Rules

- **Agent personality: focused expert.** Friendly, concise, developer-aware tone. Not corporate, not overly casual. Think "senior engineer who respects your time."
- **Off-topic handling: redirect, don't refuse.** Briefly acknowledge, then steer back to the core experience. Vary redirect messages — never repeat the same one consecutively.
- **URL detection is automatic.** When a user message contains a URL, detect the platform using existing domain-to-platform utilities and acknowledge it immediately.
- **Progress updates are chat messages.** Long-running operations (extraction, generation) surface progress as agent messages in the conversation — not as separate overlays or loaders.
- **Error states are conversational.** Errors are explained by the agent with actionable options (retry, skip, continue with partial data) — never as generic banners or toasts.

### Auth Conventions

- **Auth modal is an overlay, not a redirect.** The user never leaves the current page to authenticate. The modal appears contextually and dismisses back to the same state.
- **Auth context is a cross-cutting concern.** A single React context provider exposes auth state (`user`, `isAuthenticated`, `isLoading`) and actions (`signIn`, `signOut`). Components read auth state from context, never from direct API calls.
- **No custom auth implementation.** Use the configured auth provider's SDK for tokens, refresh, and session persistence. No custom password storage or JWT generation.
- **Backend auth is a FastAPI dependency.** Protected endpoints use a single injectable dependency that validates tokens and returns the user. Unauthenticated requests return 401.
- **Session expiry is handled globally.** If any API call returns 401, the frontend auth layer detects it and triggers re-authentication. Application state (conversation, form data, progress) is preserved across the re-auth flow.
- **Progressive auth is the pattern.** Users interact with the product before being asked to authenticate. Auth gates appear at the moment of highest motivation — when the user has already received value and wants to persist it.

---

## LLM & AI Agent — Conventions

These rules apply to any LLM integration — report generation, chat agents, data analysis, or future AI-powered features.

### Prompt Engineering

- **System messages define personality and constraints.** Every LLM call includes a system message that sets the agent's role, boundaries, and output format. Never rely on the user prompt alone to control behavior.
- **Guardrails are immutable.** Safety rules, verification standards, and output format constraints live in the system message and are never overridden by user input. They are defined once and reused across all LLM calls of the same type.
- **Prompts are version-controlled.** Prompt templates live in code as named constants or dedicated files — never as inline strings scattered across service methods. Changing a prompt is a code change that goes through review.
- **Dynamic context is injected, not hardcoded.** Prompts use template variables (today's date, platform names, available data) that are filled at runtime. The template itself stays stable.
- **Be explicit about what the LLM should NOT do.** "Do not hallucinate", "Do not add conversational sign-offs", "If data is missing, say so" — negative constraints are as important as positive instructions.

### Token & Cost Management

- **Use the smallest model that gets the job done.** Don't default to the largest model for every task. Quick classification, URL detection, and simple extraction can use smaller/cheaper models.
- **Set `max_tokens` on every call.** Never let the model decide how long to respond. Set explicit limits based on the expected output size.
- **Conversation history is bounded.** When sending chat history to the LLM, limit to a rolling window of recent messages. Never send the entire conversation — it wastes tokens and can hit context limits. Summarize older context if needed.
- **Track token usage in logs.** Log input tokens, output tokens, and model used for every LLM call. This enables cost monitoring and optimization.

### Streaming Responses

- **Stream LLM responses to the user in real-time.** Never wait for the full response before showing output. Use streaming APIs and render tokens as they arrive.
- **Progress callbacks for long generations.** When generating multi-section reports, provide callbacks that update progress (stage, percentage, message) as the generation progresses.
- **Fallback to non-streaming on failure.** If the streaming connection drops, retry with a non-streaming call. Always have a fallback path.

### Structured Output

- **Use JSON mode when you need structured data.** For data extraction, classification, or any output that will be programmatically consumed, request JSON output with a defined schema.
- **Parse defensively.** LLM JSON output can be malformed. Always wrap `JSON.parse()` / `json.loads()` in try/catch and have a fallback (raw text, partial parse, error dict).
- **Validate LLM output against a schema.** When expecting structured output, validate it against a Zod schema (frontend) or Pydantic model (backend) before using it. Never trust raw LLM output.

### Error Handling for AI

- **LLM calls are unreliable by nature.** Every LLM call must handle: timeouts, rate limits, malformed responses, empty responses, and service outages.
- **Retry with exponential backoff.** On transient failures (429, 500, timeout), retry up to 3 times with increasing delays. Don't retry on 400 (bad request) — that's a prompt bug.
- **Degrade gracefully.** If the LLM fails after retries, the feature should still work in a reduced capacity (show raw data instead of analysis, show cached results, offer manual alternatives).
- **Never expose raw LLM errors to users.** Wrap LLM failures in user-friendly messages. Log the raw error for debugging, show the user an actionable message.

---

## After Making Changes

1. Update `ARCHITECTURE.md` if you changed any file structure, added routes, services, or env vars.
2. Verify all file references in documentation still exist.
3. Test the flows affected by the change.
4. If adding a new frontend component, verify it follows the naming, export, and styling conventions above.
5. If adding a new backend service or route, verify it follows the logging, error handling, and async conventions above.
6. If modifying the chat flow, walk through every state in the state matrix (see PRD-009) to confirm no path is broken.
