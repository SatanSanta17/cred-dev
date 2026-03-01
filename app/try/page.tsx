'use client'

import { TryFlow } from '@/components/sections/try-flow'
import { GradientText } from '@/components/shared/gradient-text'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TryPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_110%)]" />

      {/* Gradient Orbs */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
      <div className="absolute top-40 -right-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
      <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />

      {/* Top Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2 group">
          <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
          <span className="text-xl font-bold">
            <GradientText>CredDev</GradientText>
          </span>
        </Link>
      </nav>

      {/* Main Content */}
      <div className="relative z-10">
        <TryFlow />
      </div>
    </main>
  )
}
