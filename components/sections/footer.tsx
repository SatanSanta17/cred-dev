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
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 px-4">
              Ready to Build Your{' '}
              <GradientText>Developer Credibility</GradientText>?
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 mb-8 px-4">
              Get your AI-powered credibility report in minutes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/try">
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-6 h-auto"
                >
                  <Zap className="mr-2 w-5 h-5" />
                  Try Now — Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/waitlist">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 h-auto border-gray-700 hover:bg-gray-800"
                >
                  Join Waitlist
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Links */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">
                <GradientText>CredDev</GradientText>
              </h3>
              <p className="text-gray-400 mb-4 max-w-md">
                The credibility layer for developers. Verify skills, build trust, and get discovered.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/try" className="text-gray-400 hover:text-white transition-colors">
                    Try Now
                  </Link>
                </li>
                <li>
                  <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#sample-output" className="text-gray-400 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <Link href="/waitlist" className="text-gray-400 hover:text-white transition-colors">
                    Waitlist
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/about" className="text-gray-400 hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="mailto:cred.dev17@gmail.com" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} CredDev. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
