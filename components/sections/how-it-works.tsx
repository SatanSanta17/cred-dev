'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Link2, Brain, Award } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const steps = [
  {
    number: "01",
    icon: Link2,
    title: "Connect Your Profiles",
    description: "Link your GitHub, LeetCode, and LinkedIn accounts. It takes less than 2 minutes.",
    features: ["One-click OAuth", "Secure connection", "No data stored locally"],
    gradient: "from-purple-500 to-blue-500"
  },
  {
    number: "02",
    icon: Brain,
    title: "We Analyze Real Signals",
    description: "CredDev's engine analyzes your actual coding patterns, problem-solving ability, and consistency.",
    features: ["GitHub contributions", "LeetCode performance", "Consistency metrics"],
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    number: "03",
    icon: Award,
    title: "Get Your CredDev Score",
    description: "Receive a unified credibility score and detailed report you can share with anyone.",
    features: ["Shareable profile", "Top X% rankings", "Role fit analysis"],
    gradient: "from-cyan-500 to-green-500"
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-gradient-to-b from-black via-slate-900 to-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 px-4 py-2 text-sm border-blue-500/50 text-blue-400">
            Simple Process
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 px-4">
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">It Works</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4">
            Three simple steps to verify your developer credibility
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-8 bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all overflow-hidden relative group">
                {/* Hover gradient effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${step.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                  {/* Step number and icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-4`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-slate-700 to-slate-800">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-gray-400 text-lg mb-4">{step.description}</p>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {step.features.map((feature, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="border-slate-700 text-gray-300"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Connecting line (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -bottom-8 left-8 w-0.5 h-16 bg-gradient-to-b from-slate-700 to-transparent" />
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-500 text-sm">
            All data is processed securely and never shared without your permission
          </p>
        </motion.div>
      </div>
    </section>
  )
}
