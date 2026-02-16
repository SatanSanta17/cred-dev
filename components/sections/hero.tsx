'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Github, Code2, Award, ExternalLink } from 'lucide-react'
import { GradientText } from '@/components/shared/gradient-text'
import { FloatingCard } from '@/components/shared/floating-card'
import { WaitlistCount } from '@/components/shared/waitlist-count'
import Link from 'next/link'

export function Hero() {
  const CREDDEV_METRICS = [
    {
      id: 'problem-solving',
      icon: Code2,
      iconColor: 'text-green-400',
      label: 'Problem Solving',
      // rank: 'Top 12%',
      gradientFrom: 'from-green-400',
      gradientTo: 'to-emerald-600',
      source: 'LeetCode Analysis',
      delay: 0.9
    },
    {
      id: 'engineering',
      icon: Github,
      iconColor: 'text-blue-400',
      label: 'Engineering',
      // rank: 'Top 20%',
      gradientFrom: 'from-blue-400',
      gradientTo: 'to-cyan-600',
      source: 'GitHub Contributions',
      delay: 1.0
    },
    {
      id: 'consistency',
      icon: Award,
      iconColor: 'text-purple-400',
      label: 'Consistency',
      // rank: 'Top 8%',
      gradientFrom: 'from-purple-400',
      gradientTo: 'to-pink-600',
      source: 'Activity Score',
      delay: 1.1
    }
  ]
  const scrollToWaitlist = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-slate-900 to-black">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Beta Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm mb-8"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Coming Soon - Join the Waitlist</span>
          </motion.div>

          {/* Waitlist Count - Only show when 100+ signups */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="text-center mb-6"
          >
            <WaitlistCount 
              className="text-purple-300 text-sm" 
              showLabel={true}
              userType="all"
              hideUntil={100}
            />
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            <GradientText>CredDev</GradientText>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl sm:text-2xl md:text-3xl text-gray-300 font-light mb-4 px-4"
          >
            The credibility layer for developers
          </motion.p>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto px-4"
          >
            Verify skills. Build trust. Get discovered.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center gap-4 mb-20"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={scrollToWaitlist}
                className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-6 h-auto"
              >
                Join Waitlist
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link href="/report/Burhanuddin" target="_blank">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6 h-auto border-gray-700 hover:bg-gray-800 gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Sample Report
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              First 500 developers get early access • See a real example report
            </p>
          </motion.div>

          {/* Floating Cards Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-4 mb-8"
          >
            {CREDDEV_METRICS.map((metric) => {
              const Icon = metric.icon
              return (
                <FloatingCard key={metric.id} delay={metric.delay}>
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`w-5 h-5 ${metric.iconColor}`} />
                      <div className="text-sm text-gray-400">{metric.label}</div>
                    </div>
                    {/* <div className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${metric.gradientFrom} ${metric.gradientTo}`}>
                      {metric.rank}
                    </div> */}
                    <div className="text-xs text-gray-500 mt-2">{metric.source}</div>
                  </div>
                </FloatingCard>
              )
            })}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <span className="text-sm">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight className="w-5 h-5 rotate-90" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
