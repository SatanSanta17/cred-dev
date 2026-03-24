'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link2, Brain, Mail } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Link2,
    title: 'Submit Your Profiles',
    description: 'Enter your GitHub username, LeetCode handle, and upload your resume.',
    gradient: 'from-purple-500 to-blue-500',
  },
  {
    number: '02',
    icon: Brain,
    title: 'We Analyze Real Signals',
    description: 'Your repos, problem-solving patterns, and resume claims — verified by AI.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    number: '03',
    icon: Mail,
    title: 'Get 3 Detailed Reports',
    description: 'Extensive, developer, and recruiter reports — emailed to you, free.',
    gradient: 'from-cyan-500 to-green-500',
  },
]

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-20 px-6 bg-gradient-to-b from-black via-slate-900/50 to-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 px-4 py-2 text-sm badge-blue">
            Simple Process
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">It Works</span>
          </h2>
        </motion.div>

        {/* Desktop: horizontal 3-column grid / Mobile: vertical stack */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <Card className="p-6 h-full bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${step.gradient} flex items-center justify-center flex-shrink-0`}>
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-mono text-gray-500">{step.number}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </Card>

              {/* Connecting arrow (desktop only, not on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <div className="w-6 h-0.5 bg-gradient-to-r from-slate-700 to-slate-600" />
                </div>
              )}

              {/* Connecting line (mobile only, not on last item) */}
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center py-2">
                  <div className="w-0.5 h-4 bg-gradient-to-b from-slate-700 to-slate-600" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
