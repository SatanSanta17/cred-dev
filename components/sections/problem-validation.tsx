'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import { WaitlistCount } from '@/components/shared/waitlist-count'
import Link from 'next/link'

// ============================================================
// QUOTES ARRAY — Edit this to add/replace quotes.
// If more than 3 quotes exist, the component auto-rotates.
// ============================================================
const QUOTES = [
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
  // Add more quotes here — the component auto-rotates if > 3
]

const ROTATION_INTERVAL = 5000 // 5 seconds
const DESKTOP_VISIBLE = 3
const MOBILE_VISIBLE = 1

export function ProblemValidation() {
  const shouldRotate = QUOTES.length > DESKTOP_VISIBLE
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-rotate logic
  useEffect(() => {
    if (!shouldRotate || isPaused) return

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % QUOTES.length)
    }, ROTATION_INTERVAL)

    return () => clearInterval(timer)
  }, [shouldRotate, isPaused])

  // Get visible quotes for desktop (3 at a time, wrapping)
  const getDesktopQuotes = useCallback(() => {
    if (!shouldRotate) return QUOTES.slice(0, DESKTOP_VISIBLE)
    const result = []
    for (let i = 0; i < DESKTOP_VISIBLE; i++) {
      result.push(QUOTES[(activeIndex + i) % QUOTES.length])
    }
    return result
  }, [activeIndex, shouldRotate])

  // Get visible quote for mobile (1 at a time)
  const getMobileQuote = useCallback(() => {
    return QUOTES[activeIndex % QUOTES.length]
  }, [activeIndex])

  // Dot indicators for navigation
  const totalDots = shouldRotate ? QUOTES.length : Math.min(QUOTES.length, DESKTOP_VISIBLE)

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
          <Badge variant="outline" className="mb-4 px-4 py-2 text-sm border-purple-500/50 text-purple-400">
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

        {/* Desktop Quotes (3 visible) */}
        <div
          className="hidden md:block"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-3 gap-6"
            >
              {getDesktopQuotes().map((quote, i) => (
                <QuoteCard key={`${activeIndex}-${i}`} quote={quote} delay={i * 0.1} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Quote (1 visible) */}
        <div
          className="md:hidden"
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <QuoteCard quote={getMobileQuote()} delay={0} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators (only if rotating) */}
        {shouldRotate && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalDots }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeIndex % QUOTES.length
                    ? 'bg-purple-400 w-4'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                aria-label={`Go to quote ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Sample Report Link + Waitlist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center space-y-4"
        >
          <div>
            <p className="text-gray-400 text-sm mb-3">See what a real report looks like</p>
            <Link
              href="/report/Burhanuddin"
              target="_blank"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              View Burhanuddin's CredDev Report
            </Link>
          </div>

          <div className="pt-4">
            <WaitlistCount
              userType="developer"
              showLabel={true}
              className="text-sm text-gray-500"
              hideUntil={10}
              fallbackText=""
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================
// QuoteCard — individual quote display
// ============================================================
function QuoteCard({ quote, delay }: { quote: { text: string; role: string }; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="p-6 h-full bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
        <p className="text-gray-300 leading-relaxed mb-4 text-sm sm:text-base italic">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="text-xs text-gray-500">
          — {quote.role}
        </p>
      </Card>
    </motion.div>
  )
}
