# CredDev — Development Rules

## First Steps Every Session

1. Read `ARCHITECTURE.md` before making any changes — it contains the full system design, file map, data flow, and platform-specific conventions.
2. If modifying any file, read it first — don't assume from memory.
3. If modifying a page, read its `_components/` or relevant section files first.
4. Always ask for plan confirmation before coding
5. Never make a document without being asked for explicitly

## Critical Rules — Do NOT Violate

- **Follow the development process — no shortcuts.** Every change follows this sequence: (1) Understand the emotion — why does this matter to the user? (2) Consolidate a PRD in `docs/prds/` (3) Create a mental model of the user experience (4) Design architecture and document necessary changes (5) Review — get explicit approval (6) Implement in small increments. No step is skipped.
- **No code changes without a documented PRD.** Every feature, fix, or refactor must have a written PRD (Product Requirements Document) reviewed and approved before any code is touched. No exceptions — not even "small" changes. **One exception:** trivial fixes (typos, CSS tweaks, one-line bugs) may skip the PRD — but still require explicit approval before any code is changed. Never change code silently.
- **Break large changes into small, pushable increments.** The PRD defines the full scope (the big picture). Implementation happens in small steps — each one self-contained, verifiable, and non-breaking. Never lose sight of the PRD's end goal, but never try to ship it all at once either.
- **Verify before every push.** Before code is pushed, every change must pass four checks: (1) **Code quality** — read every modified file end-to-end for syntax errors, unused imports, broken references, and consistency with existing patterns. (2) **PRD compliance** — walk through each PRD requirement and confirm the implementation covers it. (3) **No regressions** — trace existing flows through modified files to confirm the happy path still works and new code only activates in the intended scenario. (4) **Documentation consistency** — check if ARCHITECTURE.md or any README in the modified area is now factually incorrect. If it contradicts the new code, fix it.
- **Respect existing architecture decisions.** `ARCHITECTURE.md` documents platform-specific rules, error handling patterns, and constraints that must not be violated. Read and follow them.

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

## After Making Changes

1. Update `ARCHITECTURE.md` if you changed any file structure, added routes, services, or env vars.
2. Verify all file references in documentation still exist.
3. Test the flows affected by the change.
