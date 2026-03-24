import { Hero } from './_components/hero'
import { HowItWorks } from './_components/how-it-works'
import { ProblemValidation } from './_components/problem-validation'
import { Footer } from '@/components/shared/footer'

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
