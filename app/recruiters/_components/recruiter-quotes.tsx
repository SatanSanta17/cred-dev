'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Placeholder quotes — replace with real recruiter/HR conversations
const QUOTES = [
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

const ROTATION_INTERVAL = 5000
const DESKTOP_VISIBLE = 3
const MOBILE_VISIBLE = 1

function QuoteCard({ quote, delay = 0 }: { quote: typeof QUOTES[0]; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="p-6 bg-slate-900/60 border-slate-800 h-full">
        <p className="text-gray-300 italic leading-relaxed mb-4">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="text-sm text-gray-500 font-mono">
          — {quote.role}
        </p>
      </Card>
    </motion.div>
  )
}

export function RecruiterQuotes() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const shouldRotate = QUOTES.length > DESKTOP_VISIBLE

  const advance = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % QUOTES.length)
  }, [])

  useEffect(() => {
    if (!shouldRotate || isPaused) return
    const timer = setInterval(advance, ROTATION_INTERVAL)
    return () => clearInterval(timer)
  }, [shouldRotate, isPaused, advance])

  const getDesktopQuotes = () => {
    const result = []
    for (let i = 0; i < DESKTOP_VISIBLE; i++) {
      result.push(QUOTES[(activeIndex + i) % QUOTES.length])
    }
    return result
  }

  const mobileQuote = QUOTES[activeIndex % QUOTES.length]
  const totalDots = Math.min(QUOTES.length, shouldRotate ? QUOTES.length : 0)

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

        {/* Desktop Quotes */}
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

        {/* Mobile Quote */}
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
              <QuoteCard quote={mobileQuote} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot Indicators */}
        {shouldRotate && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalDots }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeIndex % QUOTES.length
                    ? 'bg-cyan-400 w-4'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                aria-label={`Go to quote ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
