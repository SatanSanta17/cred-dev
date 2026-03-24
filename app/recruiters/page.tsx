import { Metadata } from 'next'
import { RecruiterHero } from './_components/recruiter-hero'
import { ProductVision } from './_components/product-vision'
import { RecruiterQuotes } from './_components/recruiter-quotes'
import { RecruiterWaitlistForm } from './_components/recruiter-waitlist-form'
import { Footer } from '@/components/shared/footer'

export const metadata: Metadata = {
  title: 'For Recruiters | CredDev',
  description: 'Verify candidates before you hire. AI-powered credibility reports — coming soon for recruiters.',
}

export default function RecruitersPage() {
  return (
    <main className="min-h-screen bg-black">
      <RecruiterHero />
      <ProductVision />
      <RecruiterQuotes />
      <RecruiterWaitlistForm />
      <Footer />
    </main>
  )
}
