import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us - CredDev',
  description: 'Learn about CredDev\'s mission to create a transparent, verified ecosystem for developers and recruiters.',
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
