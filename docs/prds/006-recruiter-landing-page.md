# PRD-006: Recruiter Landing Page + Waitlist Cleanup

**Status:** Implemented
**Date:** 2026-03-08

## Emotion

A recruiter hears about CredDev and wants to understand what it can do for them. Right now, the entire site speaks to developers. The waitlist page asks "developer or recruiter?" but offers no recruiter-specific value. Recruiters need their own space — a page that speaks their language, shows the future product vision, and lets them sign up for early access.

Meanwhile, developers no longer need a waitlist — the product is live for them at `/try`. The old `/waitlist` page serves no purpose for developers and confuses the two audiences.

## Problem

1. **No recruiter-specific page.** Recruiters land on a developer-focused site with no content about how CredDev helps them verify candidates, reduce hiring risk, or discover pre-verified talent.

2. **The `/waitlist` page is obsolete.** It serves both developers and recruiters, but developers now go directly to `/try`. The developer/recruiter toggle, GitHub profile field, and "willing to connect" checkbox are all developer-centric. The page needs to go.

3. **Waitlist references scattered across the site.** `WaitlistCount` is used on the problem-validation section (landing page), the about page links to `/#waitlist`, and the layout metadata mentions "Join the waitlist."

## Solution

### Part A: `/recruiters` page — "Coming Soon" teaser

A dedicated recruiter-focused page with 4 sections:

**1. Hero**
- Brand component at top (same as landing page)
- Recruiter-specific headline (e.g., "Stop guessing. Verify before you hire.")
- Subheadline explaining the vision: verified candidate reports, real signals, not resume claims
- "Coming Soon" badge
- Single CTA: "Join the Waitlist" (scrolls to form at bottom)

**2. Product Vision**
- Show what recruiters will eventually be able to do:
  - **Request a candidate report** — paste a candidate's GitHub/LeetCode/LinkedIn, get a verified credibility report
  - **Browse verified developers** — search a directory of developers who've opted in with their CredDev reports
- Visual: 2 cards or a simple step-by-step walkthrough (not functional — just mockup/illustration of the flow)
- Keep it simple — enough to excite, not enough to overpromise

**3. Problem Validation**
- Recruiter-specific quotes (placeholders for now, to be filled with real HR conversations)
- Same rotating carousel pattern as the landing page but with recruiter pain points
- 3 placeholder quotes focused on: verification difficulty, resume trust issues, time wasted on bad hires

**4. Waitlist Form**
- Recruiter-only (no developer/recruiter toggle)
- Fields: email (required), company name (optional), team size (optional)
- Inserts into the same Supabase `waitlist` table with `user_type: 'recruiter'`
- Success state: "You're on the list! We'll reach out when recruiter tools launch."
- Trust badges: free, no commitment, early access priority

### Part B: Remove `/waitlist` page

- Delete `app/waitlist/` directory entirely (page.tsx + _components/waitlist-form.tsx)
- The waitlist form functionality for recruiters moves into `/recruiters`

### Part C: Add "For Recruiters" link on landing page

- Add a subtle link in the landing page footer: "Are you a recruiter? →" linking to `/recruiters`
- Keep it low-key — the landing page is developer-focused, this is just a discovery path

### Part D: Clean up stale waitlist references

- `problem-validation.tsx`: Remove the `WaitlistCount` component from the bottom of the section. Developers don't need to see waitlist numbers — the CTA is "Generate Your Free Report."
- `app/layout.tsx`: Update metadata description (remove "Join the waitlist" language)
- `app/about/page.tsx`: The CTA at the bottom links to `/#waitlist` — update to link to `/try` instead
- `components/shared/waitlist-count.tsx`: Keep the component (still used by the new recruiter form) but clean up developer-specific label text

## Out of Scope

- Functional recruiter product (report requests, developer directory)
- Recruiter authentication or dashboard
- Supabase schema changes (existing `waitlist` table works fine)
- Modifying the developer flow (`/try`) in any way

## Files

### New
- `app/recruiters/page.tsx` — recruiter landing page
- `app/recruiters/_components/recruiter-waitlist-form.tsx` — recruiter-only waitlist form

### Modified
- `components/sections/footer.tsx` — add "For Recruiters" link
- `components/sections/problem-validation.tsx` — remove WaitlistCount
- `app/layout.tsx` — update metadata description
- `app/about/page.tsx` — update CTA link from `/#waitlist` to `/try`

### Deleted
- `app/waitlist/page.tsx`
- `app/waitlist/_components/waitlist-form.tsx`

## Implementation Increments

1. **Create `/recruiters` page** — hero + product vision sections
2. **Add problem validation + waitlist form** — recruiter quotes (placeholders) + form
3. **Add "For Recruiters" link to footer**
4. **Clean up stale references** — problem-validation WaitlistCount, layout metadata, about page CTA
5. **Delete `/waitlist` page** — remove directory and files
6. **Verify + document** — ARCHITECTURE.md, CHANGELOG.md, broken reference scan
