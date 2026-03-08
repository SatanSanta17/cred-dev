'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { QuotesCarousel } from '@/components/shared/quotes-carousel'
import type { Quote } from '@/components/shared/quote-card'

// Placeholder quotes — replace with real recruiter/HR conversations
const QUOTES: Quote[] = [
  {
    text: 'I spend more time verifying candidates than actually interviewing them. Half the resumes I see have inflated skills.',
    role: 'Tech Recruiter, Series B Startup',
  },
  {
    text: 'We rejected a great candidate because we couldn\'t verify their open source contributions in time. The process is broken.',
    role: 'Engineering Manager',
  },
  {
    text: 'Every week I get candidates claiming "expert-level" skills that fall apart in the first technical screen. I need a faster filter.',
    role: 'Senior Technical Recruiter',
  },
]

export function RecruiterQuotes() {
  return (
    <section className="py-16 sm:py-20 px-6 bg-black">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <Badge variant="outline" className="mb-4 px-4 py-2 text-sm border-cyan-500/50 text-cyan-400">
            Real Conversations
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">
            The hiring gap is{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">real.</span>
          </h2>
          <p className="text-lg text-gray-400 px-4">
            Recruiters and hiring managers feel it every day.
          </p>
        </motion.div>

        <QuotesCarousel quotes={QUOTES} dotColor="bg-cyan-400" />
      </div>
    </section>
  )
}
