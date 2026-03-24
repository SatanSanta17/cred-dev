'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Zap,
  Github,
  Code2,
  FileText,
  Briefcase,
  Shield,
} from 'lucide-react'
import { GradientText } from '@/components/shared/gradient-text'
import { BackLink } from '@/components/shared/back-link'
import { SkillGroup } from '../_components/skill-group'
import { SignalBadge } from '../_components/signal-badge'
import { RiskFlagCard } from '../_components/risk-flag-card'
import Link from 'next/link'

// ============================================================
// All data on this page comes from the real extensive report
// PDF generated on March 04, 2026 for Burhanuddin Chitalwala.
// No fabricated scores, percentiles, or confidence numbers.
// ============================================================

// --- Verified Skills Data (from Section 6: Credibility Verification) ---

const LANGUAGES = [
  { name: 'Java', verified: true, source: 'GitHub repos + LeetCode submissions' },
  { name: 'Python', verified: true, source: 'GitHub repos (book-bitch, Waste-Management)' },
  { name: 'JavaScript', verified: true, source: 'GitHub repos (pickMe, AKNextApp)' },
  { name: 'TypeScript', verified: true, source: 'GitHub repos (cred-dev, bhendi-bazaar)' },
  { name: 'PHP', verified: true, source: 'GitHub repo (form-made-in-php)' },
  { name: 'CSS/HTML', verified: true, source: 'GitHub repos (portfolio, about-glocalbodh)' },
  { name: 'Kotlin', verified: false, source: 'No GitHub repo or LeetCode evidence' },
  { name: 'SQL', verified: false, source: 'No GitHub language node or LeetCode evidence' },
]

const FRAMEWORKS = [
  { name: 'React', verified: true, source: 'Repo description: "React-based web app" (ai_conference_room)' },
  { name: 'Next.js', verified: true, source: 'Repo name AKNextApp + package.json in multiple repos' },
  { name: 'Node.js', verified: false, source: 'No repo description/name/topic explicitly references Node.js' },
  { name: 'Flask', verified: false, source: 'No repo description/name/topic references Flask' },
  { name: 'Laravel', verified: false, source: 'No repo description/name/topic references Laravel' },
  { name: 'Vue.js', verified: false, source: 'No repo description/name/topic references Vue.js' },
  { name: 'Bootstrap', verified: false, source: 'No repo description/name/topic references Bootstrap' },
]

const DATABASES = [
  { name: 'MySQL', verified: true, source: 'Repo description: "first php project using mysql" (form-made-in-php)' },
  { name: 'MongoDB', verified: false, source: 'No repo description or language node shows MongoDB' },
]

// --- Production Signals Data (from Section 5) ---

const PRODUCTION_SIGNALS = [
  {
    repo: 'cred-dev',
    description: 'TypeScript, Next.js, React 19',
    signals: {
      packageJson: true,
      readme: true,
      ci: false,
      dockerfile: false,
      tests: false,
    },
  },
  {
    repo: 'bhendi-bazaar',
    description: 'E-commerce, TypeScript, Prisma',
    signals: {
      packageJson: true,
      readme: true,
      ci: true,
      dockerfile: false,
      tests: false,
    },
  },
  {
    repo: 'book-bitch',
    description: 'Python, FastAPI/OpenAI/Pinecone',
    signals: {
      packageJson: false,
      readme: false,
      ci: false,
      dockerfile: false,
      tests: true,
    },
  },
  {
    repo: 'activity-tracker',
    description: 'VSCode extension, TypeScript',
    signals: {
      packageJson: true,
      readme: false,
      ci: false,
      dockerfile: false,
      tests: true,
    },
  },
]

// --- Risk Flags (from Section 8) ---

const RISK_FLAGS = [
  {
    title: 'Experience duration discrepancy',
    description: 'Resume summary claims "1.5+ years" while job dates show Jul 2023 → Present (~2.5 years across multiple roles).',
    source: 'Resume text > SUMMARY vs EXPERIENCE dates',
  },
  {
    title: 'Kotlin / Android claim not corroborated',
    description: 'Resume states Android (Kotlin) work, but no GitHub repository lists Kotlin as a language and no LeetCode submissions use Kotlin.',
    source: 'Resume > TECHNICAL SKILLS; GitHub > languages.edges (no Kotlin)',
  },
  {
    title: 'Several framework/database claims unverified',
    description: 'Laravel, Flask, Vue.js, Node.js, MongoDB are claimed on the resume but do not appear in repository descriptions, names, or topics in the raw data.',
    source: 'Resume > TECHNICAL SKILLS; GitHub > repositories descriptions/topics',
  },
  {
    title: 'High-impact business metrics uncorroborated',
    description: 'Revenue projection ($786 million), percent improvements (40%, 27%), and user counts (5 million) appear only in the resume and are not corroborated by code/release artifacts.',
    source: 'Resume > EXPERIENCE bullets',
  },
]

// --- Work History (from Section 7) ---

const WORK_HISTORY = [
  {
    company: 'InMobi',
    role: 'Full Stack Developer',
    period: 'Jul 2025 – Present',
    detail: 'Omnichannel Ad Publishing Platform, Next.js/TypeScript/Tailwind',
  },
  {
    company: 'Stellantis',
    role: 'Software Developer',
    period: 'Feb 2024 – Jul 2025',
    detail: 'Alexa Skills and LLM integrations',
  },
  {
    company: 'ITR Consulting',
    role: 'Software Developer Intern',
    period: 'Jul 2023 – Jan 2024',
    detail: 'Laravel + Vue.js stack, high-traffic web app',
  },
]

export default function BurhanuddinReportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">

        {/* Back Link */}
        <BackLink className="mb-6" />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">
                <GradientText>CredDev</GradientText>
                <span className="text-white"> — Comprehensive Report</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">
                Burhanuddin Chitalwala • Generated March 04, 2026
              </p>
            </div>
            <Badge
              variant="outline"
              className="self-start border-purple-500/50 text-purple-400 px-3 py-1 text-xs"
            >
              Real report — not a mockup
            </Badge>
          </div>

          {/* Data Source Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-slate-800 border-slate-700 text-slate-300 gap-1.5">
              <Github className="w-3 h-3" /> GitHub
              <CheckCircle2 className="w-3 h-3 text-green-400" />
            </Badge>
            <Badge className="bg-slate-800 border-slate-700 text-slate-300 gap-1.5">
              <Code2 className="w-3 h-3" /> LeetCode
              <CheckCircle2 className="w-3 h-3 text-green-400" />
            </Badge>
            <Badge className="bg-slate-800 border-slate-700 text-slate-300 gap-1.5">
              <FileText className="w-3 h-3" /> Resume
              <CheckCircle2 className="w-3 h-3 text-green-400" />
            </Badge>
          </div>
        </motion.div>

        {/* Verdict Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Final Technical Positioning</h2>
            </div>

            <p className="text-slate-300 text-sm mb-4">
              Early-career software engineer (resume job start Jul 2023, continuous roles through Present).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-green-400 text-sm font-semibold mb-2">Verified Strengths</p>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Full-stack web development with TypeScript/JavaScript and Next.js/React (multiple repos and package.json entries)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Backend and Python/LLM/embedding stack (FastAPI/OpenAI/Pinecone/Streamlit in book-bitch)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Strong algorithmic footprint: 555 distinct accepted problems on LeetCode with deep coverage in Arrays, Hash Tables, DP, Sorting, DFS
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-amber-400 text-sm font-semibold mb-2">Significant Gaps</p>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    Kotlin/Android codebase not present in GitHub data
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    Several framework/database claims (Laravel, Flask, Vue.js, Node.js, MongoDB) lack corroborating repository evidence
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    Key resume impact metrics are not platform-verified
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <p className="text-slate-400 text-sm">
                <span className="text-white font-medium">Overall signal quality:</span> moderate-to-strong for web full-stack and algorithmic capabilities (verified by multiple active repositories, package.json dependencies, commit/PR activity, and LeetCode problem counts); weaker or unverified for Android/Kotlin and some claimed backend/framework technologies due to absence of explicit platform evidence.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Verified Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            Credibility Verification
          </h2>
          <p className="text-slate-500 text-xs mb-4">
            Each resume skill is VERIFIED only when explicit evidence exists in GitHub or LeetCode data. Otherwise marked UNVERIFIED.
          </p>

          <div className="space-y-4">
            <SkillGroup title="Languages" skills={LANGUAGES} />
            <SkillGroup title="Frameworks & Libraries" skills={FRAMEWORKS} />
            <SkillGroup title="Databases" skills={DATABASES} />
          </div>
        </motion.div>

        {/* Problem Solving */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-400" />
            Problem Solving Depth
          </h2>

          <Card className="p-6 bg-slate-800/30 border-slate-700">
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-blue-400">555</p>
                <p className="text-slate-500 text-xs">Problems Solved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-green-400">98.58%</p>
                <p className="text-slate-500 text-xs">Acceptance Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-purple-400">44</p>
                <p className="text-slate-500 text-xs">Current Streak</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-cyan-400">78</p>
                <p className="text-slate-500 text-xs">Total Active Days</p>
              </div>
            </div>

            {/* Difficulty Breakdown */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Badge className="bg-green-500/10 border-green-500/30 text-green-400">
                Easy: 205
              </Badge>
              <Badge className="bg-amber-500/10 border-amber-500/30 text-amber-400">
                Medium: 296
              </Badge>
              <Badge className="bg-red-500/10 border-red-500/30 text-red-400">
                Hard: 54
              </Badge>
            </div>

            {/* Top Topics */}
            <div>
              <p className="text-slate-400 text-sm font-medium mb-2">Top Topics (by problems solved)</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Array', count: 311 },
                  { name: 'Hash Table', count: 126 },
                  { name: 'Dynamic Programming', count: 80 },
                  { name: 'Sorting', count: 80 },
                  { name: 'Depth-First Search', count: 71 },
                ].map((topic) => (
                  <Badge
                    key={topic.name}
                    variant="outline"
                    className="border-slate-700 text-slate-300 text-xs"
                  >
                    {topic.name} ({topic.count})
                  </Badge>
                ))}
              </div>
            </div>

            <p className="text-slate-600 text-xs mt-4">
              Source: LeetCode &gt; matchedUser.submitStats, tagProblemCounts, userCalendar
            </p>
          </Card>
        </motion.div>

        {/* Production Signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Github className="w-5 h-5 text-slate-400" />
            Production Readiness Signals
          </h2>
          <p className="text-slate-500 text-xs mb-4">
            Per-repository check from provided raw data. 42 total public repositories, top repos shown.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRODUCTION_SIGNALS.map((repo) => (
              <Card
                key={repo.repo}
                className="p-4 bg-slate-800/30 border-slate-700"
              >
                <div className="mb-2">
                  <p className="text-white font-semibold text-sm">{repo.repo}</p>
                  <p className="text-slate-500 text-xs">{repo.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <SignalBadge label="pkg.json" present={repo.signals.packageJson} />
                  <SignalBadge label="README" present={repo.signals.readme} />
                  <SignalBadge label="CI" present={repo.signals.ci} />
                  <SignalBadge label="Tests" present={repo.signals.tests} />
                  <SignalBadge label="Docker" present={repo.signals.dockerfile} />
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Work History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-slate-400" />
            Work History
          </h2>
          <p className="text-slate-500 text-xs mb-4">Sourced from resume text only</p>

          <div className="space-y-3">
            {WORK_HISTORY.map((job, index) => (
              <Card
                key={index}
                className="p-4 bg-slate-800/30 border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <p className="text-white font-semibold text-sm">
                    {job.company}
                    <span className="text-slate-400 font-normal"> — {job.role}</span>
                  </p>
                  <p className="text-slate-500 text-xs">{job.detail}</p>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm flex-shrink-0">{job.period}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Risk Flags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Risk Flags
          </h2>
          <p className="text-slate-500 text-xs mb-4">
            Each flag cites supporting raw data. These are areas to probe, not disqualifications.
          </p>

          <div className="space-y-3">
            {RISK_FLAGS.map((flag, index) => (
              <RiskFlagCard key={index} flag={flag} />
            ))}
          </div>
        </motion.div>

        {/* GitHub Activity Stats (from Section 4) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">Execution & Consistency</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-4 bg-slate-800/30 border-slate-700 text-center">
              <p className="text-xl sm:text-2xl font-bold text-slate-200">151</p>
              <p className="text-slate-500 text-xs">Total Commits</p>
            </Card>
            <Card className="p-4 bg-slate-800/30 border-slate-700 text-center">
              <p className="text-xl sm:text-2xl font-bold text-slate-200">16</p>
              <p className="text-slate-500 text-xs">Pull Requests</p>
            </Card>
            <Card className="p-4 bg-slate-800/30 border-slate-700 text-center">
              <p className="text-xl sm:text-2xl font-bold text-slate-200">93.75%</p>
              <p className="text-slate-500 text-xs">PR Merge Rate</p>
            </Card>
            <Card className="p-4 bg-slate-800/30 border-slate-700 text-center">
              <p className="text-xl sm:text-2xl font-bold text-slate-200">248</p>
              <p className="text-slate-500 text-xs">Total Contributions</p>
            </Card>
          </div>
          <p className="text-slate-600 text-xs mt-2">
            Source: GitHub &gt; contributionsCollection, pullRequests
          </p>
        </motion.div>

        {/* Footer CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-slate-800 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Want your own report?</h3>
            <p className="text-slate-400 text-sm mb-6">
              Get a comprehensive credibility analysis in minutes — free
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <Link href="/try">
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-base px-6 py-5 h-auto"
                >
                  <Zap className="mr-2 w-4 h-4" />
                  Generate Your Free Report
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <a
                href="/reports/Burhanuddin_Comprehensive_Report.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-6 py-5 h-auto border-slate-700 hover:bg-slate-800 gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Full PDF (9 pages)
                </Button>
              </a>
            </div>
          </Card>
        </motion.div>

        {/* Disclaimer */}
        <div className="text-center pb-8">
          <p className="text-slate-600 text-xs">
            This report was generated by CredDev using AI analysis of publicly available data.
            Verify all claims independently before making decisions.
          </p>
        </div>
      </div>
    </div>
  )
}

