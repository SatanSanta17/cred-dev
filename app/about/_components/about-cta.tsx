'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { GradientText } from '@/components/shared/gradient-text'
import Link from 'next/link'

export function AboutCta() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-black to-slate-900">
      <div className="container mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Join Us on This{' '}
            <GradientText>Journey</GradientText>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Be part of the future of developer verification
          </p>
          <Link href="/chat">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-6 h-auto"
            >
              Generate Your Free Report
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
