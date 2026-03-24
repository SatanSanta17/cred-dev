'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { QuotesCarousel } from '@/components/shared/quotes-carousel'
import type { Quote } from '@/components/shared/quote-card'

// ============================================================
// QUOTES ARRAY — Edit this to add/replace quotes.
// Mobile always auto-rotates (1 visible). Desktop auto-rotates if > 3.
// ============================================================
const QUOTES: Quote[] = [
  {
    text: 'I spend more time verifying candidates than actually interviewing them. There has to be a better way.',
    role: 'Tech Recruiter, Series B startup',
  },
  {
    text: 'My GitHub has 4 years of work but no recruiter has ever looked at it. They just scan my resume.',
    role: 'Senior Backend Engineer',
  },
  {
    text: 'We rejected a great candidate because their resume looked weak. Turns out their open source work was incredible.',
    role: 'Hiring Manager',
  },
  // Add more quotes here — desktop auto-rotates if > 3, mobile always rotates
]

export function ProblemValidation() {
  return (
    <section className="py-16 sm:py-20 px-6 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10 max-w-5xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 px-4 py-2 text-sm badge-purple">
            Real Conversations
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">
            The problem is{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">real.</span>
          </h2>
          <p className="text-lg text-gray-400 px-4">
            Developers and recruiters agree.
          </p>
        </motion.div>

        <QuotesCarousel quotes={QUOTES} dotColor="bg-purple-400" />

        {/* Sample Report Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 text-sm mb-3">See what a real report looks like</p>
          <Link
            href="/report/Burhanuddin"
            target="_blank"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            View Burhanuddin's CredDev Report
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
