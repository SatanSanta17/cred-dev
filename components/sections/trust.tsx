'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function Trust() {
  const trustPoints = [
    {
      icon: Shield,
      title: 'Never Post Without Permission',
      description: 'We never post to GitHub or any platform without your explicit consent',
    },
    {
      icon: Lock,
      title: 'Private by Default',
      description: 'Your connections and data are private. You control visibility',
    },
    {
      icon: Eye,
      title: 'You Control What Recruiters See',
      description: 'Choose exactly what information to share and with whom',
    },
    {
      icon: Trash2,
      title: 'Delete Anytime',
      description: 'Your data, your choice. Remove your information whenever you want',
    },
  ]

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-black to-slate-900">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Your Data,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              Your Control
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Built with privacy and trust at the core. Your credibility data is yours alone.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {trustPoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20 hover:border-green-500/40 transition-all duration-300 h-full">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <point.icon className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-white">
                      {point.title}
                    </h3>
                    <p className="text-gray-400">
                      {point.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Trust Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Card className="inline-block px-8 py-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
            <p className="text-green-300 font-medium">
              🔒 We do not post anything without your permission
            </p>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
