'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QuoteCard } from '@/components/shared/quote-card'
import type { Quote } from '@/components/shared/quote-card'

const ROTATION_INTERVAL = 5000
const DESKTOP_VISIBLE = 3
const MOBILE_VISIBLE = 1

interface QuotesCarouselProps {
  quotes: Quote[]
  /** Tailwind color class for active dot (e.g. 'bg-purple-400') */
  dotColor?: string
}

export function QuotesCarousel({ quotes, dotColor = 'bg-purple-400' }: QuotesCarouselProps) {
  const shouldRotateDesktop = quotes.length > DESKTOP_VISIBLE
  const shouldRotateMobile = quotes.length > MOBILE_VISIBLE
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const advance = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % quotes.length)
  }, [quotes.length])

  // Auto-rotate — runs whenever mobile needs it (desktop rotation is a subset)
  useEffect(() => {
    if (!shouldRotateMobile || isPaused) return
    const timer = setInterval(advance, ROTATION_INTERVAL)
    return () => clearInterval(timer)
  }, [shouldRotateMobile, isPaused, advance])

  const getDesktopQuotes = useCallback(() => {
    if (!shouldRotateDesktop) return quotes.slice(0, DESKTOP_VISIBLE)
    const result = []
    for (let i = 0; i < DESKTOP_VISIBLE; i++) {
      result.push(quotes[(activeIndex + i) % quotes.length])
    }
    return result
  }, [activeIndex, shouldRotateDesktop, quotes])

  const mobileQuote = quotes[activeIndex % quotes.length]

  return (
    <>
      {/* Desktop — 3-column grid */}
      <div
        className="hidden md:block"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={shouldRotateDesktop ? activeIndex : 'static'}
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

      {/* Mobile — single card */}
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

      {/* Dot indicators — always on mobile, desktop only if > 3 quotes */}
      {shouldRotateMobile && (
        <div className={`justify-center gap-3 mt-8 ${shouldRotateDesktop ? 'flex' : 'flex md:hidden'}`}>
          {Array.from({ length: quotes.length }).map((_, i) => (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => setActiveIndex(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveIndex(i) }}
              className={`h-1 rounded-full cursor-pointer transition-all duration-300 ${
                i === activeIndex % quotes.length
                  ? `${dotColor} w-6`
                  : 'bg-slate-700 w-3 hover:bg-slate-600'
              }`}
              aria-label={`Go to quote ${i + 1}`}
            />
          ))}
        </div>
      )}
    </>
  )
}
