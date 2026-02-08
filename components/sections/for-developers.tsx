'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code2, TrendingUp, Users, Target, Award, Sparkles } from 'lucide-react'
import { WaitlistCount } from '@/components/shared/waitlist-count'

const benefits = [
  {
    icon: Code2,
    title: "Prove Real Skills",
    description: "Stop relying on resumes. Let your actual code and problem-solving speak for you.",
    gradient: "from-purple-500 to-blue-500"
  },
  {
    icon: Award,
    title: "Stand Out Globally",
    description: "Get verified rankings that show exactly where you stand among developers worldwide.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: TrendingUp,
    title: "Track Your Growth",
    description: "See your credibility score improve as you code more, solve problems, and contribute.",
    gradient: "from-cyan-500 to-green-500"
  },
  {
    icon: Target,
    title: "Get Role-Fit Analysis",
    description: "Understand which roles match your skills best - frontend, backend, ML, or full-stack.",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Users,
    title: "Share Your Profile",
    description: "One-click shareable CredDev profile for LinkedIn, resume, or job applications.",
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    icon: Sparkles,
    title: "Get Discovered",
    description: "Top recruiters will find verified developers. Higher credibility = better opportunities.",
    gradient: "from-teal-500 to-blue-500"
  }
]

export function ForDevelopers() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-black via-slate-900/50 to-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
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
            For Developers
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 px-4">
            Built by Developers,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              For Developers
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4">
            Finally, a way to showcase your real skills beyond the resume
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
              <Card className="p-6 h-full bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all group hover:shadow-xl hover:shadow-purple-500/10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 transition-all">
                  {benefit.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{benefit.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 text-center"
        >
          <Card className="inline-block p-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <p className="text-xl text-gray-300 mb-2">
              <WaitlistCount 
                userType="developer"
                showLabel={true}
                className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400"
                hideUntil={100}
                fallbackText="Join the large community of developers on the waitlist"
              />
            </p>
            <p className="text-gray-500 text-sm">Be verified. Be discovered. Be ahead.</p>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
