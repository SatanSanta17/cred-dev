'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GradientText } from '@/components/shared/gradient-text'
import { Search, UserCheck, Shield, FileText } from 'lucide-react'

const VISION_CARDS = [
  {
    icon: FileText,
    title: 'Request a Candidate Report',
    description: 'Paste a candidate\'s GitHub, LeetCode, or LinkedIn profile. Get a verified credibility report — skills cross-checked against real code, not resume claims.',
    features: ['Verified vs. unverified skill tags', 'Risk flags from real data', 'Production signal analysis'],
  },
  {
    icon: Search,
    title: 'Browse Verified Developers',
    description: 'Search a directory of developers who have generated their CredDev reports and opted in to be discovered. Filter by skills, experience, and verification level.',
    features: ['Pre-verified skill profiles', 'Real contribution data', 'Direct outreach'],
  },
]

export function ProductVision() {
  return (
    <section className="py-16 sm:py-20 px-6 bg-gradient-to-b from-black to-slate-900 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 px-4 py-2 text-sm border-cyan-500/50 text-cyan-400">
            What You'll Get
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">
            Hiring decisions backed by{' '}
            <GradientText>real signals.</GradientText>
          </h2>
          <p className="text-lg text-gray-400 px-4 max-w-2xl mx-auto">
            No more guessing from resumes. CredDev verifies what candidates actually know — from their code.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {VISION_CARDS.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Card className="p-6 bg-slate-900/80 backdrop-blur-sm border-slate-800 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <card.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold">{card.title}</h3>
                </div>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  {card.description}
                </p>
                <ul className="space-y-2">
                  {card.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-500">
                      <Shield className="w-3.5 h-3.5 text-cyan-500/60" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
