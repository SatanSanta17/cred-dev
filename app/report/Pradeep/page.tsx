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
  Shield
} from 'lucide-react';

export default function SampleReportPage() {
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
              Pradeep N C • Generated February 16, 2026
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
              <div className="text-8xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                75
              </div>
              <div className="text-slate-400 text-sm mt-2">out of 100</div>
            </div>
            <p className="text-cyan-400 text-xl mt-4 font-semibold">
              Top 35-40% Globally
            </p>
            <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
              Verified backend developer with 2 years of fintech experience. 
              Authentic profile with adequate DSA foundation.
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
              <span className="text-green-400 text-sm font-semibold">Top 40%</span>
            </div>
            <h3 className="text-slate-300 font-semibold mb-2">Problem Solving</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-green-400">68</span>
              <span className="text-slate-500">/100</span>
            </div>
            <Progress value={68} className="h-2 bg-slate-800" />
            <p className="text-slate-500 text-sm mt-3">
              201 LeetCode problems solved
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
              <span className="text-4xl font-bold text-blue-400">70</span>
              <span className="text-slate-500">/100</span>
            </div>
            <Progress value={70} className="h-2 bg-slate-800" />
            <p className="text-slate-500 text-sm mt-3">
              Java/Spring Boot focus
            </p>
          </Card>

          {/* Consistency */}
          <Card className="bg-gradient-to-br from-pink-900/20 to-slate-900/50 border-pink-500/20 backdrop-blur-xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-pink-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-pink-400" />
              </div>
              <span className="text-pink-400 text-sm font-semibold">Top 18%</span>
            </div>
            <h3 className="text-slate-300 font-semibold mb-2">Consistency</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-pink-400">82</span>
              <span className="text-slate-500">/100</span>
            </div>
            <Progress value={82} className="h-2 bg-slate-800" />
            <p className="text-slate-500 text-sm mt-3">
              Cross-platform verified
            </p>
          </Card>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Trophy className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-slate-400 text-sm">Strong in</span>
            </div>
            <h3 className="text-white font-semibold text-lg">
              Fintech Domain
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
              Backend Development
            </h3>
          </Card>

          <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-slate-400 text-sm">Best fit for</span>
            </div>
            <h3 className="text-white font-semibold text-lg">
              SDE-1 to SDE-2
            </h3>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-xl p-6 mb-8">
          <h3 className="text-white font-semibold text-xl mb-6">Skill Breakdown</h3>
          
          <div className="space-y-6">
            {/* GitHub */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">GitHub Activity</span>
                <span className="text-blue-400 font-semibold">7.0/10</span>
              </div>
              <Progress value={70} className="h-2 bg-slate-700" />
              <p className="text-slate-500 text-sm mt-2">
                30 repositories • Java focused • Consistent activity
              </p>
            </div>

            {/* LeetCode */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">LeetCode Performance</span>
                <span className="text-green-400 font-semibold">6.8/10</span>
              </div>
              <Progress value={68} className="h-2 bg-slate-700" />
              <p className="text-slate-500 text-sm mt-2">
                201 problems • 100 Days Badge • Rank 728,765 (Top 8%)
              </p>
            </div>

            {/* LinkedIn */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Professional Credibility</span>
                <span className="text-purple-400 font-semibold">8.0/10</span>
              </div>
              <Progress value={80} className="h-2 bg-slate-700" />
              <p className="text-slate-500 text-sm mt-2">
                3 verified companies • Clean timeline • Fintech experience
              </p>
            </div>

            {/* Cross-Platform */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Cross-Platform Consistency</span>
                <span className="text-pink-400 font-semibold">8.2/10</span>
              </div>
              <Progress value={82} className="h-2 bg-slate-700" />
              <p className="text-slate-500 text-sm mt-2">
                87.5% Java consistency • Timeline verified • No red flags
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
                <span>Authentic profile (verified across 4 platforms)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>2 years fintech experience (KYC, e-sign, NBFC APIs)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Perfect Java alignment (87.5% across all platforms)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Series A startup experience (Vidyutttech)</span>
              </li>
            </ul>
          </Card>

          {/* Areas to Probe */}
          <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-xl p-6">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              Interview Focus Areas
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-yellow-400 mt-0.5">→</span>
                <span>System design (claims not demonstrated publicly)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-yellow-400 mt-0.5">→</span>
                <span>DSA skills (93% activity drop, needs 2-4 week refresh)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-yellow-400 mt-0.5">→</span>
                <span>Resume metrics validation (70%, 80% claims unverified)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-yellow-400 mt-0.5">→</span>
                <span>Code quality practices (no public showcase)</span>
              </li>
            </ul>
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
                  <p className="text-2xl font-bold text-purple-400">75%</p>
                  <p className="text-slate-500 text-sm">Medium-High</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Risk Level</p>
                  <p className="text-2xl font-bold text-green-400">Low</p>
                  <p className="text-slate-500 text-sm">5% scam probability</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Best Fit</p>
                  <p className="text-xl font-bold text-blue-400">Backend</p>
                  <p className="text-slate-500 text-sm">SDE-1 to SDE-2</p>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-300 text-sm leading-relaxed">
                  <strong className="text-white">Verdict:</strong> Authentic developer with real fintech experience. 
                  Best for startups/mid-size companies needing backend engineers who can contribute from day 1. 
                  Not suitable for FAANG-tier without 2-3 months DSA prep.
                </p>
              </div>
            </div>
          </div>
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
            Report generated by CredDev Analysis Engine v1.0
          </p>
          <p className="text-slate-600 text-xs mt-2">
            This is a sample report for demonstration purposes
          </p>
        </div>
      </div>
    </div>
  );
}
