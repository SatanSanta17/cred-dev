# PRD-003: Developer-Focused Landing Page Redesign

**Status:** Implemented
**Created:** 2026-03-06
**Author:** Burhanuddin

---

## 1. The Emotion

CredDev's landing page tries to speak to two audiences at once — developers and recruiters — and ends up convincing neither. A developer lands on the page and sees recruiter-focused framing ("Recruiters Struggle to Evaluate"), fake scores that don't exist in the product (87/100, "Top 15% Globally"), and a wall of 7 full-screen sections before they ever reach the "Try Now" button. On mobile — where most people will first encounter the link — the floating metric cards are hidden entirely, and the sheer scroll length means most visitors never make it past the third section.

The recruiter pitch is premature. There is no recruiter flow, no developer pool to browse, no saved searches. Promising these things undermines trust before it's earned.

The developer needs to feel: **"This looks sharp, I understand what it does in 5 seconds, and I want to try it right now."**

The fix: strip the page down to a developer-first experience. Fewer sections, mobile-first layout, honest product representation, one clear path — generate your free report.

---

## 2. Mental Model (User Experience)

### Current Flow (7 sections, ~7 full screens on mobile)
```
Hero → Problem → HowItWorks → SampleOutput → ForDevelopers → ForRecruiters → Footer
```

### New Flow (4 sections, ~3–4 screens on mobile)
```
Hero → HowItWorks → ProblemValidation → Footer
```

**What the developer experiences:**

1. **Hero** — They land. Within 3 seconds they read: "Your code speaks. We verify it." One gradient CTA: "Generate Your Free Report". Below it, a single line: "Takes 2 minutes. No sign-up required." On mobile, this is the full first screen — no hidden elements, no clutter.

2. **How It Works** — They scroll once. Three steps shown in a compact horizontal layout (mobile: vertical stack). Step 1: Enter your GitHub username, LeetCode handle, and upload your resume. Step 2: We analyze your repos, problem-solving, and resume claims. Step 3: Get 3 detailed reports emailed to you — free. Each step is one line + icon. No feature badges, no hover effects, no cards-in-cards.

3. **Problem Validation** — A single section replacing SampleOutput, ForDevelopers, and ForRecruiters. This is not a testimonials section — it's proof that the problem is real. Real quotes from conversations with developers and recruiters who resonate with the hiring problem, attributed anonymously ("— Senior Backend Engineer", "— Tech Recruiter, Series B startup"). Displays 3 quotes at a glance; if more than 3 exist, they rotate automatically. Also includes a "View Sample Report" link to the real Burhanuddin report and the waitlist count if above threshold. Placeholder quotes for now — Burhanuddin will fill in real ones from his conversations.

4. **Footer** — Condensed. Final CTA + copyright. No multi-column link grid (there are only 3 real pages: /, /try, /waitlist).

### What gets removed

| Current Section | Decision | Reason |
|----------------|----------|--------|
| Problem | Remove | Recruiter-framed problems. Developer doesn't need convincing that resumes are broken — they already know. The product sells itself. |
| SampleOutput | Remove | Hardcoded scores (87/100, "Top 15%") don't exist in the real product. Creates a trust gap — the actual report is text-based, not a score dashboard. Replaced by a link to the real sample report. |
| ForDevelopers | Remove | 6 benefit cards is marketing padding. The value prop is in the hero and how-it-works. Features like "Share Your Profile" and "Get Discovered" don't exist yet. |
| ForRecruiters | Remove | No recruiter flow exists. No developer pool to browse. Premature promise. Will be added back when the recruiter experience is built. |

### What stays (reworked)

| Current Section | Change |
|----------------|--------|
| Hero | Simplified. Developer-only messaging. Mobile-first layout. Single primary CTA. "View Sample Report" as secondary CTA. Remove floating cards (hidden on mobile anyway). Remove waitlist link from hero (moved to footer/social proof). |
| HowItWorks | Radically simplified. 3 steps, minimal copy, no feature badges. Horizontal on desktop, vertical on mobile. |
| Footer | Condensed. One CTA row + copyright line. Remove multi-column link grid. |

---

## 3. Requirements

### Must Have

- **Mobile-first hero** — Full content visible on a 375px screen without scrolling. No elements hidden via `hidden md:grid`. CTA button is thumb-reachable.
- **Developer-only messaging** — No recruiter language anywhere on the page. No "hire with confidence", no "find verified talent". The page speaks to the developer: your code, your skills, your report.
- **Honest product representation** — No fake scores, no hardcoded percentiles, no score dashboards. The product generates text reports — represent that honestly. Link to the real sample report instead.
- **3-step "How It Works"** — Compact. Each step: icon + title + one line of description. No feature badges. Accurate to the real flow (no "One-click OAuth" — the product uses direct username input).
- **Problem validation section** — Real quotes from developer/recruiter conversations proving the problem exists. 3 quotes visible at a time; if the quotes array has more than 3 entries, auto-rotate with a smooth crossfade (interval ~5s, pause on hover). Each quote: the statement + anonymous attribution (role + context, e.g. "— Senior Backend Engineer" or "— Tech Recruiter, Series B startup"). Placeholder quotes for now — designed so Burhanuddin can swap in real ones by editing a single array. Also includes a link to the real sample report and optional waitlist count.
- **Reduced page length** — 4 sections max (Hero, HowItWorks, ProblemValidation, Footer). Target: 3–4 full screens on mobile, down from ~7.
- **Keep the dark theme** — Black/slate/purple/blue gradient aesthetic stays. This is the brand identity.
- **Framer Motion animations stay** — Fade-in, slide-up on scroll. Keep them subtle and consistent.

### Should Have

- **Server components where possible** — Hero, HowItWorks, and Footer don't need client-side interactivity beyond animations. If Framer Motion requires `'use client'`, that's fine — but sections without animation should be server components for better SEO and initial load.
- **Structured metadata** — Proper `<title>`, `<meta description>`, and Open Graph tags for the landing page.

### Won't Do (this PRD)

- Add actual testimonials (requires real user feedback — use placeholder copy for now)
- Build a recruiter landing page (separate future PRD when recruiter flow exists)
- Change the /try page or any backend logic
- Add analytics or tracking
- Change the /waitlist page
- Build profile pages or shareable cards (backlog items)

---

## 4. Architecture & Changes Required

### Files Modified

| File | Change |
|------|--------|
| `app/page.tsx` | Replace 7-section layout with 4-section layout: Hero, HowItWorks, ProblemValidation, Footer |
| `components/sections/hero.tsx` | Rewrite. Developer-only messaging, mobile-first, single primary CTA, remove floating cards, remove waitlist link |
| `components/sections/how-it-works.tsx` | Rewrite. 3-step compact layout, remove feature badges, fix inaccurate copy ("One-click OAuth") |
| `components/sections/footer.tsx` | Simplify. Single CTA row + copyright. Remove multi-column link grid |

### New Files

| File | Purpose |
|------|---------|
| `components/sections/problem-validation.tsx` | New section replacing SampleOutput + ForDevelopers + ForRecruiters. Real quotes from developer/recruiter conversations validating the problem, rotating carousel (3 visible, auto-rotate if >3), link to real sample report, optional waitlist count |

### Files Removed (deleted or unused)

| File | Reason |
|------|--------|
| `components/sections/problem.tsx` | Section removed from landing page |
| `components/sections/sample-output.tsx` | Section removed — replaced by honest sample report link in social proof |
| `components/sections/for-developers.tsx` | Section removed — value prop consolidated into hero and how-it-works |
| `components/sections/for-recruiters.tsx` | Section removed — no recruiter flow exists yet |

**Note:** These files should be deleted, not just unused. Dead code is noise. If the recruiter section is needed later, it will be rebuilt from scratch for the recruiter-specific experience.

### Dependencies

- No new npm packages needed
- `react-countup` package can be removed (only used in `sample-output.tsx` for fake score animation)
- All existing shared components (`GradientText`, `FloatingCard`, `Badge`, `Button`, `Card`) remain available

### Component Map (new)

```
app/page.tsx
├── components/sections/hero.tsx           (rewritten)
├── components/sections/how-it-works.tsx   (rewritten)
├── components/sections/problem-validation.tsx (new)
└── components/sections/footer.tsx         (simplified)
```

---

## 5. Design Direction

### Hero (Mobile-First)

**Desktop (md+):**
```
┌──────────────────────────────────────────────┐
│                                              │
│            Your code speaks.                 │
│            We verify it.                     │
│                                              │
│    AI-powered credibility reports from       │
│     your GitHub, LeetCode, and resume        │
│                                              │
│   [ Generate Your Free Report ]              │
│       View Sample Report →                   │
│                                              │
│    Takes 2 minutes. No sign-up required.     │
│                                              │
└──────────────────────────────────────────────┘
```

**Mobile (< md):**
```
┌─────────────────────┐
│                     │
│   Your code speaks. │
│   We verify it.     │
│                     │
│  AI-powered reports │
│  from your GitHub,  │
│  LeetCode & resume  │
│                     │
│ [Generate Free Report]│
│  View Sample Report → │
│                     │
│  2 min. No sign-up. │
│                     │
└─────────────────────┘
```

### How It Works (Compact)

**Desktop:**
```
┌──────────────────────────────────────────────┐
│            How It Works                      │
│                                              │
│  ┌──────┐    ┌──────┐    ┌──────┐           │
│  │  01  │    │  02  │    │  03  │           │
│  │ 🔗   │ →  │ 🧠   │ →  │ 📧   │           │
│  │Submit │    │We    │    │Get 3 │           │
│  │your   │    │analyze│    │reports│           │
│  │profiles│    │signals│    │emailed│           │
│  └──────┘    └──────┘    └──────┘           │
└──────────────────────────────────────────────┘
```

**Mobile (vertical stack):**
```
┌─────────────────────┐
│   How It Works      │
│                     │
│  01 — Submit        │
│  Enter GitHub,      │
│  LeetCode & resume  │
│        │            │
│  02 — We Analyze    │
│  Repos, problems,   │
│  resume claims      │
│        │            │
│  03 — Get Reports   │
│  3 detailed reports │
│  emailed free       │
└─────────────────────┘
```

### Problem Validation (Rotating Quotes)

**Desktop:**
```
┌──────────────────────────────────────────────┐
│                                              │
│        The problem is real.                  │
│   Developers and recruiters agree.           │
│                                              │
│  ┌────────┐  ┌────────┐  ┌────────┐        │
│  │ "quote" │  │ "quote" │  │ "quote" │        │
│  │ — Role  │  │ — Role  │  │ — Role  │        │
│  └────────┘  └────────┘  └────────┘        │
│        (auto-rotates if > 3 quotes)          │
│                                              │
│     See what a real report looks like        │
│     [ View Burhanuddin's Report → ]          │
│                                              │
│       X developers on the waitlist           │
│                                              │
└──────────────────────────────────────────────┘
```

**Mobile (vertical, 1 quote visible, swipe/auto-rotate):**
```
┌─────────────────────┐
│                     │
│  The problem is     │
│  real.              │
│                     │
│  ┌───────────────┐  │
│  │ "quote text   │  │
│  │  here..."     │  │
│  │ — Role, ctx   │  │
│  └───────────────┘  │
│     ● ○ ○  (dots)   │
│                     │
│  View Sample Report →│
│                     │
│  X devs on waitlist │
│                     │
└─────────────────────┘
```

**Quote data structure (easy to edit):**
```ts
const QUOTES = [
  { text: "Placeholder quote 1...", role: "Senior Backend Engineer" },
  { text: "Placeholder quote 2...", role: "Tech Recruiter, Series B startup" },
  { text: "Placeholder quote 3...", role: "Engineering Manager" },
  // Add more — component auto-rotates if > 3
]
```

---

## 6. Implementation Plan (Small Increments)

### Increment 1: Update page.tsx layout
- Replace 7-section import list with 4 sections
- Remove imports for Problem, SampleOutput, ForDevelopers, ForRecruiters
- Add import for new ProblemValidation component

### Increment 2: Rewrite hero.tsx
- Developer-only messaging ("Your code speaks. We verify it.")
- Single primary CTA: "Generate Your Free Report" → /try
- Secondary text link: "View Sample Report" → /report/Burhanuddin
- Tagline: "Takes 2 minutes. No sign-up required."
- Remove CREDDEV_METRICS floating cards
- Remove waitlist link
- Remove scroll indicator
- Mobile-first: all content visible on 375px without any `hidden` breakpoint classes

### Increment 3: Rewrite how-it-works.tsx
- 3 compact steps with accurate copy:
  - Step 1: "Submit your profiles" — GitHub username, LeetCode handle, resume upload
  - Step 2: "We analyze real signals" — repos, problem-solving, resume claims
  - Step 3: "Get 3 detailed reports" — emailed to you, free
- Remove feature badges (`["One-click OAuth", "Secure connection", ...]`)
- Desktop: horizontal 3-column grid
- Mobile: vertical stack with connecting indicators

### Increment 4: Create problem-validation.tsx
- Section heading: "The problem is real." with subtext "Developers and recruiters agree."
- Quotes component: renders from a `QUOTES` array (easy to edit — just add objects with `text` and `role`)
- Desktop: 3 quotes visible in a row (cards with quote text + anonymous role attribution)
- Mobile: single quote visible with dot indicators, auto-rotate
- If `QUOTES.length > 3`: auto-rotate every ~5 seconds with crossfade animation, pause on hover
- If `QUOTES.length <= 3`: static display, no rotation
- "View Sample Report" link to /report/Burhanuddin
- WaitlistCount component (reuse existing, developer type, with threshold)
- Placeholder quotes for now — Burhanuddin fills in real ones later
- No fake scores, no hardcoded metrics

### Increment 5: Simplify footer.tsx
- Single CTA: "Generate Your Free Report" button
- One-line copyright
- Remove multi-column link grid (About page doesn't exist, Features anchor broken without SampleOutput section)
- Keep contact email link

### Increment 6: Delete removed files + cleanup
- Delete: `problem.tsx`, `sample-output.tsx`, `for-developers.tsx`, `for-recruiters.tsx`
- Remove `react-countup` from `package.json` if no longer used elsewhere
- Remove `FloatingCard` component if no longer imported anywhere
- Verify no broken imports across the codebase

### Increment 7: Verify and document
- Check all pages render: /, /try, /waitlist, /report/[name]
- Check mobile layout on 375px viewport
- Check that /try flow still works (no landing page changes should affect it)
- Update ARCHITECTURE.md with new component map
- Update CHANGELOG.md

---

## 7. Success Criteria

- Landing page has 4 sections: Hero, HowItWorks, ProblemValidation, Footer
- Mobile: entire page fits in 3–4 full screens (down from ~7)
- No fake scores, no hardcoded percentiles, no score dashboards anywhere on the page
- No recruiter-specific language on the landing page
- Hero is fully visible on 375px mobile viewport — no hidden elements
- "How It Works" copy accurately reflects the real product flow (no "OAuth", no "rankings")
- Real sample report is linked (not a fake dashboard)
- /try page and generation flow are completely unaffected
- Dead files (problem.tsx, sample-output.tsx, for-developers.tsx, for-recruiters.tsx) are deleted
- No unused package imports remain

---

## 8. Risks

- **SEO impact of removing content** — Fewer sections means less crawlable text. Mitigated by: the current sections are mostly marketing fluff with low keyword value. The real SEO play will be individual developer profile pages (future backlog item).
- **Removing recruiter pitch may lose early recruiter interest** — Mitigated by: there is no recruiter flow to convert them into anyway. Better to build the developer pool first, then launch a dedicated recruiter experience later.
- **Placeholder quotes look generic until replaced** — Mitigated by: the section is framed as problem validation ("The problem is real"), not product testimonials. The anonymous attributions ("— Senior Backend Engineer") feel natural even with placeholder text. Designed for easy replacement — just edit the `QUOTES` array. Auto-rotation means even 4–5 real quotes will feel like a substantial collection.
- **Framer Motion bundle size** — All current sections use Framer Motion with `'use client'`. Reducing from 7 to 4 sections already reduces the number of animated components. Deeper optimization (RSC migration) is a future concern, not this PRD.
