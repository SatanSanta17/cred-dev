import { WaitlistForm } from '@/components/sections/waitlist-form'
import { Footer } from '@/components/sections/footer'

export const metadata = {
  title: 'Join the Waitlist | CredDev',
  description: 'Join the CredDev waitlist for early access to developer credibility verification.',
}

export default function WaitlistPage() {
  return (
    <main className="min-h-screen bg-black">
      <WaitlistForm />
      <Footer />
    </main>
  )
}
