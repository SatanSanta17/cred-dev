import type { Metadata } from 'next'
import { ChatInterface } from './_components/chat-interface'

export const metadata: Metadata = {
  title: 'Chat — CredDev',
  description:
    'Talk to the CredDev agent. Share your developer profile links and get an AI-powered credibility report.',
  openGraph: {
    title: 'Chat — CredDev',
    description: 'AI-powered developer credibility analysis via chat.',
    type: 'website',
  },
}

export default function ChatPage() {
  return (
    <div className="bg-page-gradient min-h-dvh">
      <ChatInterface />
    </div>
  )
}
