'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { FileX2, Search, ScrollText } from 'lucide-react'

const problems = [
  {
    icon: ScrollText,
    title: "Resumes Don't Prove Real Skills",
    description: "Anyone can write 'Expert in Python' on a resume. But where's the proof? Recruiters can't verify actual coding ability from a PDF.",
    color: "from-red-500 to-orange-500"
  },
  {
    icon: Search,
    title: "Recruiters Struggle to Evaluate",
    description: "Hiring managers waste hours manually checking GitHub profiles, LeetCode stats, and LinkedIn. There's no unified way to assess developer credibility.",
    color: "from-orange-500 to-yellow-500"
  },
  {
    icon: FileX2,
    title: "Skills Are Scattered",
    description: "Your coding skills are spread across GitHub, LeetCode, LinkedIn, and more. No single place shows your complete developer profile.",
    color: "from-yellow-500 to-green-500"
  }
]

export function Problem() {
  return (
    <section className="py-20 px-6 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-black to-black opacity-50" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 px-4">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400">Problem</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4">
            The current hiring process is broken. Skills can't be verified, and talent gets overlooked.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 h-full bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-purple-500/10">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${problem.color} flex items-center justify-center mb-4`}>
                  <problem.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{problem.title}</h3>
                <p className="text-gray-400 leading-relaxed">{problem.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <Card className="inline-block p-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <p className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              CredDev solves this.
            </p>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
