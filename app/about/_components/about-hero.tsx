'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GradientText } from '@/components/shared/gradient-text'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function AboutHero() {
  return (
    <section className="relative py-20 px-6 bg-gradient-to-b from-black via-slate-900 to-black overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-8 hover:bg-slate-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Badge variant="outline" className="mb-4 px-4 py-2 text-sm border-purple-500/50 text-purple-400">
            About Us
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Building the Future of{' '}
            <GradientText>Developer Credibility</GradientText>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We're building a unified, hassle-free ecosystem for developers to showcase their skills and credebility and recruiters can find verified talent and all their skills on a single platform.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
