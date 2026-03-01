'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ProgressData } from '@/lib/use-generation-progress'

interface GenerationLoaderProps {
  progress: ProgressData | null
  candidateName: string
}

export function GenerationLoader({ progress, candidateName }: GenerationLoaderProps) {
  const [showPulse, setShowPulse] = useState(true)
  const percentage = progress?.percentage ?? 5
  const message = progress?.message ?? 'Initializing analysis pipeline...'

  // Subtle pulse animation toggle
  useEffect(() => {
    const interval = setInterval(() => setShowPulse((p) => !p), 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-cyan-500/30 blur-lg opacity-60 animate-pulse" />

        <div className="relative rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-white/10 p-8 sm:p-12 overflow-hidden">
          {/* Background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-purple-400/30"
                initial={{
                  x: Math.random() * 400,
                  y: Math.random() * 400,
                }}
                animate={{
                  x: [Math.random() * 400, Math.random() * 400, Math.random() * 400],
                  y: [Math.random() * 400, Math.random() * 400, Math.random() * 400],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}
          </div>

          {/* Orbital animation */}
          <div className="relative flex items-center justify-center mb-10">
            <div className="relative w-36 h-36">
              {/* Outer ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-purple-500/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
              </motion.div>

              {/* Middle ring */}
              <motion.div
                className="absolute inset-4 rounded-full border-2 border-blue-500/20"
                animate={{ rotate: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
              </motion.div>

              {/* Inner ring */}
              <motion.div
                className="absolute inset-8 rounded-full border-2 border-cyan-500/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
              </motion.div>

              {/* Center percentage */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  key={percentage}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    {percentage}%
                  </span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative mb-6">
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Stage message */}
          <div className="text-center p-2 mb-6 min-h-[3rem]">
            <AnimatePresence mode="wait">
              <motion.p
                key={message}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-gray-300 text-sm sm:text-base"
              >
                {message}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Candidate info */}
          <div className="text-center">
            <p className="text-gray-500 text-xs">
              Generating report for{' '}
              <span className="text-purple-400 font-medium">{candidateName}</span>
            </p>
          </div>

          {/* Estimated time */}
          {percentage < 90 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showPulse ? 0.7 : 0.4 }}
              className="text-center mt-4"
            >
              <p className="text-gray-600 text-xs">
                This typically takes 3-5 minutes
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
