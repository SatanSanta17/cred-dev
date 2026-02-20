# 🔍 CredDev - The Fact-Checking Layer for Developer Credibility

**Verify skills. Detect fraud. Build trust.**

![CredDev](https://img.shields.io/badge/Status-MVP--Ready-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green)
![Python](https://img.shields.io/badge/Python-3.11+-yellow)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-orange)

---

## 🎯 What is CredDev?

CredDev is a **developer credibility verification platform** that analyzes multi-platform signals to create fact-based, transparent reports. We are NOT a branding layer—we're a fact-checking layer.

### Our Core Philosophy

```
✅ WE ANALYZE: Engineering capability, Problem-solving depth, Credibility signals, Execution patterns
❌ WE IGNORE: Platform vanity metrics, Resume hype, Social media presence, Generic statistics

✅ WE ARE: The Skill Intelligence Engine - Converting platform signals into capability insights
❌ WE ARE NOT: A data aggregator, Resume checker, or Platform analyzer
```

### Intelligence Architecture

#### 🧠 **Intelligence Core (Primary Analysis)**
- **Capability Identity**: One-sentence role positioning
- **4-Domain Assessment**: Engineering, Problem Solving, Credibility, Execution
- **VERIFIED/PLAUSIBLE/CLAIMED** claim classification
- **Cross-domain pattern** recognition

#### 📊 **Derived Views (Stakeholder-Specific)**
- **Developer Insight View**: Growth-focused guidance
- **Recruiter Insight View**: Decision-oriented assessment
- **Credibility Card**: Shareable professional positioning

### Verification Framework

Every claim is classified as:
1. **✅ VERIFIED:** Observable evidence supports the claim
2. **🟡 PLAUSIBLE:** Consistent with context but not fully verifiable
3. **⚠️ CLAIMED:** Stated but lacking supporting evidence

---

## 🧠 What We Analyze

### Intelligence Domains (NOT Platforms)

CredDev analyzes **capability** across four critical dimensions:

#### 🎯 **Domain 1: Engineering & Development**
- Production system architecture
- Code complexity and maturity
- Deployment and DevOps awareness
- System design patterns

#### 🧮 **Domain 2: Problem Solving & Algorithms**
- Algorithmic thinking depth
- Interview readiness assessment
- Competitive programming analysis
- Pattern recognition skills

#### ✅ **Domain 3: Professional Credibility**
- Claim verification across platforms
- Timeline consistency validation
- Skills authenticity assessment
- Trustworthiness indicators

#### ⚡ **Domain 4: Execution & Consistency**
- Long-term engagement patterns
- Learning velocity and discipline
- Quality-over-quantity assessment
- Professional consistency

### Evidence Sources
- **GitHub**: Engineering capability signals
- **LeetCode**: Problem-solving demonstrations
- **Resume**: Professional claim validation
- **Cross-platform**: Consistency verification

### Intelligence Signals

**✅ Green Signals (Strengths):**
- Production engineering evidence
- Verified algorithmic capability
- Consistent professional timeline
- Disciplined execution patterns

**🟡 Yellow Signals (Caution):**
- Limited production experience
- Inconsistent activity patterns
- Unverified skill claims
- Platform-specific gaps

**🔴 Red Signals (Risks):**
- Timeline inconsistencies
- Bulk activity patterns
- Unverified leadership claims
- Credibility gaps

---

## 📋 Intelligence Outputs

### 🧠 Intelligence Core (Primary Analysis)
**Purpose:** Single source of truth for capability assessment
**Content:** 4-domain analysis, capability identity, cross-domain patterns
**Audience:** Internal processing (powers all other outputs)
**Contains:** VERIFIED/PLAUSIBLE/CLAIMED claims, signal classification, scoring

### 📊 Derived Views (Stakeholder-Specific)

#### Developer Insight View
**Purpose:** Growth and development guidance
**Focus:** Career positioning, skill gaps, improvement trajectories
**Tone:** Supportive, directional, actionable
**Contains:** Role clarity, growth levers, 30-60 day focus areas

#### Recruiter Insight View
**Purpose:** Hiring decision intelligence
**Focus:** Screening clarity, interview guidance, risk assessment
**Tone:** Operational, evidence-based, decision-oriented
**Contains:** Verification summary, confidence levels, hiring recommendations

#### Credibility Card (Future)
**Purpose:** Professional positioning and visibility
**Focus:** Identity signaling, percentile positioning
**Tone:** Neutral, factual, shareable
**Contains:** Capability identity, key strengths, verification status

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **Animations**: Framer Motion

### Backend (Implemented)
- **Analysis Engine**: Python Skill Intelligence Engine (FastAPI)
- **Database**: Supabase (PostgreSQL)
- **APIs**: GitHub API integration, LeetCode data extraction
- **Analysis**: 4-domain capability assessment with cross-correlation
- **AI**: Template-based intelligence generation (LLM-ready)

### Infrastructure
- **Hosting**: Vercel
- **Form Validation**: React Hook Form + Zod
- **Analytics**: Vercel Analytics (planned)

---

## 🧠 Technical Achievement: Skill Intelligence Engine

CredDev has evolved from a **platform analyzer** to a **capability intelligence system**:

### **Before: Platform-Centric Analysis**
- GitHub stats, LeetCode scores, LinkedIn metrics
- Basic verification against stated claims
- Platform-specific insights and recommendations

### **After: Capability Intelligence**
- **4-Domain Analysis**: Engineering depth, problem-solving capability, credibility signals, execution consistency
- **Intelligence Core**: Single source of truth with cross-domain correlation
- **Stakeholder Views**: Developer growth insights, recruiter hiring intelligence
- **Evidence Framework**: VERIFIED/PLAUSIBLE/CLAIMED classification system

### **Key Innovation: Intelligence Architecture**
```
Raw Signals → Domain Analysis → Intelligence Core → Derived Views
     ↓              ↓              ↓              ↓
  GitHub/         Engineering/    Capability     Developer/
  LeetCode       Problem Solving Identity      Recruiter
  Resume         Credibility/                  Insights
                 Execution
```

**Result**: Platform-agnostic capability assessment that answers: "*What can this person build? How do they solve problems? Are they reliable? What role fits them?*"

---

## 📁 Project Structure

```
cred-dev/
├── app/                           # Next.js Frontend
│   ├── page.tsx                   # Landing page
│   ├── report/
│   │   ├── Burhanuddin/
│   │   │   └── page.tsx          # Sample report page
│   │   └── [candidate]/
│   │       └── page.tsx          # Dynamic report routes (planned)
│   └── globals.css                # Global styles
├── components/                    # React Components
│   ├── sections/
│   │   ├── hero.tsx              # Hero with CTA
│   │   ├── problem.tsx           # Problem statement
│   │   ├── how-it-works.tsx      # 3-step process
│   │   ├── sample-output.tsx     # Report preview + CTA
│   │   ├── for-developers.tsx
│   │   ├── for-recruiters.tsx
│   │   ├── waitlist-form.tsx     # Supabase-connected
│   │   └── footer.tsx
│   └── ui/                        # shadcn/ui components
├── server/                        # Backend Services
│   ├── user-service/              # User management (planned)
│   └── cred-service/              # Skill Intelligence Engine
│       ├── app/                   # FastAPI application
│       │   ├── main.py           # API server
│       │   ├── config.py         # Environment config
│       │   ├── database.py       # SQLAlchemy models
│       │   └── routes/           # API endpoints
│       │       └── analyze.py    # Analysis endpoints
│       ├── services/             # Business logic
│       │   ├── verifier.py       # 4-domain analysis
│       │   ├── github_fetcher.py # GitHub integration
│       │   ├── report_generator.py # Intelligence generation
│       │   └── __init__.py       # AnalysisService orchestrator
│       ├── models/               # Data models
│       │   ├── analysis.py       # API models
│       │   └── reports.py        # Intelligence models
│       └── utils/                # Helpers
├── reports/                       # Intelligence Guidelines
│   ├── REPORT_GUIDELINES.md      # Skill Intelligence Engine Model
│   ├── REPORT_CHECKLIST.md       # 9-stage workflow
│   ├── Pradeep/                  # Sample analyses
│   │   ├── Pradeep.txt
│   │   ├── Pradeep_Overview.md
│   │   └── Pradeep_Snapshot.md
│   ├── Burhanuddin/
│   │   ├── Burhanuddin.txt
│   │   ├── Burhanuddin_Overview.md
│   │   └── Burhanuddin_Snapshot.md
│   └── Gauri/
│       ├── Gauri.txt
│       └── Gauri_Snapshot.md
├── lib/
│   ├── supabase.ts               # Supabase client
│   └── utils.ts                  # Utility functions
└── public/                       # Static assets
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Vercel account (for deployment)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd cred-dev
npm install
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run:

```sql
create table waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  user_type text not null check (user_type in ('developer', 'recruiter')),
  github_profile text,
  organization text,
  willing_to_connect boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table waitlist enable row level security;

create policy "Anyone can insert to waitlist" 
on waitlist for insert 
with check (true);

create policy "Service role can read waitlist" 
on waitlist for select 
using (true);
```

3. Get your credentials from **Settings → API**

### 3. Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## 📖 Report Writing Standards

### Key Guidelines

All reports must follow the principles in `/reports/REPORT_GUIDELINES.md`:

1. **Three-Tier Verification**: VERIFIED → PLAUSIBLE → CLAIMED
2. **Neutral Language**: Avoid promotional words without proof
3. **Clear Disclaimers**: State limitations and unverified claims
4. **No Assumptions**: If data is missing, state "data not found"
5. **Cross-Platform Consistency**: Check for discrepancies

### Language Standards

**❌ AVOID (Without Proof):**
- Expertise, Specialization, Mastery
- Elite, Exceptional, Outstanding (without benchmarking)
- "Proven track record", "Deep understanding"

**✅ USE INSTEAD:**
- Experience, Work, Exposure
- Above average, Strong (with data)
- "Based on [data source]", "Verified via [platform]"

### Report Checklist

Before finalizing any report, verify:
- [ ] All metrics marked as VERIFIED, PLAUSIBLE, or CLAIMED
- [ ] Disclaimers added for unverified claims
- [ ] Cross-platform inconsistencies documented
- [ ] No assumptions made (state "data not found" instead)
- [ ] Neutral language used throughout
- [ ] Scam detection analysis completed
- [ ] Layer-appropriate content (Extensive vs Overview vs Snapshot)

**See `/reports/REPORT_CHECKLIST.md` for detailed checklist.**

---

## 🎯 For Developers

### What You Get
- ✅ Fact-based credibility report (not a sales pitch)
- 📊 Verified rankings with market positioning
- 🎯 Role-fit analysis based on actual data
- 🔗 Shareable profile with transparency
- ⚠️ Honest assessment of strengths + weaknesses

### What We DON'T Do
- ❌ Inflate your achievements
- ❌ Make assumptions about your skills
- ❌ Hide your weaknesses
- ❌ Brand you as something you're not

**We show recruiters the TRUTH about your profile—verified, plausible, or claimed.**

---

## 🎯 For Recruiters

### What You Get
- ⚡ 90% faster candidate screening
- ✅ Cross-platform verification (GitHub + LeetCode + LinkedIn)
- 🚨 Fraud detection and red flags
- 📊 Fact-based skill assessment
- 🎯 Three report layers (Extensive, Overview, Snapshot)

### What We DON'T Do
- ❌ Tell you who to hire (you decide)
- ❌ Give interview tactics (you design your process)
- ❌ Recommend compensation (you set the offer)
- ❌ Prescribe hiring steps (you follow your workflow)

**We provide FACTS and market positioning—you make the decision.**

---

## 🔍 Sample Reports

### Available Examples

1. **Pradeep N C** (Backend Developer, 2+ YOE)
   - Extensive: `/reports/Pradeep/Pradeep.txt`
   - Overview: `/reports/Pradeep/Pradeep_Overview.md`
   - Snapshot: `/reports/Pradeep/Pradeep_Snapshot.md`

2. **Burhanuddin Chitalwala** (Full-Stack Developer, 1.5+ YOE)
   - Extensive: `/reports/Burhanuddin/Burhanuddin.txt`
   - Overview: `/reports/Burhanuddin/Burhanuddin_Overview.md`
   - Snapshot: `/reports/Burhanuddin/Burhanuddin_Snapshot.md`
   - Live Page: `/app/report/Burhanuddin/page.tsx`

3. **Sri Gauri Pandey** (Student/Fresher, Multiple Discrepancies)
   - Extensive: `/reports/Gauri/Gauri.txt`
   - Snapshot: `/reports/Gauri/Gauri_Snapshot.md`
   - **Case Study:** Elite LeetCode performance with resume-LinkedIn inconsistencies

### View Live Sample

Visit the deployed site and click **"View Sample Report"** to see Burhanuddin's full report in action.

---

## 🌐 Deploy to Vercel

### Option 1: With Supabase Integration (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repo
3. Add Supabase integration:
   - Go to `https://vercel.com/integrations/supabase`
   - Connect your Supabase project
   - Environment variables auto-sync ✨
4. Deploy!

### Option 2: Manual Deployment

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard under **Settings → Environment Variables**.

---

## 🐛 Troubleshooting

### "Supabase URL is not defined"
- Check `.env.local` exists and has correct values
- Restart dev server after adding env variables
- Verify env variable names start with `NEXT_PUBLIC_`

### Waitlist form not submitting
- Check Supabase table was created correctly
- Verify Row Level Security policies are set
- Check browser console for errors

### Report pages not rendering
- Ensure all UI components are installed (`npm install`)
- Check for missing imports in component files
- Verify `@radix-ui/react-progress` is installed

---

## 📈 Implementation Roadmap

### ✅ **Phase 1: Intelligence Engine Foundation (COMPLETED)**
- [x] **Skill Intelligence Engine Model** - 4-domain analysis architecture
- [x] **Intelligence Core & Derived Views** - Multi-stakeholder output system
- [x] **VERIFIED/PLAUSIBLE/CLAIMED framework** - Evidence-based verification
- [x] **Backend Infrastructure** - FastAPI service with database models
- [x] **API Endpoints** - Analysis job creation and status tracking
- [x] **Landing page with waitlist** - Supabase-connected user acquisition
- [x] **Intelligence Guidelines** - REPORT_GUIDELINES.md & REPORT_CHECKLIST.md

### 🔄 **Phase 2: Platform Integration & Analysis (IN PROGRESS)**
- [x] **GitHub API Integration** - Repository analysis and engineering signals
- [ ] **LeetCode Data Extraction** - Problem-solving pattern analysis
- [ ] **Resume Parsing** - PDF/text extraction and claim identification
- [ ] **Cross-platform Verification** - Timeline and claim consistency
- [ ] **Database Result Storage** - Complete analysis persistence
- [ ] **Error Handling & Logging** - Robust background processing

### 🚀 **Phase 3: Intelligence Generation & UI (NEXT)**
- [ ] **Full Analysis Pipeline** - End-to-end intelligence generation
- [ ] **Developer Dashboard** - Analysis results and growth insights
- [ ] **Recruiter Portal** - Search, filter, and hiring intelligence
- [ ] **Dynamic Report Pages** - Real-time analysis visualization
- [ ] **Frontend-Backend Integration** - Complete user experience
- [ ] **API Rate Limiting & Caching** - Production-ready performance

### 🌟 **Phase 4: Advanced Features & Scale (FUTURE)**
- [ ] **LLM-Enhanced Analysis** - Natural language intelligence generation
- [ ] **LinkedIn Integration** - Professional network and credibility signals
- [ ] **Batch Processing** - Enterprise-scale analysis capabilities
- [ ] **Analytics Dashboard** - Usage metrics and intelligence insights
- [ ] **Email Notifications** - Analysis completion and insights delivery
- [ ] **Enterprise API** - White-label and integration solutions

### 🎯 **Current Status**
- **Frontend**: Landing page with waitlist ✅
- **Backend**: Skill Intelligence Engine core ✅
- **Analysis**: 4-domain framework ✅
- **Integration**: Basic API working ✅
- **Production**: Ready for MVP testing 🔄

---

## 🧪 Testing Philosophy

### What We Test
- Cross-platform data consistency
- Timeline verification
- Scam pattern detection
- Red flag identification
- Claim vs. reality alignment

### What We DON'T Test
- Coding skills directly (we analyze public work)
- Soft skills / culture fit
- Real-time problem-solving (we look at history)

**Note:** We recommend live coding tests for final validation (as stated in our reports).

---

## 🤝 Contributing

This is a pre-launch project. For suggestions or issues:
1. Review `/reports/REPORT_GUIDELINES.md` for our philosophy
2. Check `/reports/REPORT_CHECKLIST.md` for standards
3. Submit issues with detailed context
4. Follow our fact-checking principles in PRs

---

## 📄 License

Private project - All rights reserved.

---

## 🙏 Credits

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Database by [Supabase](https://supabase.com/)

---

## 🎓 Learn More

### Key Documents
- **Report Guidelines**: `/reports/REPORT_GUIDELINES.md` (755 lines)
- **Report Checklist**: `/reports/REPORT_CHECKLIST.md` (393 lines)
- **Sample Reports**: `/reports/[Pradeep|Burhanuddin|Gauri]/`

### Philosophy Resources
Read our sample reports to understand:
- How we distinguish VERIFIED vs CLAIMED data
- How we handle discrepancies (see Gauri's report)
- How we avoid promotional language
- How we provide market positioning without prescriptive advice

---

**Made with 💜 by the CredDev team**

*"We don't sell candidates. We verify them."*

**Verify skills. Detect fraud. Build trust.**
