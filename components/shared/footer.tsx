'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { GradientText } from '@/components/shared/gradient-text'
import { Mail, ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black border-t border-slate-800">
      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 px-4">
              Ready to verify your{' '}
              <GradientText>credibility</GradientText>?
            </h2>
            <p className="text-lg text-gray-400 mb-8 px-4">
              Get your AI-powered credibility report in minutes
            </p>
            <Link href="/chat">
              <Button
                size="lg"
                className="group bg-cta-gradient text-lg px-8 py-6 h-auto"
              >
                <Zap className="mr-2 w-5 h-5" />
                Generate Your Free Report
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} <GradientText>CredDev</GradientText>. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/recruiters"
              className="text-gray-500 hover:text-cyan-400 transition-colors text-sm"
            >
              For Recruiters
            </Link>
            <a
              href="mailto:cred.dev17@gmail.com"
              className="text-gray-500 hover:text-gray-300 transition-colors text-sm flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              cred.dev17@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
