'use client'

import { AboutHero } from './_components/about-hero'
import { OriginStory } from './_components/origin-story'
import { TeamSection } from './_components/team-section'
import { AboutCta } from './_components/about-cta'

// This component is client-side only due to animations
// SEO metadata is in layout.tsx

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black">
      <AboutHero />
      <OriginStory />
      {/* Mission & Values Section — uncomment when content is ready */}
      {/* <ValuesSection /> */}
      <TeamSection />
      <AboutCta />
    </main>
  )
}
