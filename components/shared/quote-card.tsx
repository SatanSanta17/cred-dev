'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

export interface Quote {
  text: string
  role: string
}

interface QuoteCardProps {
  quote: Quote
  delay?: number
}

export function QuoteCard({ quote, delay = 0 }: QuoteCardProps) {
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
