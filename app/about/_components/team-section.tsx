'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Users, Mail, Linkedin } from 'lucide-react'
import Link from 'next/link'

const TEAM_MEMBERS = [
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
    bio: "Experienced in building and nurturing relationships, with a strong foundation in sales and over three years of hands-on industry experience. I've worked across organizations, contributing to business growth and learning how to connect people, opportunities, and solutions. \n I'm deeply interested in solving real-world problems and enabling ideas to turn into meaningful outcomes for the people and teams I work with.",
    gradient: 'from-blue-500 to-cyan-500',
    hoverColor: 'hover:border-blue-500/50',
    titleColor: 'text-blue-400',
  },
]

export function TeamSection() {
  return (
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
          {TEAM_MEMBERS.map((member, index) => (
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
  )
}
