import { Hero } from '@/components/sections/hero'
import { HowItWorks } from '@/components/sections/how-it-works'
import { ProblemValidation } from '@/components/sections/problem-validation'
import { Footer } from '@/components/sections/footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <HowItWorks />
      <ProblemValidation />
      <Footer />
    </main>
  )
}
