'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

export function OriginStory() {
  return (
    <section className="py-20 px-6 bg-black">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Origin Story</span>
          </h2>

          <Card className="p-8 bg-slate-900/50 border-slate-800">
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                After spending years trying to break into a top product company, I did everything I was supposed to do — solved problems on LeetCode, built real projects, stayed active on GitHub, and maintained a strong professional presence online. Yet interviews never came.

                At first, I questioned my skills. Later, I realized the problem wasn't effort or ability — it was visibility.

                Recruiters are overwhelmed, reviewing thousands of applications with limited time. They can't realistically verify every GitHub profile, coding platform, and project. As a result, hiring decisions often fall back on resumes, college names, past companies, and signals that are incomplete — and sometimes even exaggerated.

                That's when it became clear: the issue wasn't just on the developer side or the recruiter side. It was the gap between them.

                Developers keep working hard to build real skills. Recruiters are trying to find strong candidates quickly. But there's no single place where true capability is visible, verified, and easy to evaluate.

                CredDev was born to bridge that gap.

                Developers focus on growing and proving their skills — we make sure that work translates into a credible, unified signal recruiters can trust. Not just to help you get shortlisted, but to present your real ability clearly and fairly.

                CredDev is your skill identity — built on proof, not claims.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
