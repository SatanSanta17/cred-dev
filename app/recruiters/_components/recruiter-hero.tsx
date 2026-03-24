'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Brand } from '@/components/shared/brand'
import { GradientText } from '@/components/shared/gradient-text'
import { ArrowDown } from 'lucide-react'
import { BackLink } from '@/components/shared/back-link'

export function RecruiterHero() {
  const scrollToWaitlist = () => {
    document.getElementById('recruiter-waitlist')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-page-gradient">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid" />

      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      {/* Top Nav */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <BackLink showBrand />
      </nav>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <Brand size="lg" />
          {/* Coming Soon Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 mt-8"
          >
            <Badge variant="outline" className="px-4 py-2 text-sm badge-cyan">
              Coming Soon for Recruiters
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            Stop guessing.{' '}
            <GradientText>Verify before you hire.</GradientText>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-300 font-light mb-10 max-w-2xl mx-auto px-4"
          >
            AI-powered credibility reports that verify what candidates claim — from their actual code, contributions, and problem-solving history.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <button
              onClick={scrollToWaitlist}
              className="group inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium text-lg"
            >
              Join the Waitlist
              <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-gray-500 mt-2"
            >
              Be first in line when recruiter tools launch.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
