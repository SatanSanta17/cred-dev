'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Filter, Clock, CheckCircle, BarChart3, Zap, ArrowRight } from 'lucide-react'

const benefits = [
  {
    icon: Search,
    title: "Find Verified Talent",
    description: "Stop guessing. Access developers with verified GitHub, LeetCode, and LinkedIn credentials.",
    stat: "Faster screening",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Filter,
    title: "Filter by Real Skills",
    description: "Search by actual skill scores, not just keywords. Find backend, frontend, or ML engineers easily.",
    stat: "More accurate",
    gradient: "from-cyan-500 to-green-500"
  },
  {
    icon: Clock,
    title: "Reduce Hiring Time",
    description: "No more manual profile checks. Get instant credibility insights on every developer.",
    stat: "Save hours",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: CheckCircle,
    title: "Verified Profiles Only",
    description: "Every CredDev score is backed by real data. No fake resumes, no inflated claims.",
    stat: "100% verified",
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    icon: BarChart3,
    title: "Skill Insights",
    description: "See problem-solving ability, engineering quality, and consistency at a glance.",
    stat: "Deep analytics",
    gradient: "from-teal-500 to-blue-500"
  },
  {
    icon: Zap,
    title: "Faster Shortlisting",
    description: "Instantly identify top candidates with CredDev's ranking system and role-fit analysis.",
    stat: "More efficient",
    gradient: "from-blue-500 to-purple-500"
  }
]

export function ForRecruiters() {
  return (
    <section className="py-20 px-6 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 px-4 py-2 text-sm border-blue-500/50 text-blue-400">
            For Recruiters
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 px-4">
            Hire with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Confidence
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4">
            Stop wasting time on unverified resumes. Find real talent, faster.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 h-full bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all group hover:shadow-xl hover:shadow-blue-500/10 relative overflow-hidden">
                {/* Hover gradient effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                      {benefit.stat}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 transition-all">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">{benefit.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Benefits Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <Card className="p-6 text-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
              Faster
            </div>
            <p className="text-gray-400">Reduce time-to-shortlist</p>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-br from-cyan-500/10 to-green-500/10 border-cyan-500/20">
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400 mb-2">
              Accurate
            </div>
            <p className="text-gray-400">Filter by verified signals</p>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
              Trusted
            </div>
            <p className="text-gray-400">Real skill data</p>
          </Card>
        </motion.div>

        {/* Separate Recruiter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-16 text-center"
        >
          <Card className="inline-block p-6 sm:p-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 mx-4 max-w-lg">
            <p className="text-lg sm:text-xl text-gray-300 mb-3 sm:mb-4 font-semibold">
              Join leading companies using CredDev for hiring
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
              Early access for recruiters • Partnership opportunities available
            </p>
            <Button 
              size="lg"
              onClick={() => {
                const waitlistSection = document.getElementById('waitlist')
                if (waitlistSection) {
                  waitlistSection.scrollIntoView({ behavior: 'smooth' })
                  // Add a small delay to allow smooth scroll, then trigger recruiter selection
                  setTimeout(() => {
                    const recruiterButton = document.querySelector('[data-recruiter-toggle="true"]') as HTMLButtonElement
                    if (recruiterButton && !recruiterButton.classList.contains('bg-cyan-600')) {
                      recruiterButton.click()
                    }
                  }, 800)
                }
              }}
              className="group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto w-full sm:w-auto"
            >
              Request Recruiter Access
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-xs text-gray-500 mt-3 sm:mt-4">
              Limited spots available for early recruiter partners
            </p>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
