# PRD-002: Enriched GitHub Data

**Status:** Implemented
**Created:** 2026-03-04
**Author:** Burhanuddin

---

## 1. The Emotion

CredDev promises to verify developer credibility — but the reports are making production readiness claims based on guesswork. The LLM can see repo names and star counts, but it can't confirm whether a repo has a Dockerfile, CI config, or tests. When the extensive report says "no production signals found" but the developer actually has GitHub Actions and Docker in their top repos, the report loses credibility. When a recruiter reads "JavaScript developer" but the actual stack is Next.js + Prisma + Stripe, that's a shallow assessment.

The developer needs to feel: **"This report actually looked at my work, not just my profile stats."**
The recruiter needs to feel: **"I can trust these production readiness and tech stack assessments because they're based on real file-level evidence."**

---

## 2. Mental Model (User Experience)

No visible UX change — the user submits the same form and gets the same three reports. But the reports are now deeper and more accurate:

**Before:** "The candidate has 42 public repositories, primarily in JavaScript and Python."
**After:** "The candidate's top repos include Next.js + Prisma + Stripe (from package.json), with GitHub Actions CI, Dockerfiles, and test directories present in 6 of their 15 most active repos. They are a member of the Vercel and Prisma open source organizations."

**Before:** "Production readiness signals could not be confirmed from the available data."
**After:** "Production readiness: Dockerfile found in 4 repos, GitHub Actions CI in 7 repos, test directories in 5 repos. README present in 12 of 15 top repos."

The extraction phase may take slightly longer (one extra API call), but this is during the existing "Connecting to Platforms" wait — not a new wait state.

---

## 3. Requirements

### Must Have
- Fetch **pinned repositories** (`pinnedItems(first: 6)`) — what the developer chose to showcase
- Fetch **language bytes** per repo — change from `languages(first: 10) { nodes { name } }` to `languages(first: 10) { edges { size node { name } } }` for actual proficiency depth
- Fetch **organizations** (`organizations(first: 10) { nodes { name login url } }`) — open source community involvement
- Fetch **production readiness signals** for top repos (by stars or recent push):
  - `README.md` — documentation discipline
  - `Dockerfile` — containerization
  - `.github/workflows` — CI/CD (GitHub Actions)
  - `tests/` or `__tests__/` or `test/` — testing practice
  - `.env.example` — environment management awareness
  - `package.json` or `requirements.txt` content — actual tech stack and dependencies
- Use **two separate GraphQL queries**: first for all 100 repos (lightweight + pinned/orgs/lang bytes), second for top 15 repos (production signals + dependency file content)
- No change to LeetCode fetcher — existing query is comprehensive enough

### Won't Do (this PRD)
- Fetch file trees or full commit history (too heavy, context bloat)
- Fetch production signals for all 100 repos (diminishing returns, query bloat)
- Change report prompts (the LLM already asks for production readiness — it just needs the data; if prompt changes become necessary we'll handle that in a separate PRD)
- Change frontend or API endpoints

---

## 4. Architecture & Changes Required

### Files Modified

| File | Change |
|------|--------|
| `services/github_fetcher.py` | Split `_fetch()` into two queries: `_fetch_profile_and_repos()` (lightweight, 100 repos + pinned + orgs + lang bytes) and `_fetch_production_signals()` (top 15 repos: file checks + dependency content). `fetch_user_data()` calls both and merges results. |

### No Changes Needed

| File | Why |
|------|-----|
| `services/leetcode_fetcher.py` | Query is already comprehensive |
| `services/extraction.py` | Already calls `github_fetcher.fetch_user_data()` — no interface change |
| `services/report_generator.py` | LLM already asks for production readiness, just needs richer data |
| `app/routes/extract.py` | No change — extraction flow unchanged |
| `app/routes/generate.py` | No change — receives raw data as-is |
| Frontend files | No change — no new UI elements |

### Query 1: Profile + All Repos (lightweight)

Additions to existing query:
```graphql
# Add to user root level
pinnedItems(first: 6, types: REPOSITORY) {
    nodes {
        ... on Repository {
            name
            description
            stargazerCount
            primaryLanguage { name }
            pushedAt
            url
        }
    }
}
organizations(first: 10) {
    nodes {
        name
        login
        url
    }
}

# Change in each repo node — language bytes instead of just names
languages(first: 10) {
    edges {
        size
        node { name }
    }
}
```

### Query 2: Production Signals for Top Repos

After Query 1 returns, identify top 15 repos (sorted by stars descending, then by pushedAt descending as tiebreaker, excluding forks and archived repos). Then run a second query:

```graphql
query($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
        name
        readme: object(expression: "HEAD:README.md") {
            ... on Blob { byteSize }
        }
        dockerfile: object(expression: "HEAD:Dockerfile") {
            ... on Blob { byteSize }
        }
        ciWorkflows: object(expression: "HEAD:.github/workflows") {
            ... on Tree { entries { name } }
        }
        testsDir: object(expression: "HEAD:tests") {
            ... on Tree { entries { name } }
        }
        testDir: object(expression: "HEAD:test") {
            ... on Tree { entries { name } }
        }
        underscoreTests: object(expression: "HEAD:__tests__") {
            ... on Tree { entries { name } }
        }
        envExample: object(expression: "HEAD:.env.example") {
            ... on Blob { byteSize }
        }
        packageJson: object(expression: "HEAD:package.json") {
            ... on Blob { text }
        }
        requirementsTxt: object(expression: "HEAD:requirements.txt") {
            ... on Blob { text }
        }
    }
}
```

**Note:** GitHub GraphQL doesn't support querying multiple repositories by variable array in a single call. To avoid 15 separate API calls, we use **query aliasing** — a single query with 15 aliased `repository()` calls:

```graphql
query {
    repo0: repository(owner: "user", name: "repo-a") { ...ProductionSignals }
    repo1: repository(owner: "user", name: "repo-b") { ...ProductionSignals }
    ...
    repo14: repository(owner: "user", name: "repo-o") { ...ProductionSignals }
}

fragment ProductionSignals on Repository {
    name
    readme: object(expression: "HEAD:README.md") { ... on Blob { byteSize } }
    dockerfile: object(expression: "HEAD:Dockerfile") { ... on Blob { byteSize } }
    ciWorkflows: object(expression: "HEAD:.github/workflows") { ... on Tree { entries { name } } }
    testsDir: object(expression: "HEAD:tests") { ... on Tree { entries { name } } }
    testDir: object(expression: "HEAD:test") { ... on Tree { entries { name } } }
    underscoreTests: object(expression: "HEAD:__tests__") { ... on Tree { entries { name } } }
    envExample: object(expression: "HEAD:.env.example") { ... on Blob { byteSize } }
    packageJson: object(expression: "HEAD:package.json") { ... on Blob { text } }
    requirementsTxt: object(expression: "HEAD:requirements.txt") { ... on Blob { text } }
}
```

This sends **one API call** for all 15 repos.

### Data Flow

```
fetch_user_data(username)
       │
       ├── Query 1: _fetch_profile_and_repos(username)
       │       → 100 repos (lightweight) + pinned + orgs + lang bytes
       │
       ├── Identify top 15 repos (stars desc, then pushedAt desc, exclude forks/archived)
       │
       ├── Query 2: _fetch_production_signals(top_15_repos)
       │       → README, Dockerfile, CI, tests, .env.example, dependency files
       │
       └── Merge: attach production signals to matching repos in Query 1 response
               → Return combined result (same interface as before)
```

### Top Repo Selection Logic

From Query 1 results, select top 15 repos by:
1. Filter out: `isFork == true`, `isArchived == true`, `isPrivate == true`
2. Sort by: `stargazerCount` descending, then `pushedAt` descending as tiebreaker
3. Take first 15

### Edge Cases

- **User has fewer than 15 qualifying repos:** Query only the repos available. If 0 qualifying repos, skip Query 2 entirely.
- **Query 2 fails:** Log warning, return Query 1 data without production signals. Reports will be less detailed but still generate. Extraction should NOT fail because of Query 2.
- **Dependency file is very large:** `package.json` or `requirements.txt` could theoretically be huge. Cap at checking `byteSize` first — if over 50KB, skip fetching `text` content. In practice these files are rarely over 5KB.
- **Rate limiting:** Two GitHub API calls per extraction (was one). Still well within 5000/hour limit.

---

## 5. Implementation Plan (Small Increments)

### Increment 1: Enrich Query 1
- Add `pinnedItems`, `organizations`, and language `edges { size }` to existing query
- Verify response structure, ensure existing data is not broken

### Increment 2: Top repo selection
- After Query 1, implement selection logic (filter forks/archived, sort by stars then push date, take 15)
- Return list of `(owner, name)` pairs

### Increment 3: Query 2 — production signals
- Build aliased GraphQL query for up to 15 repos
- Fetch production signals (README, Dockerfile, CI, tests, .env.example, dependency files)
- Handle edge cases (fewer than 15 repos, query failure, large files)

### Increment 4: Merge and return
- Attach production signal data to matching repos in the combined response
- Ensure `fetch_user_data()` return format is backward-compatible (same `{"data": ..., "data_source": ...}` structure)

### Increment 5: Cleanup dead code
- Remove the old `_fetch()` method — replaced by `_fetch_profile_and_repos()` and `_fetch_production_signals()`
- Remove any helper logic that was only used by the old single-query approach
- Ensure no orphaned imports or unused variables remain

### Increment 6: Verify and document
- Verify full extraction flow: submit → extract (both queries) → raw data stored
- Verify generation still works with enriched data (LLM receives richer context)
- Update ARCHITECTURE.md and CHANGELOG.md

---

## 6. Success Criteria

- GitHub data now includes pinned repos, org memberships, and language byte counts
- Top 15 repos have file-level production signals (README, Dockerfile, CI, tests, .env.example)
- Top 15 repos have dependency file content (package.json or requirements.txt) when present
- Total GitHub API calls per extraction: exactly 2 (was 1)
- Extraction does not fail if Query 2 fails — graceful degradation
- LLM reports now reference concrete file-level evidence for production readiness assessments
- No frontend changes, no API changes, no LeetCode changes
- Existing extraction → generation → email flow works unchanged

---

## 7. Risks

- **Query 2 response size:** 15 repos × ~10 file checks could return a large response. Mitigated by only fetching file existence (byteSize) for most, and text content only for dependency files.
- **LLM context size increase:** More data means more tokens in the prompt. The current context already includes raw GitHub JSON, LeetCode JSON, and resume text. Adding production signals and dependency file content for 15 repos could add 5-15KB. This is within GPT-5-mini's context window but worth monitoring.
- **GitHub API changes:** If `object(expression: ...)` syntax changes, Query 2 breaks. **Handled:** Query 2 failure is non-fatal — extraction continues with Query 1 data only.
- **Dependency file content parsing:** The LLM receives raw `package.json` or `requirements.txt` text and must reason about it. No pre-processing. This is consistent with our existing approach (raw data → LLM reasoning).
