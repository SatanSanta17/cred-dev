'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GradientText } from '@/components/shared/gradient-text'
import { ArrowLeft, Users, Target, Lightbulb, Heart, Rocket, Award } from 'lucide-react'
import Link from 'next/link'

// This component is client-side only due to animations
// SEO metadata is in layout.tsx

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
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
              {/* TODO: Add your mission statement here */}
              [Your mission statement - e.g., "We're on a mission to create a transparent, verified ecosystem where developers can prove their skills and recruiters can find real talent."]
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-6 bg-black">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Story</span>
            </h2>
            
            <Card className="p-8 bg-slate-900/50 border-slate-800">
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  {/* TODO: Add your origin story */}
                  [Share how CredDev started - e.g., "CredDev was born from a simple observation: the hiring process for developers is broken..."]
                </p>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  {/* TODO: Add more context */}
                  [Explain the problem you saw and why you decided to solve it...]
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {/* TODO: Add your vision */}
                  [Describe your vision for the future...]
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-slate-900">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Our Mission & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Values</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              {/* TODO: Add subtitle */}
              [What drives us every day]
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Value 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="p-6 h-full bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Transparency</h3>
                <p className="text-gray-400">
                  {/* TODO: Add value description */}
                  [Describe how you value transparency...]
                </p>
              </Card>
            </motion.div>

            {/* Value 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-6 h-full bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Innovation</h3>
                <p className="text-gray-400">
                  {/* TODO: Add value description */}
                  [Describe your commitment to innovation...]
                </p>
              </Card>
            </motion.div>

            {/* Value 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-6 h-full bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Developer-First</h3>
                <p className="text-gray-400">
                  {/* TODO: Add value description */}
                  [Explain your developer-first approach...]
                </p>
              </Card>
            </motion.div>

            {/* Value 4 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="p-6 h-full bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Quality</h3>
                <p className="text-gray-400">
                  {/* TODO: Add value description */}
                  [Describe your commitment to quality...]
                </p>
              </Card>
            </motion.div>

            {/* Value 5 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="p-6 h-full bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Community</h3>
                <p className="text-gray-400">
                  {/* TODO: Add value description */}
                  [Explain how you build community...]
                </p>
              </Card>
            </motion.div>

            {/* Value 6 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="p-6 h-full bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Growth</h3>
                <p className="text-gray-400">
                  {/* TODO: Add value description */}
                  [Describe your growth mindset...]
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 bg-black">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Team</span>
            </h2>
            <p className="text-gray-400 text-lg">
              {/* TODO: Add team intro */}
              [Brief intro about your team]
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team Member 1 - Founder/CEO */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-all text-center">
                {/* Placeholder for photo */}
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Users className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">[Founder Name]</h3>
                <p className="text-purple-400 mb-3">[Title - e.g., Founder & CEO]</p>
                <p className="text-gray-400 text-sm">
                  {/* TODO: Add bio */}
                  [Brief bio - background, expertise, why they started CredDev...]
                </p>
              </Card>
            </motion.div>

            {/* Team Member 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-blue-500/50 transition-all text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Users className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">[Team Member Name]</h3>
                <p className="text-blue-400 mb-3">[Title - e.g., Co-founder & CTO]</p>
                <p className="text-gray-400 text-sm">
                  {/* TODO: Add bio */}
                  [Brief bio...]
                </p>
              </Card>
            </motion.div>

            {/* Team Member 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center">
                  <Users className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">[Team Member Name]</h3>
                <p className="text-cyan-400 mb-3">[Title - e.g., Lead Engineer]</p>
                <p className="text-gray-400 text-sm">
                  {/* TODO: Add bio */}
                  [Brief bio...]
                </p>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-12"
          >
            <p className="text-gray-500 text-sm">
              {/* TODO: Add hiring message if applicable */}
              [Optional: "We're growing! Join our team" message]
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
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
            <Link href="/#waitlist">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-6 h-auto"
              >
                Join the Waitlist
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
