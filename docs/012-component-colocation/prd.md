# PRD-012: Component Co-location Cleanup

**Status:** Draft
**Author:** Burhanuddin
**Created:** 2026-03-24

---

## Emotion

When I open the project and see `components/sections/` with 4 files that are only used on the landing page, it looks like a shared library — but 3 of them aren't shared at all. It makes me second-guess where to put new components and whether existing ones are truly shared or just misplaced. I want the file tree to tell the truth: if something is private to a route, it lives next to that route. If it's genuinely shared (or has clear future reuse potential), it lives in `components/shared/`. No guessing.

---

## User Story

As a developer working on CredDev, I want every component to live where it belongs — co-located with its route if it's route-specific, or in a shared directory if it's used (or reasonably expected to be used) across multiple routes — so that I can instantly understand scope and impact by looking at the file tree.

---

## Audit Results

### Guiding principle

A component belongs in `components/shared/` if it meets **either** of these conditions: (a) it's already imported by 2+ routes, or (b) it has generic props/interface that make future reuse across routes likely. A component belongs co-located with its route if it has hardcoded content, branding, or structure tied to a single page.

### Current component placement vs. actual usage

| Component | Current Location | Imported By | Future Reuse? | Verdict |
|-----------|-----------------|-------------|---------------|---------|
| `Hero` | `components/sections/` | `app/page.tsx` only | No — hardcoded landing copy, brand-specific layout | **Move** → `app/_components/` |
| `HowItWorks` | `components/sections/` | `app/page.tsx` only | No — hardcoded 3-step landing flow | **Move** → `app/_components/` |
| `ProblemValidation` | `components/sections/` | `app/page.tsx` only | No — landing-specific quote wrapper with hardcoded data | **Move** → `app/_components/` |
| `Footer` | `components/sections/` | `app/page.tsx`, `app/recruiters/page.tsx` | Yes — likely used on every public page | **Relocate** → `components/shared/` |
| `BackLink` | `components/shared/` | try, report, recruiters | N/A — already shared (3 routes) | **Keep** |
| `Brand` | `components/shared/` | hero, back-link, recruiter-hero | N/A — already shared (3+ routes) | **Keep** |
| `GradientText` | `components/shared/` | 7 consumers across 4+ routes | N/A — foundational utility | **Keep** |
| `QuoteCard` | `components/shared/` | `quotes-carousel.tsx` only | Yes — generic `{text, role}` props, exports reusable `Quote` interface, useful for testimonials/feedback anywhere | **Keep** |
| `QuotesCarousel` | `components/shared/` | problem-validation, recruiter-quotes | N/A — already shared (2 routes) | **Keep** |
| `WaitlistCount` | `components/shared/` | `recruiter-waitlist-form.tsx` only | Yes — already has `userType: 'developer' \| 'recruiter' \| 'all'` prop, `hideUntil` threshold, designed for reuse when developer waitlist launches | **Keep** |

### `components/sections/` directory

After moving 3 components out and relocating Footer, `components/sections/` becomes empty and should be deleted. This eliminates a confusing directory that suggests "shared sections" but actually contained single-route components.

### Page files with inline sub-components

| Page | Lines | Inline Components | Verdict |
|------|-------|-------------------|---------|
| `app/about/page.tsx` | 279 | Data arrays (`missionValues`, `teamMembers`) + inline rendering | **Extract** — create `app/about/_components/` |
| `app/report/Burhanuddin/page.tsx` | 666 | `SkillGroup`, `SignalBadge`, `RiskFlagCard` (named functions) | **Extract** — create `app/report/_components/` |

---

## Requirements

### Part 1 — Co-locate Landing Page Sections & Eliminate `components/sections/`

> Move `Hero`, `HowItWorks`, and `ProblemValidation` from `components/sections/` into `app/_components/` (landing page's private components). Move `Footer` to `components/shared/` (it's shared across 2 routes). Delete the now-empty `components/sections/` directory.

**P1.R1** — Create `app/_components/` directory for landing page private components.

**P1.R2** — Move `hero.tsx`, `how-it-works.tsx`, `problem-validation.tsx` from `components/sections/` to `app/_components/`. File names and exports stay the same.

**P1.R3** — Move `footer.tsx` from `components/sections/` to `components/shared/`. It's imported by 2 routes and is genuinely shared.

**P1.R4** — Update imports in `app/page.tsx` — the 3 sections now import from `./_components/`, Footer imports from `@/components/shared/footer`.

**P1.R5** — Update the `Footer` import in `app/recruiters/page.tsx` to reference `@/components/shared/footer`.

**P1.R6** — Delete the empty `components/sections/` directory.

**P1.R7** — Zero broken imports. The app must build cleanly.

#### Acceptance Criteria — Part 1

- [ ] `app/_components/` contains `hero.tsx`, `how-it-works.tsx`, `problem-validation.tsx`
- [ ] `components/shared/footer.tsx` exists
- [ ] `components/sections/` directory no longer exists
- [ ] `app/page.tsx` imports from `./_components/` for Hero, HowItWorks, ProblemValidation
- [ ] `app/page.tsx` and `app/recruiters/page.tsx` both import Footer from `@/components/shared/footer`
- [ ] `next build` passes (or `next dev` compiles without errors)

---

### Part 2 — Extract Inline Sub-components from Large Pages

> Extract named sub-components from `about/page.tsx` and `report/Burhanuddin/page.tsx` into co-located `_components/` directories. This makes the page files thin composition shells and the sub-components independently testable.

**P2.R1** — Create `app/about/_components/` directory.

**P2.R2** — Extract the about page's team section (team member data + card rendering) into a dedicated component (e.g., `team-section.tsx`). Extract the values/mission section into its own component (e.g., `values-section.tsx`). The about page should become a thin composition file that imports and arranges these sections.

**P2.R3** — Create `app/report/_components/` directory (shared across all report routes via `../`).

**P2.R4** — Extract `SkillGroup`, `SignalBadge`, and `RiskFlagCard` from `app/report/Burhanuddin/page.tsx` into `app/report/_components/`. These are report-specific UI patterns that will be reused when more report pages are added.

**P2.R5** — The Burhanuddin report page should drop from ~666 lines to under ~400 lines after extraction.

**P2.R6** — Zero broken imports. The app must build cleanly.

#### Acceptance Criteria — Part 2

- [ ] `app/about/_components/` contains extracted section components
- [ ] `app/about/page.tsx` is a thin composition file (imports + layout, no inline named sub-components)
- [ ] `app/report/_components/` contains `skill-group.tsx`, `signal-badge.tsx`, `risk-flag-card.tsx`
- [ ] `app/report/Burhanuddin/page.tsx` imports from `../_components/` and is under 400 lines
- [ ] No inline named function components remain at the bottom of page files
- [ ] `next build` passes

---

### Part 3 — Documentation Update

**P3.R1** — Update `ARCHITECTURE.md` Project Structure tree to reflect all moved files and new `_components/` directories.

**P3.R2** — Update the "Key Frontend Components" table in `ARCHITECTURE.md` with any new file paths.

**P3.R3** — Verify `CLAUDE.md` co-location rules are still accurate after the changes.

#### Acceptance Criteria — Part 3

- [ ] Project Structure tree in `ARCHITECTURE.md` matches actual file system
- [ ] Key Frontend Components table has correct file paths
- [ ] No stale references to `components/sections/` anywhere in documentation

---

## Backlog (not in scope)

- **Layout-level Footer** — Footer is used on 2 pages now. If it's needed on all pages, move it into the root layout instead of importing per-page.
- **Barrel exports** — Consider `index.ts` barrel files in `components/shared/` and `_components/` directories for cleaner imports. Not urgent.
- **About page values section** — Currently has placeholder text (`[Describe how you value transparency...]`). Will need real content before launch.
- **Report Pradeep page** — Currently only Burhanuddin exists. When Pradeep is added, the extracted `app/report/_components/` will be ready.
