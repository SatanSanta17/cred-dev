'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ReactNode } from 'react'

export function FloatingCard({ 
  children, 
  delay = 0 
}: { 
  children: ReactNode
  delay?: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="p-6 glass border-slate-700/50 hover:border-purple-500/50 transition-colors">
        {children}
      </Card>
    </motion.div>
  )
}