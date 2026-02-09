import { Hero } from '@/components/sections/hero'
import { Problem } from '@/components/sections/problem'
import { HowItWorks } from '@/components/sections/how-it-works'
import { Trust } from '@/components/sections/trust'
import { WhyNow } from '@/components/sections/why-now'
import { SampleOutput } from '@/components/sections/sample-output'
import { ForDevelopers } from '@/components/sections/for-developers'
import { ForRecruiters } from '@/components/sections/for-recruiters'
import { FounderNote } from '@/components/sections/founder-note'
import { WaitlistForm } from '@/components/sections/waitlist-form'
import { Footer } from '@/components/sections/footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <Problem />
      <HowItWorks />
      <Trust />
      <WhyNow />
      <SampleOutput />
      <WaitlistForm />
      <ForDevelopers />
      <ForRecruiters />
      <FounderNote />
      <Footer />
    </main>
  )
}