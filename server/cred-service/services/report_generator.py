"""
Report Generator v6 — Guardrail-Driven LLM Reports

Three reports, three distinct purposes:
  - Extensive  : deep research data room — everything cited, nothing assumed
  - Recruiter  : hiring decision support — verdict-first, verified-only
  - Developer  : growth plan — gap-focused, action-oriented

Shared guardrails enforced in every prompt to prevent hallucination and ensure
every statement is traceable back to a specific field in the raw platform data.
"""

from datetime import date
from typing import Dict, Any
from openai import OpenAI
import json
import logging
from app.config import settings

logger = logging.getLogger(__name__)


# =========================================
# SHARED GUARDRAILS
# Applied as a system message to every LLM call.
# These are immutable rules the LLM must follow regardless of report type.
# =========================================

GUARDRAILS = """You are a developer credibility verification engine. You receive raw data from GitHub (GraphQL), LeetCode (GraphQL), and a resume text. Your job is to reason over this data and produce reports.

IMMUTABLE RULES — violating any of these is a critical failure:

1. CITATION RULE
   Every factual statement you make must be followed by the source in parentheses.
   Format: (Source: <platform> > <field path>)
   Examples:
     - "42 public repositories" (Source: GitHub > repositories.totalCount)
     - "555 problems solved" (Source: LeetCode > matchedUser.submitStats.acSubmissionNum[All].count)
     - "Worked at InMobi" (Source: Resume text)
   If you cannot cite a source from the raw data, do not make the statement.

2. VERIFICATION RULE
   A skill is VERIFIED only if you can point to explicit evidence in the raw data.
   - For languages: must appear in GitHub repo language nodes OR LeetCode submission lang fields
   - For frameworks/libraries (React, Node, MongoDB, etc.): must appear in repo descriptions, repo names, or repositoryTopics in the raw GitHub data
   - If you cannot find explicit evidence, mark it UNVERIFIED — do not guess or infer
   - Resume text mentioning a skill is a CLAIM, not verification

3. NO HALLUCINATION RULE
   Do not infer, assume, or extrapolate beyond what is explicitly in the raw data.
   If data is missing or ambiguous, say "data not available" — never fill the gap with assumptions.

4. DATE AWARENESS RULE
   Today's date is {today}. Use this when interpreting employment timelines.
   - Calculate experience duration from actual start/end dates in the resume
   - A future start date in the resume is a discrepancy — flag it
   - Do not use any pre-parsed "experience_years" field — derive it yourself from date ranges

5. CROSS-PLATFORM ACTIVITY RULE
   Never assess a candidate's activity or consistency using only one platform.
   Always combine signals: GitHub commits + LeetCode submissions together.
   A developer may be inactive on LeetCode but actively pushing to GitHub — that is NOT low activity.

6. COMPANY SOURCE RULE
   Professional work history comes from the RESUME TEXT only.
   The GitHub "company" field is informal and self-reported — ignore it for professional assessment.
   Use your training knowledge to assess company reputation and domain.

7. CLAIMS vs PROOF RULE
   Resume bullet points are claims. Platform data is evidence.
   Treat resume metrics (e.g. "boosted engagement by 27%") as unverified claims unless corroborated by platform data.
   Label them clearly as: [CLAIMED, NOT PLATFORM-VERIFIED]"""


class ReportGenerator:

    def __init__(self, model="gpt-5-mini"):
        self.model = model
        api_key = settings.openai_api_key
        if not api_key:
            raise ValueError("OPENAI_API_KEY not configured. Set it in cred-service/.env")
        self.client = OpenAI(api_key=api_key)

    # =========================================
    # PUBLIC ENTRY
    # =========================================

    def generate_reports(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        context = self._build_llm_context(raw_data)
        system = GUARDRAILS.format(today=date.today().isoformat())

        extensive = self._generate_extensive_report(system, context)
        developer = self._generate_developer_insight(system, context)
        recruiter = self._generate_recruiter_insight(system, context)

        return {
            "extensive_report": extensive,
            "developer_insight": developer,
            "recruiter_insight": recruiter,
        }

    # =========================================
    # CONTEXT BUILDER
    # =========================================

    def _build_llm_context(self, raw_data: Dict) -> str:
        """
        Passes raw platform data directly to the LLM with no transformation.
        GitHub and LeetCode: raw GraphQL response JSON.
        Resume: raw extracted text.
        """
        sections = []

        github = raw_data.get("github", {})
        if github and not github.get("error"):
            sections.append(
                "=== GITHUB RAW DATA (GraphQL Response) ===\n"
                + json.dumps(github.get("data", {}), indent=2)
            )

        leetcode = raw_data.get("leetcode", {})
        if leetcode and not leetcode.get("error"):
            sections.append(
                "=== LEETCODE RAW DATA (GraphQL Response) ===\n"
                + json.dumps(leetcode.get("data", {}), indent=2)
            )

        resume = raw_data.get("resume", {})
        if resume and not resume.get("error"):
            sections.append(
                "=== RESUME TEXT ===\n"
                + (resume.get("raw_text") or "")
            )

        return "\n\n".join(sections)

    # =========================================
    # EXTENSIVE REPORT
    # Purpose: the data room — deep, comprehensive, fully cited.
    # Audience: internal reviewers, senior hiring managers, technical leads.
    # Everything goes here. No omissions. No soft-pedalling.
    # =========================================

    def _generate_extensive_report(self, system: str, context: str) -> str:
        prompt = f"""Produce a comprehensive technical intelligence report on this developer.

This is the data room — every signal must be surfaced, every claim cross-checked, every finding cited.
Be analytical, direct, and precise. Do not summarise — go deep on every section.

RAW PLATFORM DATA:
{context}

OUTPUT SECTIONS:

### 1. Capability Identity
Who is this developer? Derive from resume timeline + platform signals.
State: role type, seniority level, domain focus, years of experience (calculated from date ranges).
Every sentence must be cited.

### 2. Engineering Depth Analysis
- Languages: list each with verification status and citation
- Frameworks & Libraries: list each, state how verified (repo name / topic / description — cite exactly)
- Repository quality: total repos, active repos, original vs forks (cite counts)
- Notable repositories: name, purpose, tech stack, stars, last pushed (from raw data)
- Production signals: Docker, CI/CD, tests — per repo where found

### 3. Problem Solving Depth
- Total solved, acceptance rate, difficulty breakdown (cite exact fields)
- Top topic strengths from tagProblemCounts (cite top 5 with problem counts)
- Contest history: attended count, rating if available
- Languages used in LeetCode submissions (cite recentSubmissionList lang fields)

### 4. Execution & Consistency Pattern
- GitHub: total commits, active days this year, PR count and merge rate (cite fields)
- LeetCode: submissions last 30 days, last 90 days (cite fields)
- Assess consistency using BOTH platforms together — do not penalise for low LeetCode if GitHub is active

### 5. Production Readiness Signals
Check each repository in the raw data for: Dockerfile, CI config (.github/workflows etc.), test directories.
State which repos have which signals. If none found, say so explicitly.

### 6. Credibility Verification
For every skill listed in the resume:
  VERIFIED — cite exact field/value in raw data that proves it
  UNVERIFIED — no evidence found in GitHub or LeetCode raw data
  CONTRADICTED — platforms show evidence against the claim
Do not mark anything VERIFIED without a citation.
Resume metrics (e.g. "improved performance by X%") → label as [CLAIMED, NOT PLATFORM-VERIFIED]

### 7. Company Background & Domain Context
Source companies from resume text only.
For each employer: name, candidate's stated role and tenure, your knowledge of the company's domain/reputation.
Clearly label what comes from resume vs your knowledge.

### 8. Risk Flags
List every concern with specific supporting data.
Discrepancies between resume claims and platform evidence must be flagged here.
Date inconsistencies (future dates, gaps) must be flagged.

### 9. Final Technical Positioning
Level, primary verified strengths, significant gaps, overall signal quality."""

        return self._call_llm(system, prompt)

    # =========================================
    # DEVELOPER INSIGHT
    # Purpose: growth plan — what to improve and how.
    # Audience: the candidate themselves.
    # Tone: direct mentor, no flattery, specific actions.
    # =========================================

    def _generate_developer_insight(self, system: str, context: str) -> str:
        prompt = f"""Produce a focused growth report for this developer.

Your only goal: tell them exactly what to improve and how. No praise, no career fluff.
Write in clear, natural prose — do NOT add inline citations like "(Source: ...)" after every sentence.
Use specific numbers and repo names naturally in the text (e.g. "your 57 hard problems" not "57 hard problems (Source: LeetCode > submitStats)").
All verification details will appear in the disclaimer at the end — not inline.

RAW PLATFORM DATA:
{context}

OUTPUT SECTIONS:

### 1. Where You Stand
Honest assessment of current level and type of engineer, derived from platform data.
State what the data actually shows — not what the resume claims.
Be direct. One paragraph.

### 2. What Is Already Strong
Write naturally. Reference specific repos, problem counts, topic strengths, PR stats in the prose.
Do not bullet everything — write it as a mentor would speak it.

### 3. Critical Gaps
Be specific with numbers but write naturally:
- Problem solving gaps (hard problem count, topic holes)
- Production readiness (CI, Docker, tests — which repos, how many)
- Consistency (combine GitHub and LeetCode signals together — do not penalise for low LeetCode if GitHub is active)
- Code collaboration (reviews given, external PRs)

### 4. 30-Day Action Plan
3–5 specific, measurable actions tied directly to the gaps above.
Each action must be completable in 30 days with a clear success metric.

### 5. 90-Day Direction
Based on verified tech stack and company domain background:
what kind of role and team should this developer be targeting and why?

---
### Verification Disclaimer
End the report with this section. Write it as follows:

**Data Sources:** GitHub (repositories, contributions, pull requests, languages, topics) and LeetCode (problem stats, topic strengths, submission languages, contest history).

**Unverified Claims** (present in resume, no platform evidence found): List each skill or claim that could not be confirmed. Be specific — name the skill and why it couldn't be verified.

**Resume Metrics** (e.g. "improved performance by X%", "boosted engagement by Y%"): These are candidate-stated figures and have not been independently verified through platform data."""

        return self._call_llm(system, prompt)

    # =========================================
    # RECRUITER INSIGHT
    # Purpose: hiring decision support — verdict-first, verified-only.
    # Audience: technical recruiters and hiring managers.
    # No interview questions. No improvement plans. Decision signals only.
    # =========================================

    def _generate_recruiter_insight(self, system: str, context: str) -> str:
        prompt = f"""Produce a hiring decision report for a technical recruiter.

Your only goal: give the recruiter everything they need to make a confident hire/no-hire decision.
Do not include interview questions or improvement suggestions — those are not a recruiter's job.
Write in clear, natural prose — do NOT add inline citations like "(Source: ...)" after every sentence.
Use specific numbers naturally in the text. All verification details go in the disclaimer at the end.

RAW PLATFORM DATA:
{context}

OUTPUT SECTIONS:

### 1. Candidate Snapshot
Only platform-verified information here — do NOT list skills that are resume-only claims.
- Role level (derived from experience timeline and platform evidence)
- Verified languages and frameworks (found in GitHub repos, topics, or LeetCode submissions)
Write this as a clean, scannable summary a recruiter can read in 30 seconds.

### 2. Hire Recommendation
State clearly: Strong Hire / Hire / Weak Hire / No Hire
Confidence: X/10
Write 2–3 sentences of natural rationale using specific numbers from the data.

### 3. Verified Strengths
Write naturally — not a citation list. What does the platform data actually confirm about this person?
Reference specific repos, stats, or patterns in prose form.

### 4. Red Flags
Factual concerns only — date discrepancies, contradicted claims, significant gaps in activity.
Write clearly and directly. One concern per paragraph or bullet.

### 5. Company Background & Domain Context
From the resume: who they worked for, in what role, for how long.
Your assessment of each company's domain, reputation, and size.
Be clear about what you know vs what the candidate claims.

### 6. Domain & Role Fit
Based on verified tech stack and company history:
- What type of role and team does this profile fit?
- What seniority level is justified by the platform evidence (not the resume)?
- Name 3–5 specific companies or company types where this candidate would be a strong match and explain why.

---
### Verification Disclaimer
End the report with this section:

**Data Sources:** GitHub (repositories, contributions, pull requests, languages, topics) and LeetCode (problem stats, topic strengths, submission languages, contest history).

**Unverified Claims** (present in resume, no platform evidence found): List each unverified skill or claim specifically — name it and state that no platform evidence was found.

**Resume Metrics** (e.g. "improved performance by X%", "boosted engagement by Y%"): These are candidate-stated figures and have not been independently verified through platform data."""

        return self._call_llm(system, prompt)

    # =========================================
    # LLM CALL
    # Uses system + user message split so guardrails are in system role.
    # =========================================

    def _call_llm(self, system: str, prompt: str) -> str:
        try:
            response = self.client.responses.create(
                model=self.model,
                tools=[{"type": "web_search_preview"}],
                tool_choice="auto",
                input=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
            )
            return response.output_text
        except Exception as e:
            logger.error(f"LLM call failed: {e}")
            return f"Report generation failed: {str(e)}"
