'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Users, Heart } from 'lucide-react'

export function FounderNote() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-slate-900 to-black">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Users className="w-6 h-6 text-purple-400" />
            <Heart className="w-5 h-5 text-pink-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Developers
            </span>
            , For{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Both Sides
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-8 md:p-12 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="relative z-10 space-y-4 text-gray-300 text-lg leading-relaxed">
              <p>
                We're building CredDev as a collaboration between a software developer and an HR professional who have both experienced the hiring gap firsthand.
              </p>

              <p>
                From the developer side, it's frustrating when real skills are hard to showcase beyond resumes and scattered profiles across platforms like GitHub, coding sites, and professional networks. From the recruiter side, it's just as difficult to reliably identify strong talent when these signals are fragmented and spread across the internet, with no single, trustworthy view of a candidate.
              </p>

              <p className="font-medium text-white">
                We realized this isn't a one-sided problem — it's a disconnect.
              </p>

              <p>
                Developers and recruiters ultimately want the same thing: clarity, trust, and the ability to recognize real potential. Yet the current system keeps them apart, with skills scattered, visibility limited, and evaluation often reduced to incomplete signals like resumes or past credentials.
              </p>

              <p>
                CredDev is our attempt to bring them closer — to create a shared layer of credibility where skills from across platforms come together, signals become trustworthy, and hiring becomes more human and evidence-driven.
              </p>

              <p className="text-purple-300 font-semibold italic pt-4">
                — Built by a developer and a recruiter, for both sides of the table.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
