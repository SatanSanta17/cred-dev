'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Code2, 
  Trophy, 
  Briefcase, 
  Award,
  TrendingUp,
  CheckCircle2,
  Share2,
  Shield,
  AlertTriangle
} from 'lucide-react';

export default function BurhanuddinReportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Developer Credibility Report
            </h1>
            <p className="text-slate-400">
              Burhanuddin Chitalwala • Generated February 16, 2026
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 text-sm font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Verified Developer
          </Badge>
        </div>

        {/* Main Score Card */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 backdrop-blur-xl mb-8 p-8">
          <div className="text-center">
            <p className="text-slate-400 mb-4">Overall CredDev Score</p>
            <div className="relative inline-block">
              <div className="text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                82
              </div>
              <div className="text-slate-400 text-sm mt-2">out of 100</div>
            </div>
            <p className="text-purple-400 text-xl mt-4 font-semibold">
              Top 18-20% Globally
            </p>
            <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
              Verified full-stack developer with exceptional problem-solving skills. 
              Currently at InMobi (unicorn). Interview-ready with 66-day active streak.
            </p>
          </div>
        </Card>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Problem Solving */}
          <Card className="bg-gradient-to-br from-green-900/20 to-slate-900/50 border-green-500/20 backdrop-blur-xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Code2 className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-green-400 text-sm font-semibold">Top 20%</span>
            </div>
            <h3 className="text-slate-300 font-semibold mb-2">Problem Solving</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-green-400">85</span>
              <span className="text-slate-500">/100</span>
            </div>
            <Progress value={85} className="h-2 bg-slate-800" />
            <p className="text-slate-500 text-sm mt-3">
              554 LeetCode problems • Rank 143,210 (Top 8%)
            </p>
          </Card>

          {/* Engineering Skills */}
          <Card className="bg-gradient-to-br from-blue-900/20 to-slate-900/50 border-blue-500/20 backdrop-blur-xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-blue-400 text-sm font-semibold">Top 30%</span>
            </div>
            <h3 className="text-slate-300 font-semibold mb-2">Engineering</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-blue-400">75</span>
              <span className="text-slate-500">/100</span>
            </div>
            <Progress value={75} className="h-2 bg-slate-800" />
            <p className="text-slate-500 text-sm mt-3">
              Next.js • React • AI/LLM Integration
            </p>
          </Card>

          {/* Consistency */}
          <Card className="bg-gradient-to-br from-pink-900/20 to-slate-900/50 border-pink-500/20 backdrop-blur-xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-pink-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-pink-400" />
              </div>
              <span className="text-pink-400 text-sm font-semibold">Top 17%</span>
            </div>
            <h3 className="text-slate-300 font-semibold mb-2">Consistency</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-pink-400">83</span>
              <span className="text-slate-500">/100</span>
            </div>
            <Progress value={83} className="h-2 bg-slate-800" />
            <p className="text-slate-500 text-sm mt-3">
              Cross-platform verified • 98% Java alignment
            </p>
          </Card>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Trophy className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-slate-400 text-sm">Strong in</span>
            </div>
            <h3 className="text-white font-semibold text-lg">
              Full-Stack & AI
            </h3>
          </Card>

          <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Award className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-slate-400 text-sm">Active in</span>
            </div>
            <h3 className="text-white font-semibold text-lg">
              Unicorn (InMobi)
            </h3>
          </Card>

          <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-slate-400 text-sm">Best fit for</span>
            </div>
            <h3 className="text-white font-semibold text-lg">
              FAANG / SDE-2
            </h3>
          </Card>
        </div>

        {/* Activity Badge */}
        <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30 backdrop-blur-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-xl mb-1">
                  🔥 Currently Very Active
                </h3>
                <p className="text-green-400 text-sm">
                  66-day LeetCode streak • 1,213 submissions in 2025 • Interview-ready NOW
                </p>
              </div>
            </div>
            <Badge className="bg-green-500/10 border-green-500/20 text-green-400 px-4 py-2">
              No DSA Refresh Needed
            </Badge>
          </div>
        </Card>

        {/* Detailed Breakdown */}
        <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-xl p-6 mb-8">
          <h3 className="text-white font-semibold text-xl mb-6">Skill Breakdown</h3>
          
          <div className="space-y-6">
            {/* LeetCode */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">LeetCode Performance</span>
                <span className="text-green-400 font-semibold">8.5/10</span>
              </div>
              <Progress value={85} className="h-2 bg-slate-700" />
              <p className="text-slate-500 text-sm mt-2">
                554 problems • 61.84% acceptance • Rank 143,210 (Top 8%) • 100 Days Badge
              </p>
            </div>

            {/* LinkedIn */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Professional Credibility</span>
                <span className="text-purple-400 font-semibold">8.5/10</span>
              </div>
              <Progress value={85} className="h-2 bg-slate-700" />
              <p className="text-slate-500 text-sm mt-2">
                InMobi (Unicorn) • Stellantis (Global) • VIT University (NIRF #16)
              </p>
            </div>

            {/* Cross-Platform */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Cross-Platform Consistency</span>
                <span className="text-pink-400 font-semibold">8.3/10</span>
              </div>
              <Progress value={83} className="h-2 bg-slate-700" />
              <p className="text-slate-500 text-sm mt-2">
                98% Java consistency • Clean timeline • Under-reports experience (honesty signal)
              </p>
            </div>

            {/* GitHub */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">GitHub Activity</span>
                <span className="text-blue-400 font-semibold">7.5/10</span>
              </div>
              <Progress value={75} className="h-2 bg-slate-700" />
              <p className="text-slate-500 text-sm mt-2">
                40 repositories • MERN+AI project • Pull Shark x2
              </p>
            </div>
          </div>
        </Card>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-xl p-6">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              Key Strengths
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-green-400 mt-0.5">✓</span>
                <span><strong>554 LeetCode problems</strong> (TOP 8% globally, exceptional for 2.5 YOE)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-green-400 mt-0.5">✓</span>
                <span><strong>Currently active:</strong> 66-day streak, interview-ready NOW</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-green-400 mt-0.5">✓</span>
                <span><strong>Unicorn experience:</strong> InMobi ($10B pre-IPO)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-green-400 mt-0.5">✓</span>
                <span><strong>Under-reports experience:</strong> Claims 1.5+, actual 2.5 years (honesty signal)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-green-400 mt-0.5">✓</span>
                <span><strong>Modern stack:</strong> Next.js, React, TypeScript, AI/LLM integration</span>
              </li>
            </ul>
          </Card>

          {/* Areas to Probe */}
          <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-xl p-6">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Interview Focus Areas
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-yellow-400 mt-0.5">→</span>
                <span><strong>Validate $786M revenue claim</strong> (likely business projection, not individual impact)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-yellow-400 mt-0.5">→</span>
                <span><strong>Component architecture:</strong> How 40% velocity boost was measured</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-yellow-400 mt-0.5">→</span>
                <span><strong>System design depth:</strong> 2.5 YOE - assess maturity level</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-yellow-400 mt-0.5">→</span>
                <span><strong>AI/LLM integration:</strong> Hands-on vs usage (GPT-4o, Gemini experience)</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-xl p-6 text-center">
            <p className="text-slate-400 text-sm mb-2">LeetCode Solved</p>
            <p className="text-3xl font-bold text-blue-400">554</p>
            <p className="text-slate-500 text-xs mt-1">Easy: 204 | Med: 296 | Hard: 54</p>
          </Card>

          <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-xl p-6 text-center">
            <p className="text-slate-400 text-sm mb-2">Current Streak</p>
            <p className="text-3xl font-bold text-green-400">66</p>
            <p className="text-slate-500 text-xs mt-1">days (2025 max streak)</p>
          </Card>

          <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-xl p-6 text-center">
            <p className="text-slate-400 text-sm mb-2">Acceptance Rate</p>
            <p className="text-3xl font-bold text-purple-400">61.8%</p>
            <p className="text-slate-500 text-xs mt-1">Above average (60-70%)</p>
          </Card>

          <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-xl p-6 text-center">
            <p className="text-slate-400 text-sm mb-2">Experience</p>
            <p className="text-3xl font-bold text-cyan-400">2.5</p>
            <p className="text-slate-500 text-xs mt-1">years (under-reported as 1.5+)</p>
          </Card>
        </div>

        {/* Hiring Recommendation */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-slate-900/50 border-purple-500/20 backdrop-blur-xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-2xl mb-3">
                Hiring Recommendation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Hire Confidence</p>
                  <p className="text-2xl font-bold text-purple-400">85%</p>
                  <p className="text-slate-500 text-sm">High</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Risk Level</p>
                  <p className="text-2xl font-bold text-green-400">Very Low</p>
                  <p className="text-slate-500 text-sm">3% scam probability</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Best Fit</p>
                  <p className="text-xl font-bold text-blue-400">Full-Stack</p>
                  <p className="text-slate-500 text-sm">SDE-2 / FAANG-tier</p>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-300 text-sm leading-relaxed">
                  <strong className="text-white">Verdict:</strong> High-performing developer with exceptional 
                  LeetCode performance (TOP 8% globally) and legitimate unicorn experience. Currently at InMobi 
                  ($10B pre-IPO). Interview-ready with 66-day active streak. Under-reports experience (1.5+ vs 
                  2.5 years) - rare honesty signal. Resume includes unverifiable metrics (esp. $786M revenue claim) 
                  that require validation in interview.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Key Metrics Disclaimer */}
        <Card className="bg-amber-900/10 border-amber-500/30 backdrop-blur-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-amber-400 font-semibold text-lg mb-2">
                Unverified Claims Requiring Validation
              </h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">⚠️</span>
                  <span><strong>"$786 million projected revenue"</strong> for AI voice assistant (very ambitious, likely business projection)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">⚠️</span>
                  <span>"40% development velocity boost" from Datatable component (unverified)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">⚠️</span>
                  <span>"27% engagement boost" for Echo Show UX (unverified)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">⚠️</span>
                  <span>"5 million users" for Alexa Skills (unverified)</span>
                </li>
              </ul>
              <p className="text-slate-500 text-xs mt-3">
                All metrics marked above cannot be independently verified without company internal data. 
                Probe these claims during interview to understand measurement methodology.
              </p>
            </div>
          </div>
        </Card>

        {/* Company Verification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <h4 className="text-white font-semibold">InMobi</h4>
            </div>
            <p className="text-slate-400 text-sm mb-2">Current (Jul 2025 - Present)</p>
            <p className="text-slate-500 text-xs">
              ✓ Unicorn AdTech • $266M raised • $700M+ revenue • Eyeing $10B IPO
            </p>
          </Card>

          <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <h4 className="text-white font-semibold">Stellantis</h4>
            </div>
            <p className="text-slate-400 text-sm mb-2">Previous (Feb 2024 - Jul 2025)</p>
            <p className="text-slate-500 text-xs">
              ✓ Global Automotive • 14 brands • 4th largest globally
            </p>
          </Card>

          <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <h4 className="text-white font-semibold">ITR Consulting</h4>
            </div>
            <p className="text-slate-400 text-sm mb-2">Intern (Jul 2023 - Jan 2024)</p>
            <p className="text-slate-500 text-xs">
              ✓ Illinois-based IT consulting • Est. 2010
            </p>
          </Card>
        </div>

        {/* Interview Readiness */}
        <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-xl p-6 mb-8">
          <h3 className="text-white font-semibold text-xl mb-4">Interview Readiness by Company Type</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-500/5 rounded-lg border border-green-500/20">
              <div>
                <p className="text-white font-semibold">FAANG / Big Tech</p>
                <p className="text-slate-400 text-sm">Rigorous DSA + System Design rounds</p>
              </div>
              <Badge className="bg-green-500/10 border-green-500/30 text-green-400">
                🟢 READY NOW
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-500/5 rounded-lg border border-green-500/20">
              <div>
                <p className="text-white font-semibold">Unicorns & Pre-IPO</p>
                <p className="text-slate-400 text-sm">Fast-paced product development</p>
              </div>
              <Badge className="bg-green-500/10 border-green-500/30 text-green-400">
                🟢 READY NOW
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-500/5 rounded-lg border border-green-500/20">
              <div>
                <p className="text-white font-semibold">Product Companies</p>
                <p className="text-slate-400 text-sm">Modern web applications</p>
              </div>
              <Badge className="bg-green-500/10 border-green-500/30 text-green-400">
                🟢 READY NOW
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-500/5 rounded-lg border border-green-500/20">
              <div>
                <p className="text-white font-semibold">Startups (SDE-2)</p>
                <p className="text-slate-400 text-sm">Full-stack ownership</p>
              </div>
              <Badge className="bg-green-500/10 border-green-500/30 text-green-400">
                🟢 READY NOW
              </Badge>
            </div>
          </div>

          <p className="text-slate-500 text-xs mt-4 italic">
            Note: No DSA refresh needed. Currently active with 66-day streak and 1,213 submissions in 2025.
          </p>
        </Card>

        {/* Share Button */}
        <div className="flex justify-center">
          <button className="group flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-8 py-4 rounded-lg font-semibold transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105">
            <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Share Your CredDev Profile
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm">
            Report generated by CredDev Analysis Engine v1.0 • Confidence: 95%
          </p>
          <p className="text-slate-600 text-xs mt-2">
            All companies verified via Crunchbase/TechCrunch • Zero fraud indicators detected
          </p>
        </div>
      </div>
    </div>
  );
}
