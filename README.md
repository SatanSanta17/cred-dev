# 🔍 CredDev - The Fact-Checking Layer for Developer Credibility

**Verify skills. Detect fraud. Build trust.**

![CredDev](https://img.shields.io/badge/Status-Pre--Launch-purple)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)

---

## 🎯 What is CredDev?

CredDev is a **developer credibility verification platform** that analyzes multi-platform signals to create fact-based, transparent reports. We are NOT a branding layer—we're a fact-checking layer.

### Our Core Philosophy

```
✅ WE ARE:
• A fact-checking layer that verifies developer claims
• An objective assessment platform that presents data neutrally
• A credibility verification service that distinguishes truth from claims

❌ WE ARE NOT:
• A branding or marketing layer that sells candidates
• An assumption-making service that fills gaps with guesses
• A promotional platform that inflates achievements
```

### Three-Tier Verification System

Every piece of information is classified into:

1. **✅ VERIFIED:** Independently confirmed through public sources
2. **🟡 PLAUSIBLE:** Aligns with context but cannot be independently confirmed
3. **⚠️ CLAIMED:** Specific metrics/achievements that cannot be verified

---

## 📊 What We Analyze

### Data Sources
- **GitHub**: Public repos, commit history, code quality, contribution patterns
- **LeetCode**: Problems solved, acceptance rate, contest rating, consistency
- **LinkedIn**: Employment history, network, endorsements, profile completeness
- **Resume**: Cross-platform consistency, timeline verification, claim validation

### What We Detect

**✅ Authenticity Signals:**
- Consistent timelines across platforms
- Natural progression patterns
- Verified projects and contributions
- Genuine skill demonstrations

**🚨 Red Flags:**
- Resume-LinkedIn inconsistencies
- Timeline fraud (experience vs. activity)
- Bulk commit patterns / copy-paste syndrome
- Ghost developer (no code evidence)
- Skill inflation / title mismatches
- Unverified leadership claims

---

## 📋 Report Types (Layered System)

### Layer 1: Extensive Report
**Purpose:** Deep-dive analysis for internal assessment  
**Length:** 1200-1800 lines  
**Audience:** Internal hiring teams, detailed evaluation  
**Contains:** Full analysis, interview strategies, growth recommendations, prescriptive advice

### Layer 2: Overview Report
**Purpose:** Concise hiring decision summary  
**Length:** 300-500 lines (1-2 pages)  
**Audience:** Hiring managers, senior recruiters  
**Contains:** Executive summary, key findings, credibility breakdown, hiring recommendation

### Layer 3: Snapshot Report
**Purpose:** At-a-glance decision-making  
**Length:** 150-200 lines (1 page)  
**Audience:** Recruiters, first-line screeners  
**Contains:** ONLY facts + market positioning, NO advice/tactics/process  
**Critical Rule:** Information provider, NOT consultant

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **Animations**: Framer Motion

### Backend (Planned)
- **Database**: Supabase (PostgreSQL)
- **APIs**: GitHub API, LeetCode scraping, LinkedIn (planned)
- **Analysis**: Custom scoring algorithms
- **AI**: LLM-assisted report generation (GPT-4)

### Infrastructure
- **Hosting**: Vercel
- **Form Validation**: React Hook Form + Zod
- **Analytics**: Vercel Analytics (planned)

---

## 📁 Project Structure

```
cred-dev/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── report/
│   │   ├── Burhanuddin/
│   │   │   └── page.tsx           # Sample report page
│   │   └── [candidate]/
│   │       └── page.tsx           # Dynamic report routes (planned)
│   └── globals.css                 # Global styles
├── components/
│   ├── sections/
│   │   ├── hero.tsx               # Hero with CTA
│   │   ├── problem.tsx            # Problem statement
│   │   ├── how-it-works.tsx       # 3-step process
│   │   ├── sample-output.tsx      # Report preview + CTA
│   │   ├── for-developers.tsx
│   │   ├── for-recruiters.tsx
│   │   ├── waitlist-form.tsx      # Supabase-connected
│   │   └── footer.tsx
│   └── ui/                         # shadcn/ui components
├── reports/                        # Report guidelines & samples
│   ├── REPORT_GUIDELINES.md       # Comprehensive writing standards
│   ├── REPORT_CHECKLIST.md        # Quick reference checklist
│   ├── Pradeep/
│   │   ├── Pradeep.txt            # Extensive report
│   │   ├── Pradeep_Overview.md    # Overview report
│   │   └── Pradeep_Snapshot.md    # Snapshot report
│   ├── Burhanuddin/
│   │   ├── Burhanuddin.txt
│   │   ├── Burhanuddin_Overview.md
│   │   └── Burhanuddin_Snapshot.md
│   └── Gauri/
│       ├── Gauri.txt
│       └── Gauri_Snapshot.md
├── lib/
│   ├── supabase.ts                # Supabase client
│   └── utils.ts                   # Utility functions
└── public/                        # Static assets
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

## 📈 Roadmap

### Phase 1: Pre-Launch (Current)
- [x] Landing page with waitlist
- [x] Sample report pages (Burhanuddin)
- [x] Report writing guidelines & checklists
- [x] 3-layer reporting system defined
- [x] Fact-checking philosophy established
- [ ] Custom domain setup
- [ ] SEO optimization

### Phase 2: MVP (Q2 2026)
- [ ] GitHub API integration
- [ ] LeetCode scraping automation
- [ ] LinkedIn data collection (via consent)
- [ ] Automated report generation
- [ ] Developer dashboard
- [ ] Recruiter portal (search & filter)

### Phase 3: Scale (Q3 2026)
- [ ] AI-assisted analysis (LLM integration)
- [ ] Fraud detection algorithms
- [ ] Batch processing for companies
- [ ] Email notification system
- [ ] Analytics dashboard
- [ ] API for enterprise clients

### Phase 4: Monetization (Q4 2026)
- [ ] Freemium model for developers
- [ ] Recruiter subscription tiers
- [ ] Enterprise API pricing
- [ ] White-label solutions

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
