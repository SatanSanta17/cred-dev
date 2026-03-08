# PRD-007: Multi-Platform Profile Support

**Status:** Draft — awaiting approval
**Created:** 2026-03-08

---

## Emotion

Developers aren't just on GitHub and LeetCode. An ML engineer's best work might be on Kaggle or HuggingFace. A competitive programmer lives on CodeChef or Codeforces. A frontend developer might showcase Storybook demos. Right now CredDev forces everyone through the same 3-field funnel and ignores the rest of their profile. That's the same reductive thinking we're trying to fight.

---

## What Changes

### 1. Form UX

**Current:** 3 fixed URL fields — GitHub, LeetCode, LinkedIn.
**New:** GitHub and LeetCode stay as dedicated fields. LinkedIn field is removed. Below the two dedicated fields, an **"+ Add Profile Link"** button lets users paste any number of additional URLs. Platform name is auto-detected from the domain (kaggle.com → Kaggle, codechef.com → CodeChef, linkedin.com → LinkedIn). Resume upload stays unchanged.

### 2. Extraction Flow

**Current:** Each platform has a dedicated fetcher (GitHub, LeetCode, LinkedIn, Resume). LinkedIn is a stub.
**New:**
- **GitHub** → dedicated `GitHubFetcher` (unchanged)
- **LeetCode** → dedicated `LeetCodeFetcher` (unchanged)
- **Resume** → dedicated `ResumeParser` (unchanged)
- **All additional URLs** → new `WebSearchFetcher` — calls OpenAI with `web_search_preview` tool, asks it to extract profile/portfolio data from the URL, returns structured raw data

LinkedIn is no longer a special case — it's just another URL that goes through the web search fetcher.

### 3. Data Flow

```
User submits form
       │
       ├── GitHub URL ──────→ GitHubFetcher (GraphQL)      ──→ store in raw_data (data_type: "github")
       ├── LeetCode URL ───→ LeetCodeFetcher (GraphQL)     ──→ store in raw_data (data_type: "leetcode")
       ├── Resume PDF ─────→ ResumeParser (PyPDF2)          ──→ store in raw_data (data_type: "resume")
       └── Additional URLs ─→ WebSearchFetcher (per URL)    ──→ store in raw_data (data_type: auto-detected platform name)
       │
       ▼
All raw_data loaded → LLM generates 3 reports (same as today, but with more data sources)
```

### 4. Database Storage

**AnalysisJob table — new column:**
- `platform_urls` (JSON): `{"github": "https://...", "leetcode": "https://...", "kaggle": "https://...", "linkedin": "https://..."}`
- Old columns (`github_url`, `leetcode_url`, `linkedin_url`) kept temporarily for backward compat, populated from `platform_urls`

**RawData table — no changes needed:**
- `data_type` already accepts any string — new platforms just get new data_type values
- `data` JSON column stores whatever the fetcher returns

**Why JSON column on AnalysisJob instead of a separate table:**
- Simpler — one read to get all URLs for a job
- No joins needed
- Platform URLs are always read/written together, never queried individually
- Matches the existing pattern (raw_data is already per-platform via data_type)

### 5. WebSearchFetcher Design

New service that wraps an OpenAI call with web_search_preview:

```
Input: URL string (e.g. "https://kaggle.com/username")
Process:
  1. Call OpenAI with web_search_preview tool
  2. System prompt instructs LLM to visit URL and extract all publicly visible profile data as plain text
  3. Store the raw text response as-is — no JSON parsing needed
Output: Raw text stored in raw_data table (report generator LLM consumes it directly)
```

This fetcher is generic — it works for any URL without platform-specific code.

### 6. Report Generator Changes

**System message update:**
- Remove hardcoded "GitHub (GraphQL), LeetCode (GraphQL), and a resume text"
- Dynamically list all platforms that have raw data for this job
- Guardrails still apply — VERIFIED vs CLAIMED, no hallucination, etc.

### 7. LinkedIn Fetcher Removal

- Delete `services/linkedin_fetcher.py`
- Remove LinkedIn import/instantiation from ExtractionService
- LinkedIn URLs now handled by WebSearchFetcher (which can actually extract useful data via web search, unlike the current stub)

---

## Implementation Increments

### Increment 1: Backend — WebSearchFetcher + platform_urls column
- Create `services/web_search_fetcher.py`
- Add `platform_urls` JSON column to AnalysisJob in `database.py`
- Add domain-to-platform-name utility function

### Increment 2: Backend — Refactor ExtractionService
- Accept `platform_urls` dict instead of individual URL params
- Route GitHub/LeetCode to dedicated fetchers, everything else to WebSearchFetcher
- Delete `linkedin_fetcher.py`
- Keep backward compat: old params converted to platform_urls internally

### Increment 3: Backend — Update extract endpoint
- Accept `platform_urls` JSON string in Form data (new param)
- Still accept old `github_url`/`leetcode_url`/`linkedin_url` for backward compat
- Store in new `platform_urls` column + populate old columns from it

### Increment 4: Backend — Update report generator + raw data loader
- Raw data loader: don't hardcode the 4-key dict, build dynamically from raw_data records
- Report generator: dynamic system message listing actual platforms submitted
- Generation route (`generate.py`): update progress stage messages to be platform-aware

### Increment 5: Frontend — Dynamic form
- Remove LinkedIn field from try-form
- Add "Additional Profile Links" section with "+ Add Profile Link" button
- Auto-detect platform name from URL domain
- Update Zod schema: `platform_urls` as record, at least one URL or resume required

### Increment 6: Frontend — API client update
- `submitExtraction()` sends `platform_urls` JSON instead of individual fields
- `try-flow.tsx` maps new form shape to API call

### Increment 7: Documentation
- Update ARCHITECTURE.md: new data flow, WebSearchFetcher, platform_urls column, removed LinkedIn fetcher
- Update README if needed

---

## Out of Scope

- Dedicated fetchers for new platforms (Kaggle, CodeChef, etc.) — web search handles them for now
- Platform icon library — auto-detected name is enough for MVP
- Rate limiting per platform — not needed at current scale
- User-configurable platform list — hardcoded GitHub/LeetCode as primary, rest is generic
