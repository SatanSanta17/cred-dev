# PRD-011: Design Token Consolidation

**Status:** Draft — awaiting approval
**Date:** 2026-03-24

---

## Emotion

Every time we touch the UI — a new page, a new component, even a small tweak — we gamble on remembering the exact shade of purple, the right backdrop blur, the precise gradient direction. Right now those values live as raw Tailwind classes scattered across 15+ files. If we ever want to adjust the brand purple, darken the card surfaces, or tweak the glass effect, it's a project-wide find-and-replace with no guarantee we caught them all. This PRD exists so that a theme change becomes a single-file edit — not a treasure hunt.

---

## User Story

As a **developer working on CredDev**, I want all shared visual tokens (colours, gradients, surfaces, shadows) defined in one place, so that I can change the brand identity, adjust dark mode surfaces, or add a new theme without touching dozens of component files.

---

## Scope

This is a **refactor** — no user-facing behaviour changes. The app must look identical before and after. The only change is where style values are defined.

---

## Part 1: CSS Custom Properties & Utility Classes

### Requirements

**P1.R1 — Brand colour tokens.**
Define CSS custom properties in `globals.css` for every brand colour used across 2+ components:

| Token | Current Value | Usage |
|-------|--------------|-------|
| `--color-accent-purple` | `#a855f7` (purple-500) | Accent glows, badges, icons |
| `--color-accent-blue` | `#3b82f6` (blue-500) | Secondary accent, gradients |
| `--color-accent-cyan` | `#22d3ee` (cyan-400) | Tertiary accent, highlights |
| `--color-surface-primary` | `rgb(15 23 42 / 0.9)` (slate-900/90) | Glass card backgrounds |
| `--color-surface-secondary` | `rgb(15 23 42 / 0.5)` (slate-900/50) | Lighter card backgrounds |
| `--color-text-primary` | `#f1f5f9` (slate-100) | Headings |
| `--color-text-secondary` | `#9ca3af` (gray-400) | Body text |
| `--color-text-muted` | `#6b7280` (gray-500) | Captions, timestamps |
| `--color-border-subtle` | `rgb(255 255 255 / 0.1)` (white/10) | Glass borders |
| `--color-border-card` | `#1e293b` (slate-800) | Card borders |

**P1.R2 — Gradient utility classes.**
Define reusable gradient classes in `globals.css` using `@layer utilities`:

| Class | Pattern | Files currently using it |
|-------|---------|------------------------|
| `.bg-page-gradient` | `from-black via-slate-900 to-black` (vertical) | hero.tsx, recruiter-hero.tsx, try/page.tsx, recruiter-waitlist-form.tsx |
| `.bg-cta-gradient` | `from-purple-600 to-blue-600` with hover states | hero.tsx, footer.tsx, try-flow.tsx |
| `.text-brand-gradient` | `text-transparent bg-clip-text from-purple-400 via-blue-400 to-cyan-400` | gradient-text.tsx, generation-loader.tsx |

**P1.R3 — Glass morphism utility classes.**
Define glass surface classes that replace the repeated `bg-slate-900/90 backdrop-blur-xl border border-white/10` pattern:

| Class | Pattern | Files currently using it |
|-------|---------|------------------------|
| `.glass-card` | Surface with blur + subtle border (the main card pattern) | try-flow.tsx (×3), generation-loader.tsx |
| `.glass-card-light` | Lighter variant with less opacity | product-vision.tsx, recruiter-waitlist-form.tsx |

**P1.R4 — Background decoration utilities.**
Define the repeated background grid pattern and glow orbs as utility classes:

| Class | Pattern | Files currently using it |
|-------|---------|------------------------|
| `.bg-grid` | The `linear-gradient` grid with radial mask | hero.tsx, recruiter-hero.tsx, try/page.tsx |
| `.glow-purple`, `.glow-blue`, `.glow-cyan` | Orbital glow shadows | generation-loader.tsx |

**P1.R5 — Badge colour variants.**
Define badge border+text colour combinations as utility classes:

| Class | Pattern | Files currently using it |
|-------|---------|------------------------|
| `.badge-purple` | `border-purple-500/50 text-purple-400` | problem-validation.tsx, product-vision.tsx |
| `.badge-blue` | `border-blue-500/50 text-blue-400` | how-it-works.tsx |
| `.badge-cyan` | `border-cyan-500/50 text-cyan-400` | recruiter-hero.tsx, recruiter-quotes.tsx |

**P1.R6 — Form input base class.**
Define the repeated form input pattern:

| Class | Pattern | Files currently using it |
|-------|---------|------------------------|
| `.input-dark` | `bg-slate-800 border-slate-700 focus:border-cyan-500` | recruiter-waitlist-form.tsx (×3) |

### Acceptance Criteria

- [ ] All tokens defined in `globals.css` using CSS custom properties and `@layer utilities`
- [ ] No visual difference — app looks pixel-identical before and after
- [ ] Every utility class has a comment explaining its purpose
- [ ] Existing `.glass` and `.glow` classes in globals.css are consolidated with the new tokens (no duplication)

---

## Part 2: Component Migration

### Requirements

**P2.R1 — Migrate page backgrounds.**
Replace hardcoded `bg-gradient-to-b from-black via-slate-900 to-black` in hero.tsx, recruiter-hero.tsx, try/page.tsx, and recruiter-waitlist-form.tsx with `.bg-page-gradient`.

**P2.R2 — Migrate glass card surfaces.**
Replace hardcoded `bg-slate-900/90 backdrop-blur-xl border border-white/10` in try-flow.tsx (×3) and generation-loader.tsx with `.glass-card`. Replace lighter variants with `.glass-card-light`.

**P2.R3 — Migrate CTA buttons.**
Replace hardcoded `bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700` in hero.tsx, footer.tsx, and try-flow.tsx with `.bg-cta-gradient`.

**P2.R4 — Migrate background grid pattern.**
Replace the duplicated `bg-[linear-gradient(...)]` grid in hero.tsx, recruiter-hero.tsx, and try/page.tsx with `.bg-grid`.

**P2.R5 — Migrate badge colours.**
Replace inline badge border/text colour overrides with `.badge-purple`, `.badge-blue`, `.badge-cyan`.

**P2.R6 — Migrate form inputs.**
Replace repeated input styling in recruiter-waitlist-form.tsx with `.input-dark`.

**P2.R7 — Migrate glow shadows.**
Replace inline `shadow-[0_0_12px_rgba(...)]` in generation-loader.tsx with `.glow-purple`, `.glow-blue`, `.glow-cyan`.

### Acceptance Criteria

- [ ] Every migrated file uses utility classes or CSS custom properties — no raw colour/gradient values for patterns that appear in 2+ files
- [ ] No visual regression — every page looks identical
- [ ] Removed inline patterns are no longer present (grep confirms zero matches)
- [ ] No dead/unused utility classes left behind from the old `.glass` and `.glow` definitions

---

## Part 3: Documentation & Guard Rails

### Requirements

**P3.R1 — Update ARCHITECTURE.md.**
Add a "Design Tokens" section documenting the token naming convention, where tokens live, and how to add new ones.

**P3.R2 — Verify CLAUDE.md rule enforcement.**
Confirm the new styling rule in CLAUDE.md accurately describes the system after migration. Adjust wording if needed.

### Acceptance Criteria

- [ ] ARCHITECTURE.md has a Design Tokens section with the full token table
- [ ] CLAUDE.md styling rule matches the implemented system
- [ ] New developers reading the docs can add a new colour or surface variant without looking at other component files

---

## Backlog (not in scope)

- **Dark/light theme toggle** — tokens are structured to support this in the future, but this PRD only covers dark mode.
- **Tailwind config integration** — tokens could be registered in `tailwind.config.ts` as theme extensions. Deferred until we evaluate whether CSS custom properties alone are sufficient.
- **Component library extraction** — glass cards, badge variants, and CTA buttons could become shared components. Deferred to a future PRD if reuse grows.
