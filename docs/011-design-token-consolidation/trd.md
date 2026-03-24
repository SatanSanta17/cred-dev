# TRD-011: Design Token Consolidation

**Status:** Draft — awaiting approval
**Date:** 2026-03-24

---

## Overview

Pure refactor — no new routes, no DB changes, no API changes. All work is in the frontend: `globals.css` and ~15 component files.

---

## Part 1: CSS Custom Properties & Utility Classes

### Files Changed

| File | Action |
|------|--------|
| `app/globals.css` | Add CSS custom properties and `@layer utilities` block |

### Implementation Detail

**1a. CSS Custom Properties (`:root` block)**

```css
:root {
  /* Brand colours */
  --color-accent-purple: 168 85 247;    /* purple-500 */
  --color-accent-blue: 59 130 246;      /* blue-500 */
  --color-accent-cyan: 34 211 238;      /* cyan-400 */

  /* Surfaces */
  --color-surface-primary: 15 23 42;    /* slate-900 */
  --color-surface-secondary: 15 23 42;  /* slate-900 (used at lower opacity) */

  /* Text */
  --color-text-primary: 241 245 249;    /* slate-100 */
  --color-text-secondary: 156 163 175;  /* gray-400 */
  --color-text-muted: 107 114 128;      /* gray-500 */

  /* Borders */
  --color-border-subtle: 255 255 255;   /* white (used at 10% opacity) */
  --color-border-card: 30 41 59;        /* slate-800 */
}
```

Use RGB triplet format so consumers can apply opacity: `rgb(var(--color-accent-purple) / 0.2)`.

**1b. Utility Classes (`@layer utilities`)**

```css
@layer utilities {
  /* Page backgrounds */
  .bg-page-gradient {
    background: linear-gradient(to bottom, #000, rgb(var(--color-surface-primary)), #000);
  }

  /* CTA button gradient */
  .bg-cta-gradient {
    background: linear-gradient(to right, #9333ea, #2563eb);
  }
  .bg-cta-gradient:hover {
    background: linear-gradient(to right, #7e22ce, #1d4ed8);
  }

  /* Gradient text */
  .text-brand-gradient {
    background: linear-gradient(to right, #a855f7, #3b82f6, #22d3ee);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Glass morphism surfaces */
  .glass-card {
    background: rgb(var(--color-surface-primary) / 0.9);
    backdrop-filter: blur(24px);
    border: 1px solid rgb(var(--color-border-subtle) / 0.1);
  }
  .glass-card-light {
    background: rgb(var(--color-surface-primary) / 0.5);
    backdrop-filter: blur(12px);
    border: 1px solid rgb(var(--color-border-card));
  }

  /* Background grid decoration */
  .bg-grid {
    background-image:
      linear-gradient(to right, #4f4f4f2e 1px, transparent 1px),
      linear-gradient(to bottom, #4f4f4f2e 1px, transparent 1px);
    background-size: 14px 24px;
    mask-image: radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%);
  }

  /* Glow shadows */
  .glow-purple { box-shadow: 0 0 12px rgb(var(--color-accent-purple) / 0.6); }
  .glow-blue   { box-shadow: 0 0 10px rgb(var(--color-accent-blue) / 0.6); }
  .glow-cyan   { box-shadow: 0 0 8px rgb(var(--color-accent-cyan) / 0.6); }

  /* Badge colour variants */
  .badge-purple { border-color: rgb(var(--color-accent-purple) / 0.5); color: #a855f7; }
  .badge-blue   { border-color: rgb(var(--color-accent-blue) / 0.5);   color: #3b82f6; }
  .badge-cyan   { border-color: rgb(var(--color-accent-cyan) / 0.5);   color: #22d3ee; }

  /* Form input base */
  .input-dark {
    background-color: #1e293b;           /* slate-800 */
    border-color: rgb(var(--color-border-card));
  }
  .input-dark:focus {
    border-color: #22d3ee;               /* cyan-400 */
  }
}
```

**1c. Consolidate existing `.glass` and `.glow`**

The existing `.glass` and `.glow` classes in `globals.css` will be replaced by the new `.glass-card` and `.glow-purple` utilities. Any components currently using `.glass` or `.glow` will be updated in Part 2.

### Increment 1 (PR-sized)

- Add all CSS custom properties and utility classes to `globals.css`
- Consolidate/remove old `.glass` and `.glow` definitions
- No component changes yet — this is additive only

---

## Part 2: Component Migration

### Files Changed

| File | Changes |
|------|---------|
| `components/sections/hero.tsx` | `.bg-page-gradient`, `.bg-grid`, `.bg-cta-gradient` |
| `app/recruiters/_components/recruiter-hero.tsx` | `.bg-page-gradient`, `.bg-grid`, `.badge-cyan` |
| `app/try/page.tsx` | `.bg-page-gradient`, `.bg-grid` |
| `app/recruiters/_components/recruiter-waitlist-form.tsx` | `.bg-page-gradient`, `.input-dark`, `.glass-card-light` |
| `app/try/_components/try-flow.tsx` | `.glass-card` (×3), `.bg-cta-gradient` |
| `app/try/_components/generation-loader.tsx` | `.glass-card`, `.glow-purple`, `.glow-blue`, `.glow-cyan`, `.text-brand-gradient` |
| `components/sections/footer.tsx` | `.bg-cta-gradient` |
| `components/sections/how-it-works.tsx` | `.badge-blue` |
| `components/sections/problem-validation.tsx` | `.badge-purple` |
| `app/recruiters/_components/recruiter-quotes.tsx` | `.badge-cyan` |
| `components/sections/product-vision.tsx` | `.badge-purple`, `.glass-card-light` |
| `components/shared/gradient-text.tsx` | `.text-brand-gradient` |

### Migration Rules

1. **Read each file** before editing — never assume class usage from memory
2. **Replace only exact matches** — if a component uses a unique one-off colour, leave it inline
3. **Preserve responsive/state modifiers** — e.g., `md:` or `hover:` prefixes stay; the utility class handles only the base style
4. **Test visually** after each file — no batch edits without verification

### Increment 2 (PR-sized)

- Migrate page-level components: hero.tsx, recruiter-hero.tsx, try/page.tsx, recruiter-waitlist-form.tsx
- These share the most repeated patterns (page gradient, grid, orbs)

### Increment 3 (PR-sized)

- Migrate interaction components: try-flow.tsx, generation-loader.tsx, footer.tsx
- These share glass card and CTA gradient patterns

### Increment 4 (PR-sized)

- Migrate section components: how-it-works.tsx, problem-validation.tsx, recruiter-quotes.tsx, product-vision.tsx, gradient-text.tsx
- These share badge colours and gradient text

### Increment 5 (PR-sized)

- Grep verification: confirm zero remaining matches for the migrated patterns
- Remove any dead utility classes from globals.css
- Visual diff: open each page and confirm no regressions

---

## Part 3: Documentation & Guard Rails

### Files Changed

| File | Changes |
|------|---------|
| `ARCHITECTURE.md` | Add "Design Tokens" section |
| `CLAUDE.md` | Verify styling rule accuracy (adjust if needed) |

### Increment 6 (PR-sized)

- Add Design Tokens section to ARCHITECTURE.md with:
  - Token naming convention (`--color-{category}-{name}`)
  - Utility class naming convention (`.{purpose}-{variant}`)
  - Full token table
  - Instructions for adding new tokens
- Verify CLAUDE.md styling rule still matches the implemented system
