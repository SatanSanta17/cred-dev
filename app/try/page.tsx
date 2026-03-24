'use client'

import { TryFlow } from './_components/try-flow'
import { BackLink } from '@/components/shared/back-link'

export default function TryPage() {
  return (
    <main className="min-h-screen bg-page-gradient relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid" />

      {/* Gradient Orbs */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
      <div className="absolute top-40 -right-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
      <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />

      {/* Top Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <BackLink showBrand />
      </nav>

      {/* Main Content */}
      <div className="relative z-10">
        <TryFlow />
      </div>
    </main>
  )
}
