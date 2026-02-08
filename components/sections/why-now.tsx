'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Bot, Zap, Award } from 'lucide-react'

export function WhyNow() {
  const shifts = [
    {
      icon: Bot,
      title: 'AI is Changing Hiring',
      description: 'Companies are using AI to screen candidates. Traditional resumes no longer cut through the noise.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Award,
      title: 'Skills > Credentials',
      description: 'Degrees and certifications are being replaced by proven, real-world skill demonstrations.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: TrendingUp,
      title: 'GitHub Matters More',
      description: 'Your contributions, code quality, and consistency now speak louder than any resume.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Zap,
      title: 'Identity Layer Needed',
      description: 'Developers need a unified, verified skill identity for the new world of work.',
      gradient: 'from-orange-500 to-red-500',
    },
  ]

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-slate-900 via-black to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 px-4 py-2 text-sm border-orange-500/50 text-orange-400">
            The Shift is Happening
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Why{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-pink-400">
              Now?
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-4">
            The way developers are hired is fundamentally changing.
            Traditional resumes weren't built for this new world.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {shifts.map((shift, index) => (
            <motion.div
              key={shift.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-4 sm:p-6 bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 h-full group hover:shadow-lg hover:shadow-purple-500/10">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${shift.gradient} bg-opacity-10 group-hover:scale-110 transition-transform flex-shrink-0`}>
                    <shift.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">
                      {shift.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                      {shift.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Key message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Card className="inline-block px-6 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-purple-500/20 mx-4">
            <p className="text-base sm:text-lg md:text-xl text-gray-200 font-medium">
              The future of hiring is skill-based, verified, and transparent.
            </p>
            <p className="text-sm sm:text-base text-purple-300 mt-2">
              CredDev is building that future.
            </p>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
