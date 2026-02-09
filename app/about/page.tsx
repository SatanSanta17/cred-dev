'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GradientText } from '@/components/shared/gradient-text'
import { ArrowLeft, Users, Target, Lightbulb, Heart, Rocket, Award, Mail, Linkedin } from 'lucide-react'
import Link from 'next/link'


// This component is client-side only due to animations
// SEO metadata is in layout.tsx

export default function AboutPage() {
  const missionValues = [
    {
      icon: Target,
      title: 'Transparency',
      description: '[Describe how you value transparency...]',
      gradient: 'from-purple-500 to-blue-500',
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: '[Describe your commitment to innovation...]',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Heart,
      title: 'Developer-First',
      description: '[Explain your developer-first approach...]',
      gradient: 'from-cyan-500 to-green-500',
    },
    {
      icon: Award,
      title: 'Quality',
      description: '[Describe your commitment to quality...]',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Users,
      title: 'Community',
      description: '[Explain how you build community...]',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Rocket,
      title: 'Growth',
      description: '[Describe your growth mindset...]',
      gradient: 'from-teal-500 to-blue-500',
    },
  ]
  const teamMembers = [
    {
      name: 'Burhanuddin',
      title: 'Builder 🛠️',
      bio: "I'm a full-stack developer with a strong instinct for identifying real-world problems and building practical, scalable solutions. I've always been driven by curiosity and a bias toward action — not just noticing gaps, but working to solve them.",
      gradient: 'from-purple-500 to-blue-500',
      hoverColor: 'hover:border-purple-500/50',
      titleColor: 'text-purple-400',
    },
    {
      name: 'Mariya',
      title: 'Head of Outreach 📢',
      bio: "Experienced in building and nurturing relationships, with a strong foundation in sales and over three years of hands-on industry experience. I’ve worked across organizations, contributing to business growth and learning how to connect people, opportunities, and solutions. \n I’m deeply interested in solving real-world problems and enabling ideas to turn into meaningful outcomes for the people and teams I work with.",
      gradient: 'from-blue-500 to-cyan-500',
      hoverColor: 'hover:border-blue-500/50',
      titleColor: 'text-blue-400',
    }
  ]
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
              We're building a unified, hassle-free ecosystem for developers to showcase their skills and credebility and recruiters can find verified talent and all their skills on a single platform.
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
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Origin Story</span>
            </h2>

            <Card className="p-8 bg-slate-900/50 border-slate-800">
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  After spending years trying to break into a top product company, I did everything I was supposed to do — solved problems on LeetCode, built real projects, stayed active on GitHub, and maintained a strong professional presence online. Yet interviews never came.

                  At first, I questioned my skills. Later, I realized the problem wasn’t effort or ability — it was visibility.

                  Recruiters are overwhelmed, reviewing thousands of applications with limited time. They can’t realistically verify every GitHub profile, coding platform, and project. As a result, hiring decisions often fall back on resumes, college names, past companies, and signals that are incomplete — and sometimes even exaggerated.

                  That’s when it became clear: the issue wasn’t just on the developer side or the recruiter side. It was the gap between them.

                  Developers keep working hard to build real skills. Recruiters are trying to find strong candidates quickly. But there’s no single place where true capability is visible, verified, and easy to evaluate.

                  CredDev was born to bridge that gap.

                  Developers focus on growing and proving their skills — we make sure that work translates into a credible, unified signal recruiters can trust. Not just to help you get shortlisted, but to present your real ability clearly and fairly.

                  CredDev is your skill identity — built on proof, not claims.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
      {/* Mission & Values Section */}
      {/* <section className="py-20 px-6 bg-gradient-to-b from-black to-slate-900">
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
              [What drives us every day]
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missionValues.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-4`}>
                    <value.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-gray-400">
                    {value.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}
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
              {/* [Brief intro about your team] */}
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 ">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`p-6 bg-slate-900/50 border-slate-800 ${member.hoverColor} transition-all text-center min-h-[29rem]`}>
                  {/* Placeholder for photo */}
                  <div className={`w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center`}>
                    <Users className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <p className={`${member.titleColor} mb-3`}>{member.title}</p>
                  <p className="text-gray-400 text-sm">
                    {member.bio}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-12"
          >
            <div className="flex flex-row items-center justify-center gap-2">
              <p className="text-gray-500 text-lg font-bold">
                We're growing! Join our team
            </p>
              {/* reachout via email or linkedin */}
              <Link href="mailto:cred.dev17@gmail.com" className="text-purple-400 hover:text-purple-300"><span><Mail className="w-4 h-4" /></span></Link>
              <Link href="https://www.linkedin.com/in/cburhanuddin/" className="text-purple-400 hover:text-purple-300"><span><Linkedin className="w-4 h-4" /></span></Link>
            </div>
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
