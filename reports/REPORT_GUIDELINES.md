# CredDev Report Writing Guidelines

**Version:** 1.0  
**Last Updated:** February 16, 2026  
**Purpose:** Standards for creating accurate, honest, and fact-based developer credibility reports

---

## 🎯 Core Philosophy

### WE ARE:
- ✅ A **fact-checking layer** that verifies developer claims
- ✅ An **objective assessment platform** that presents data neutrally
- ✅ A **credibility verification service** that distinguishes truth from claims

### WE ARE NOT:
- ❌ A branding or marketing layer that sells candidates
- ❌ An assumption-making service that fills gaps with guesses
- ❌ A promotional platform that inflates achievements

---

## 📊 Three-Tier Verification System

Every piece of information must be classified into one of three categories:

### ✅ TIER 1: VERIFIED DATA
**Definition:** Information we can independently confirm through public sources or direct access

**Examples:**
- LeetCode problems solved (if profile is public)
- GitHub repository count, languages used, code structure, and quality
- LinkedIn employment dates at verifiable companies
- Educational institutions and degrees (if institution exists)
- Contest rankings and badges

**How to present:**
```markdown
✅ VERIFIED: [Candidate] has solved 201 LeetCode problems
✅ VERIFIED: Employed at [Company] (company confirmed via Tracxn/Crunchbase)
✅ VERIFIED: MCA from PES University Bangalore (institution verified)
```

---

### 🟡 TIER 2: PLAUSIBLE BUT UNVERIFIED
**Definition:** Claims that align with verified context but cannot be independently confirmed

**Examples:**
- Project descriptions that match company's business domain
- Technologies used that align with job requirements
- Work achievements that are typical for the role/company
- Skills mentioned that match the tech stack

**How to present:**
```markdown
🟡 PLAUSIBLE: KYC automation project at fintech company
   Reasoning: Company is verified fintech startup, KYC is standard requirement
   Status: Project existence cannot be independently verified but aligns with company domain

🟡 PLAUSIBLE: Working with Spring Boot microservices
   Reasoning: Job title is "Backend Developer", Spring Boot listed in resume
   Status: Cannot verify actual code but claim is consistent with role
```

---

### ⚠️ TIER 3: CLAIMED BUT UNVERIFIED
**Definition:** Specific metrics, percentages, or achievements claimed by candidate that cannot be verified

**Examples:**
- Performance metrics ("70% reduction in processing time")
- Impact percentages ("40% improvement in database performance")
- Team size claims ("Led team of 5 engineers")
- Revenue/user impact ("Handled 10M requests/day")

**How to present:**
```markdown
⚠️ CLAIMED: "70% reduction in manual verification time" (unverified)

NOTE: This metric is the candidate's claim from their resume. Cannot be 
independently verified without access to internal company data. The claim 
is plausible for automation projects but specific percentage is unverified.
```

**MANDATORY: Always include a disclaimer note explaining:**
1. This is a candidate's claim
2. Why it cannot be verified
3. Whether it's within realistic ranges (if applicable)

---

## 🚫 Language Guidelines: Words to Avoid

### HIGH-RISK WORDS (Use Only With Proof)

| ❌ AVOID | ✅ USE INSTEAD | When to Use Original |
|----------|----------------|---------------------|
| **Expertise** | Experience, Work, Exposure | When candidate has 5+ years OR recognized achievement/certification |
| **Specialization** | Focus, Primary work area | When 5+ years focused OR industry recognition |
| **Mastery** | Proficiency, Competence | When demonstrable proof (certifications, competitions, recognized contributions) |
| **Expert** | Experienced, Familiar with | When industry recognition, speaking engagements, or teaching experience |
| **Strong** | Adequate, Within expected range | When measurably above average (top 10-20% of cohort) |
| **Solid** | Appropriate, Suitable | When above average with data to prove it |
| **Excellent** | Good, Competent | When exceptional and verifiable (top 5% of cohort) |
| **Deep knowledge** | Working knowledge | When 5+ years OR published work/research |
| **Advanced** | Intermediate, Developing | When certified advanced level OR solving hard problems consistently |
| **Proven track record** | Work history shows | When multiple verifiable successful projects |

---

## ✅ Recommended Neutral Language

### Experience Levels (Use Data-Driven)

| Years of Experience | Neutral Terms | Avoid |
|-------------------|---------------|-------|
| 0-1 years | Entry-level, Junior, Beginner | Expert, Experienced |
| 1-3 years | Early-career, Developing, Growing | Senior, Advanced, Deep |
| 3-5 years | Mid-level, Competent, Solid | Expert, Mastery |
| 5-8 years | Experienced, Proficient | Mastery (unless proven) |
| 8+ years | Senior, Highly experienced | - |

### Skill Assessment Terms

| Use This | When |
|----------|------|
| "Adequate for [level]" | Meets baseline expectations |
| "Within expected range" | Average for experience level |
| "Above average" | Measurably better than peers (top 30%) |
| "Strong performance" | Top 10-20% of cohort with data |
| "Exceptional" | Top 5% with clear evidence |
| "Demonstrates [skill]" | When there's proof in public work |
| "Claims [skill]" | When listed in resume but not verified |
| "Exposure to [tech]" | Used briefly or in limited capacity |
| "Working knowledge" | Can use it in production |
| "Proficient in [tech]" | 2+ years consistent use |

---

## 📝 Mandatory Disclaimers

### For Resume Metrics (Percentages, Impact Claims)

**ALWAYS include when candidate claims specific numbers:**

```markdown
⚠️ NOTE: "[Metric]" is the candidate's claim from their resume/interview. 
This cannot be independently verified without access to [company's internal 
data/metrics/performance reports]. [Optional: The claim is within realistic 
ranges for this type of work / The percentage seems optimistic compared to 
industry standards.]
```

**Examples:**

```markdown
⚠️ NOTE: "70% reduction in verification time" is the candidate's claim. 
Cannot be verified without access to company's internal metrics. Automation 
typically yields 50-80% improvements, so claim is within realistic range.

⚠️ NOTE: "Handled 10M requests/day" is claimed by candidate. Cannot verify 
actual traffic volume without access to company's infrastructure metrics.
```

---

### For Unverifiable Skills

**When skills are listed but not demonstrated:**

```markdown
⚠️ NOTE: [Technology/skill] is listed in resume but not demonstrated in 
public repositories or verifiable work. May be used in private company 
projects not accessible for review.
```

---

### For Private/Inaccessible Data

**When relevant data exists but is private:**

```markdown
⚠️ LIMITATION: LeetCode profile exists but is set to private. Problem-solving 
ability cannot be assessed without access to solve history and statistics.

⚠️ LIMITATION: GitHub repositories are primarily private. Code quality and 
contribution patterns cannot be independently verified.
```

---

## 🔍 Assessment Framework

### For Each Platform, Follow This Structure:

#### 1. **Data Collection**
- State what data is accessible
- Note what data is NOT accessible
- Clarify if profile is public/private

#### 2. **Verified Facts First**
- List only what can be independently confirmed
- Provide sources or reasoning

#### 3. **Plausible Claims Second**
- List claims that align with verified context
- Explain why they're plausible
- Note they cannot be independently verified

#### 4. **Unverified Claims Last**
- List specific metrics/achievements from resume
- Add disclaimer for each
- Note if claim is within realistic ranges

#### 5. **Red Flags / Concerns**
- Any inconsistencies across platforms
- Timeline gaps or overlaps
- Skill claims that don't match any evidence
- Suspicious patterns (bulk activity, copied work, etc.)

---

## 🚨 Red Flags to Always Check

### Timeline Fraud
- [ ] Do employment dates match across LinkedIn/Resume?
- [ ] Are there unexplained gaps (>6 months)?
- [ ] Does GitHub activity align with claimed experience years?
- [ ] Does LeetCode activity pattern match job search timeline?

### Skill Mismatches
- [ ] Do GitHub languages match resume primary skills?
- [ ] Do LeetCode languages match claimed expertise?
- [ ] Does LinkedIn job description match actual skills demonstrated?
- [ ] Are claimed technologies visible anywhere in public work?

### Suspicious Activity Patterns
- [ ] Bulk GitHub commits (100+ commits in one day)?
- [ ] Only forked repositories with no modifications?
- [ ] LeetCode solve pattern: all problems in 1-2 weeks?
- [ ] Acceptance rate suspiciously high (>95%)?
- [ ] All repos are tutorial copies with no original work?

### Company/Education Verification
- [ ] Does the company exist and match claimed industry?
- [ ] Is the educational institution legitimate (not diploma mill)?
- [ ] Do employment dates align with company founding date?
- [ ] Are job titles inflated (e.g., "Senior" at 1 YOE)?

---

## 📊 Score Justification Requirements

### Every Score Must Have:

1. **Data Points Used**
   - List specific metrics that influenced the score
   - Example: "201 LeetCode problems, rank 728,765 (top 8%)"

2. **Comparison Benchmark**
   - State what you're comparing against
   - Example: "Compared to 150-300 problem average for 2 YOE"

3. **What Would Improve Score**
   - Specific, actionable items
   - Example: "Would reach 8.0/10 with 100 more problems and 65%+ acceptance rate"

4. **What Would Decrease Score**
   - Concerns or gaps identified
   - Example: "Score would drop if continued inactivity for another 6 months"

---

## ✅ Report Structure Checklist

Every report must include:

### Header Section
- [ ] Developer name
- [ ] Report date and ID
- [ ] Overall credibility score with breakdown
- [ ] Quick summary (2-3 sentences, factual)
- [ ] Best role fit (specific, not generic)

### Platform Analysis (For Each: GitHub, LeetCode, LinkedIn, Resume)
- [ ] What data is accessible (state clearly)
- [ ] What data is NOT accessible (state limitations)
- [ ] Verified facts section
- [ ] Plausible but unverified section
- [ ] Claimed metrics with disclaimers
- [ ] Red flags or concerns (or "None detected")
- [ ] Score with justification

### Cross-Platform Consistency
- [ ] Timeline verification across all platforms
- [ ] Skill consistency check (do they match?)
- [ ] Language/technology alignment analysis
- [ ] Red flag summary (or "None detected")

### Recommendations Section
- [ ] For recruiters: Interview readiness, preparation needed
- [ ] For developers: Growth areas, skill gaps
- [ ] Hire confidence level with reasoning
- [ ] Risk level assessment

### Verification Status
- [ ] Data quality score with breakdown
- [ ] Confidence level in assessment
- [ ] What additional data would improve report
- [ ] Manual analysis time logged

---

## 📋 Pre-Submission Checklist

Before finalizing any report, verify:

### Language Audit
- [ ] No use of "expertise" without 5+ years or recognition
- [ ] No use of "specialization" without proof
- [ ] No use of "solid/strong/excellent" without data justification
- [ ] All claims are neutral and fact-based

### Verification Audit  
- [ ] All resume metrics have disclaimers
- [ ] All claims are marked as VERIFIED, PLAUSIBLE, or CLAIMED
- [ ] No assumptions presented as facts
- [ ] All "data not available" situations are clearly stated

### Consistency Audit
- [ ] Timeline checked across all platforms
- [ ] Skills verified or marked as unverified
- [ ] No contradictions in assessment
- [ ] Scores align with evidence presented

### Disclaimer Audit
- [ ] Every percentage/metric claim has ⚠️ NOTE
- [ ] Every private/inaccessible data has ⚠️ LIMITATION
- [ ] Every plausible item explains reasoning
- [ ] Every red flag is clearly called out

---

## 🎯 Examples: Good vs Bad

### ❌ BAD Example:
```markdown
John is an expert Full Stack Developer with strong expertise in React and 
Node.js. He has excellent problem-solving skills and has made significant 
impact at his company, reducing load times by 80%. He's a solid candidate 
with deep knowledge of system design.
```

**Problems:**
- "Expert" without proof
- "Strong expertise" unsupported
- "Excellent" overused
- "80% reduction" unverified, no disclaimer
- "Solid" is marketing language
- "Deep knowledge" unproven
- "Significant impact" vague

---

### ✅ GOOD Example:
```markdown
John has 3 years of experience as a Full Stack Developer, working primarily 
with React and Node.js as evidenced by his GitHub repositories (React: 15 
repos, Node.js: 12 repos) and LinkedIn work history.

Problem-solving ability: 156 LeetCode problems solved (within typical range 
of 150-300 for 3 YOE developers). Acceptance rate of 62% is slightly above 
average (typical: 60%).

⚠️ CLAIMED: Resume states "80% reduction in page load times" at current role. 
NOTE: This metric cannot be independently verified without access to company's 
internal performance data. Load time improvements of 50-85% are realistic for 
optimization projects.

System design experience: Not demonstrated through public work. Resume lists 
"system design" as a skill but no evidence in public repositories or technical 
writing. May have experience in private company projects not accessible for 
review.

Assessment: Appropriate candidate for mid-level full stack roles. Has expected 
foundation for 3 YOE but no exceptional markers that would place them in top 
20% of cohort.
```

**Why this is good:**
- ✅ "3 years experience" - factual
- ✅ "working primarily with" - neutral
- ✅ Evidence provided (GitHub repo counts)
- ✅ "Within typical range" - benchmarked
- ✅ Disclaimer for 80% claim
- ✅ "Not demonstrated" instead of assuming
- ✅ "Appropriate" instead of "strong"
- ✅ Honest assessment of level

---

## 🔄 Handling Common Scenarios

### Scenario 1: Impressive Resume Claims, Limited Public Evidence
**Do:**
- State what the resume claims
- Note that public evidence doesn't demonstrate this
- Add disclaimer that it may be in private company work
- Assess based on what IS verifiable
- Mark as PLAUSIBLE if it aligns with role, or CLAIMED if it's specific metrics

**Don't:**
- Assume the claims are true
- Fill in gaps with guesses
- Give them benefit of doubt in scoring

---

### Scenario 2: Private LeetCode/GitHub Profiles
**Do:**
- Clearly state "Profile exists but is set to private"
- Note this limits ability to verify problem-solving/code quality
- Score based on what IS accessible (resume, LinkedIn, public platforms)
- Recommend making public for better verification

**Don't:**
- Assume average performance
- Estimate scores
- Penalize heavily (they have right to privacy)

---

### Scenario 3: Activity Patterns (Cramming vs Consistent)
**Do:**
- Describe the pattern observed (dates, frequency)
- Note what it might indicate (job search, learning period, etc.)
- Mention if it raises concerns (bulk activity) or is positive (consistency)
- Compare to typical patterns for that experience level

**Don't:**
- Jump to conclusions about cheating without clear evidence
- Assume motivation without proof
- Be judgmental about cramming (it's common)

---

### Scenario 4: Experience Level Mismatches
**Do:**
- State claimed years of experience
- State actual timeline from verifiable sources
- Calculate accurate experience
- Note if there's inflation
- Adjust assessment based on actual experience

**Don't:**
- Accept resume claim at face value
- Ignore timeline discrepancies
- Give benefit of doubt on inflation

---

### Scenario 5: Buzzword-Heavy Resumes
**Do:**
- List all claimed technologies
- Note which are demonstrated in public work
- Mark unverified ones as "listed but not demonstrated"
- Assess based on proven skills only

**Don't:**
- Assume they know everything listed
- Count listed skills toward assessment
- Take buzzwords as expertise

---

## 📐 Scoring Guidelines

### Overall Credibility Score (X/10)

| Score Range | Meaning | Criteria |
|-------------|---------|----------|
| **9.0-10.0** | Exceptional, Top 10% | Multiple verifications, extensive public work, no red flags, proven expertise |
| **8.0-8.9** | Strong, Top 20% | Good verification, solid public presence, minor gaps, above average |
| **7.0-7.9** | Good, Top 35-40% | Adequate verification, some public work, reasonable consistency, average+ |
| **6.0-6.9** | Acceptable, Top 50% | Basic verification, limited public work, some concerns, average |
| **5.0-5.9** | Below Average | Limited verification, significant gaps, multiple concerns |
| **4.0-4.9** | Concerning | Poor verification, major red flags, inconsistencies |
| **0.0-3.9** | High Risk | Likely fraud, fake profiles, serious misrepresentation |

### Component Scores

**Each platform/aspect gets individual score:**

#### GitHub (Weight: 30%)
- Repository count and quality
- Commit patterns (consistent vs bulk)
- Code complexity and originality
- Contribution to external projects
- Language alignment with claims

#### LeetCode (Weight: 25%)
- Problem count vs experience level
- Easy:Medium:Hard ratio
- Acceptance rate
- Contest participation
- Activity consistency

#### LinkedIn (Weight: 15%)
- Company verification (do they exist?)
- Timeline consistency
- Job title progression
- Education verification
- Network quality

#### Resume-Reality Consistency (Weight: 15%)
- Skills match public work?
- Timeline accuracy
- Claimed impact plausibility
- Technology stack alignment

#### Cross-Platform Verification (Weight: 15%)
- Timeline consistency across all platforms
- Language/skill consistency
- No contradictions
- Red flags absent

---

## 🎯 Final Reminders

### Our Mission:
**"We verify developer credibility through factual analysis, not marketing."**

### Core Principles:
1. **Facts over feelings** - Data, not opinions
2. **Verified over claimed** - Proof, not promises  
3. **Neutral over promotional** - Honest, not sales-y
4. **Transparent over assumptive** - Clear limitations stated
5. **Accurate over impressive** - Truth, not hype

### When in Doubt:
- ✅ **State limitation** instead of guessing
- ✅ **Mark as unverified** instead of assuming true
- ✅ **Use neutral language** instead of strong claims
- ✅ **Add disclaimer** instead of presenting as fact
- ✅ **Understate** rather than overstate

---

**Remember:** Recruiters trust us to be the fact-checking layer. Developers trust us to be honest. Our credibility depends on accuracy, not on making candidates look good.

---

## 📞 Questions or Edge Cases?

If you encounter situations not covered in this guide:
1. Default to **more conservative assessment**
2. **Clearly state the limitation** in the report
3. **Document the edge case** for guideline updates
4. **Never guess** - always state when data is insufficient

---

**Document Version:** 1.0  
**Last Updated:** February 16, 2026  
**Status:** Active Guidelines - Use for all future reports
