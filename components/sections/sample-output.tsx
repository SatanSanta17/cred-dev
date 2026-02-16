'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Share2, TrendingUp, Award, Github, Code2, Target, ExternalLink } from 'lucide-react'
import CountUp from 'react-countup'
import Link from 'next/link'

const sampleScores = [
  { label: "Problem Solving", value: 88, percentile: 12, icon: Code2, color: "from-green-400 to-emerald-600" },
  { label: "Engineering", value: 82, percentile: 20, icon: Github, color: "from-blue-400 to-cyan-600" },
  { label: "Consistency", value: 92, percentile: 8, icon: TrendingUp, color: "from-purple-400 to-pink-600" },
]

const insights = [
  { label: "Strong in", value: "Algorithms & Data Structures", icon: "🎯" },
  { label: "Active in", value: "Open Source Contributions", icon: "🚀" },
  { label: "Best fit for", value: "Backend Engineering", icon: "💼" },
]

export function SampleOutput() {
  return (
    <section id="sample-output" className="py-20 px-6 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 px-4 py-2 text-sm border-purple-500/50 text-purple-400">
            Sample Report
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 px-4">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">CredDev Score</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4 mb-6">
            Get a detailed credibility report that showcases your real skills
          </p>
          <Link href="/report/Burhanuddin" target="_blank">
            <Button 
              size="lg" 
              variant="outline"
              className="border-purple-500/50 hover:bg-purple-500/10 text-purple-400 hover:text-purple-300 transition-all gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Real Sample Report
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-3">
            See founder Burhanuddin's actual CredDev report
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Main Dashboard Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8 bg-gradient-to-br from-slate-900 to-slate-900/50 border-slate-800 overflow-hidden relative">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
              </div>

              <div className="relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Developer Credibility Report</h3>
                    <p className="text-gray-400">Sample Profile • Generated Today</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 px-4 py-2 text-base">
                      <Award className="w-4 h-4 mr-2" />
                      Verified Developer
                    </Badge>
                  </div>
                </div>

                {/* Overall Score */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mb-12 text-center"
                >
                  <div className="inline-block p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                    <p className="text-sm sm:text-base text-gray-400 mb-2">Overall CredDev Score</p>
                    <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                      <CountUp end={87} duration={2} />
                    </div>
                    <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mt-2">Top 15% Globally</p>
                  </div>
                </motion.div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                  {sampleScores.map((score, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                    >
                      <Card className="p-6 bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${score.color} flex items-center justify-center`}>
                            <score.icon className="w-5 h-5 text-white" />
                          </div>
                          <Badge variant="outline" className="border-green-500/30 text-green-400">
                            Top {score.percentile}%
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{score.label}</p>
                        <div className="flex items-baseline gap-2">
                          <div className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${score.color}`}>
                            <CountUp end={score.value} duration={2} />
                          </div>
                          <span className="text-gray-500">/100</span>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${score.value}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                            className={`h-full bg-gradient-to-r ${score.color}`}
                          />
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 + 0.6 }}
                    >
                      <Card className="p-4 bg-slate-800/30 border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{insight.icon}</span>
                          <div>
                            <p className="text-xs text-gray-500">{insight.label}</p>
                            <p className="text-sm font-semibold text-gray-200">{insight.value}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* View Full Report Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="flex justify-center gap-4"
                >
                  <Link href="/report/Burhanuddin" target="_blank">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Full Sample Report
                    </Button>
                  </Link>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-slate-700 hover:bg-slate-800 gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Profile
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* Shareable Card Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 max-w-md mx-auto"
          >
            <p className="text-center text-sm text-gray-500 mb-4">Shareable LinkedIn Card</p>
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20 text-center">
              <Award className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <h4 className="text-xl font-bold mb-2">CredDev Verified Developer</h4>
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2">
                Top 15%
              </p>
              <p className="text-sm text-gray-400">Problem Solving • Engineering • Consistency</p>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
