# PRD-009: Recruiter Job Matching

**Status:** Draft
**Date:** 2026-03-14

---

## Emotion

A recruiter discovers CredDev and thinks: "Interesting — verified developer profiles, real evidence instead of resume claims. But what can I actually *do* here?" Right now, nothing. The recruiter page is a waitlist.

Meanwhile, developers are generating rich, verified credibility data every day — GitHub activity, LeetCode stats, production signals, skill verification. That data is sitting unused by the people who'd pay for it.

This feature turns CredDev from a developer tool into a two-sided platform. A recruiter posts what they're looking for, and the system instantly surfaces the best-matching candidates from the existing pool. This is the revenue unlock.

---

## User Story

As a recruiter, I want to describe the role I'm hiring for and instantly see which verified candidates on CredDev match my requirements, so that I can find pre-vetted talent without manually reading through profiles.

---

## Part 1: Job Posting

The recruiter can create a job posting that describes the role they're hiring for.

### Requirements

- P1.R1: Recruiter can access a job posting form from the recruiter page
- P1.R2: The form collects: job title (required), job description (required), required skills (optional, multi-entry), experience level (optional — Junior / Mid / Senior / Lead), location preference (optional, free text)
- P1.R3: On submission, the job posting is saved and the recruiter is redirected to the job detail page
- P1.R4: No authentication required — any visitor can create a job posting
- P1.R5: The recruiter page (`/recruiters`) is updated from a waitlist to a hub that shows a "Post a Job" call-to-action and lists previously created job postings

### Acceptance Criteria

- [ ] A recruiter can navigate to `/recruiters`, see a "Post a Job" button, and reach the job form
- [ ] Submitting the form with title + description creates a job posting and redirects to its detail page
- [ ] Submitting without a title or description shows validation errors
- [ ] The job detail page shows all the information that was submitted
- [ ] The recruiter hub lists all existing job postings with their titles and creation dates
- [ ] The existing waitlist form is preserved (can live alongside the new hub content, or move to a secondary position)

---

## Part 2: Auto-Matching

When a job posting exists, the system finds all candidates in the platform whose verified data matches the job requirements and ranks them.

### Requirements

- P2.R1: After a job is created (or triggered manually from the job detail page), the system runs a matching process against all candidates with completed reports
- P2.R2: Matching is powered by the LLM — it receives the job requirements and candidate data, and returns a structured match result per candidate
- P2.R3: Each match result includes: match score (0-100), key matching signals (what makes them a fit), key gaps (what's missing), and a short summary
- P2.R4: Results are ranked by score and displayed on the job detail page
- P2.R5: The recruiter can click into any matched candidate to view their full recruiter insight report
- P2.R6: If there are no candidates on the platform yet, the recruiter sees a clear empty state ("No candidates matched yet — as more developers join CredDev, matches will appear here")
- P2.R7: Matching runs once when triggered — it does not auto-update when new candidates join (that's a future enhancement)

### Acceptance Criteria

- [ ] Creating a job posting triggers the matching process automatically
- [ ] The job detail page shows a loading state while matching is in progress
- [ ] Once matching completes, candidates appear ranked by score (highest first)
- [ ] Each match card shows: candidate name, score, 2-3 matching signals, 1-2 gaps, and a summary line
- [ ] Clicking a match card navigates to or displays the candidate's recruiter insight report
- [ ] A job with no matching candidates shows a meaningful empty state, not a blank page
- [ ] If the LLM call fails, the job page shows an error state with the option to retry matching

---

## Part 3: Recruiter Hub

The `/recruiters` page transforms from a static waitlist into a functional entry point for the recruiter experience.

### Requirements

- P3.R1: The page header communicates what CredDev offers recruiters — verified candidate matching, not just a waitlist
- P3.R2: A prominent "Post a Job" CTA leads to the job form
- P3.R3: Below the CTA, all existing job postings are listed as cards showing: title, creation date, number of matches found, and status
- P3.R4: Each job card links to its detail page
- P3.R5: The waitlist form is preserved but moved to a secondary position (bottom of page) for recruiters who want early access updates rather than using the tool directly
- P3.R6: The page works well with zero job postings (first-time recruiter), a handful of postings, and many postings

### Acceptance Criteria

- [ ] A first-time recruiter landing on `/recruiters` immediately understands they can post a job and find candidates
- [ ] The "Post a Job" button is the most prominent action on the page
- [ ] Job postings appear as a list/grid with title, date, and match count
- [ ] Clicking a job card navigates to `/recruiters/jobs/[id]`
- [ ] The waitlist form still works and submits to Supabase
- [ ] The page looks good with 0 jobs, 3 jobs, and 10+ jobs

---

## Backlog (Future — Not in Scope)

These features are intentionally deferred. They'll get their own PRDs when we're ready:

- **Keyword search** — recruiter searches candidate profiles by skills/keywords (no LLM, pure database search)
- **Upload & instant match** — recruiter uploads a candidate's resume/URLs and gets an instant match score against a specific job
- **Recruiter authentication** — login, saved sessions, job ownership
- **Candidate opt-in/opt-out** — candidates control whether their data appears in recruiter searches
- **Payment/monetization gating** — limiting access or charging for matches
- **Real-time matching** — auto-updating matches as new candidates generate reports
- **Job editing and closing** — modifying or archiving job postings

---

## Privacy Note

For MVP, all candidates with completed reports are included in matching. This is acceptable because CredDev's positioning already communicates that reports are for recruiters, we only expose report data (not contact information like email), and explicit opt-in/opt-out controls are planned as a fast follow.
