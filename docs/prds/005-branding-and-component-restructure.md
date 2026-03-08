# PRD-005: CredDev Branding + Component Restructure

**Status:** Implemented
**Date:** 2026-03-08

## Emotion

A developer lands on CredDev for the first time and sees a headline — but no brand. No logo, no name at the top. It feels like an anonymous template, not a product with identity. Meanwhile, the codebase is starting to mix landing page sections with route-specific components in the same folder, making it harder to navigate as the project grows.

## Problem

1. **No brand presence on the landing page.** The hero section jumps straight into the headline with no logo or product name visible. The only branding is in the browser tab (favicon) and the back-link on inner pages. First impression lacks identity.

2. **Component folder is a catch-all.** `components/sections/` contains both landing page sections (hero, footer) and route-specific components (try-flow, try-form, generation-loader, waitlist-form). These have nothing in common — landing sections are used by `app/page.tsx`, while try components are used exclusively by `app/try/page.tsx`. As more pages are added (recruiter page coming next), this will get worse.

## Solution

### Part A: Brand Component + Hero Branding

Create a reusable `Brand` component that renders the CredDev logo icon (`meta-icon.png`) + "CredDev" in gradient text. Place it at the top of the hero section as the first visible element.

**Brand component (`components/shared/brand.tsx`):**
- Props: `size` (`sm` | `md` | `lg`), `className`
- Renders: `<img>` of logo icon + `<GradientText>CredDev</GradientText>` inline
- `sm`: 24px icon, text-lg — for nav bars, back links
- `md`: 32px icon, text-xl — default
- `lg`: 40px icon, text-2xl — for hero section
- Composes `GradientText` (existing shared component)

**Hero update:**
- Add `<Brand size="lg" />` at the very top of the hero section, above the headline
- Animate it with the existing stagger pattern (first element to appear)
- Centered, like the rest of the hero content

**BackLink refactor:**
- Replace the inline `<GradientText>CredDev</GradientText>` in `showBrand` mode with `<Brand size="sm" />`
- Keeps the arrow + navigation behavior, just uses the new brand component for display

### Part B: Component Restructure (Next.js Co-location)

Move route-specific components into `_components/` folders inside their route directories. This follows the Next.js App Router co-location convention — components live next to the page that uses them.

**Target structure:**
```
components/
├── sections/              # Landing page sections ONLY
│   ├── hero.tsx
│   ├── how-it-works.tsx
│   ├── problem-validation.tsx
│   └── footer.tsx
├── shared/                # Truly reusable across pages
│   ├── back-link.tsx
│   ├── brand.tsx          ← NEW
│   ├── gradient-text.tsx
│   └── waitlist-count.tsx
└── ui/                    # shadcn primitives (unchanged)

app/
├── try/
│   ├── page.tsx
│   └── _components/       ← NEW
│       ├── try-flow.tsx
│       ├── try-form.tsx
│       └── generation-loader.tsx
├── waitlist/
│   ├── page.tsx
│   └── _components/       ← NEW
│       └── waitlist-form.tsx
```

**What moves:**
| File | From | To |
|------|------|----|
| `try-flow.tsx` | `components/sections/` | `app/try/_components/` |
| `try-form.tsx` | `components/sections/` | `app/try/_components/` |
| `generation-loader.tsx` | `components/sections/` | `app/try/_components/` |
| `waitlist-form.tsx` | `components/sections/` | `app/waitlist/_components/` |

**What stays:**
- `hero.tsx`, `how-it-works.tsx`, `problem-validation.tsx`, `footer.tsx` — these are landing page sections, they belong in `components/sections/`
- `lib/use-generation-progress.ts` — stays in `lib/`, it's a hook not a component
- All `components/shared/` and `components/ui/` — unchanged

**Import path changes:**
- `app/try/page.tsx`: `@/components/sections/try-flow` → `./_components/try-flow`
- `try-flow.tsx`: sibling imports (`./try-form`, `./generation-loader`) stay the same since all three move together. `@/lib/` and `@/components/` imports unchanged.
- `app/waitlist/page.tsx`: `@/components/sections/waitlist-form` → `./_components/waitlist-form`

## Out of Scope

- Recruiter waitlist changes (separate PRD)
- SVG logo creation (using existing PNG icon)
- About page cleanup
- Footer branding changes (footer already has GradientText inline, not worth changing for consistency alone)

## Implementation Increments

1. **Create `Brand` component** — new file, no existing code changes
2. **Add branding to hero** — update hero.tsx to use Brand at the top
3. **Refactor BackLink to use Brand** — replace inline GradientText with Brand component
4. **Move try-page components** — create `app/try/_components/`, move 3 files, update imports
5. **Move waitlist-form** — create `app/waitlist/_components/`, move 1 file, update imports
6. **Verify + document** — ARCHITECTURE.md, CHANGELOG.md, full import scan
