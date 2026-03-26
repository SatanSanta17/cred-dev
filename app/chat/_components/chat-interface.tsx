'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Brand } from '@/components/shared/brand'
import { useAuth } from '@/lib/auth-context'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import type { Message } from './chat-message'

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const GREETING_MESSAGE: Message = {
  id: 'greeting',
  role: 'agent',
  type: 'text',
  content:
    "Hey! I'm CredDev's analysis agent. I verify developer credibility by analyzing real data from GitHub, LeetCode, and other platforms.\n\nShare your profile links and I'll get started.",
  timestamp: new Date(),
}

const SCROLL_THRESHOLD = 100 // px from bottom to consider "scrolled up"

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/* ------------------------------------------------------------------ */
/*  ChatInterface                                                     */
/* ------------------------------------------------------------------ */

export function ChatInterface() {
  const { user, isAuthenticated } = useAuth()

  /* ----- Message state ------------------------------------------------ */
  const [messages, setMessages] = useState<Message[]>([GREETING_MESSAGE])
  const [isAgentTyping, setIsAgentTyping] = useState(false)

  /* ----- Scroll state ------------------------------------------------- */
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollAnchorRef = useRef<HTMLDivElement>(null)
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false)

  /* Track whether the user has scrolled away from the bottom */
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setIsUserScrolledUp(distanceFromBottom > SCROLL_THRESHOLD)
  }, [])

  /* Auto-scroll to bottom when new messages arrive (unless user scrolled up) */
  useEffect(() => {
    if (!isUserScrolledUp) {
      scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isUserScrolledUp])

  const scrollToBottom = useCallback(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' })
    setIsUserScrolledUp(false)
  }, [])

  /* ----- Send handler ------------------------------------------------- */
  const handleSend = useCallback(
    (content: string) => {
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        type: 'text',
        content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])

      /*
       * Part 1B — no agent logic yet. Show typing indicator briefly,
       * then reply with a placeholder acknowledgment.
       * This will be replaced by the chat-agent state machine in Part 2A.
       */
      setIsAgentTyping(true)

      setTimeout(() => {
        const agentReply: Message = {
          id: generateId(),
          role: 'agent',
          type: 'text',
          content:
            "I heard you! Agent logic isn't wired up yet — that's coming in Part 2. For now, I can only echo that I received your message.",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, agentReply])
        setIsAgentTyping(false)
      }, 1200)
    },
    [],
  )

  /* ----- File upload placeholder -------------------------------------- */
  const handleFileUpload = useCallback((_file: File) => {
    /* Part 2B will wire this up */
  }, [])

  /* ----- Render ------------------------------------------------------- */
  return (
    <div className="flex flex-col h-dvh">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-[var(--border-card)] bg-black/40 backdrop-blur-md">
        <Brand size="sm" />

        {isAuthenticated && user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-body)] hidden sm:inline">
              {user.user_metadata?.full_name ?? user.email}
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-sm font-medium text-purple-400">
              {(user.user_metadata?.full_name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
            </div>
          </div>
        ) : (
          <span className="text-sm text-[var(--text-muted)]">
            No sign-in required to start
          </span>
        )}
      </header>

      {/* Message list */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-4 space-y-1 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {/* Typing indicator as a transient agent message */}
            {isAgentTyping && (
              <ChatMessage
                key="typing-indicator"
                message={{
                  id: 'typing',
                  role: 'agent',
                  type: 'loading',
                  content: '',
                  timestamp: new Date(),
                }}
              />
            )}
          </AnimatePresence>

          {/* Scroll anchor */}
          <div ref={scrollAnchorRef} aria-hidden="true" />
        </div>
      </div>

      {/* "New messages" pill — shown when user has scrolled up */}
      <AnimatePresence>
        {isUserScrolledUp && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-4 py-2 rounded-full glass-card-light text-sm text-[var(--text-body)] hover:text-[var(--text-heading)] transition-colors shadow-lg"
          >
            <ChevronDown className="w-4 h-4" />
            New messages
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onFileUpload={handleFileUpload}
        disabled={isAgentTyping}
        placeholder={
          isAgentTyping
            ? 'Agent is thinking...'
            : 'Share your GitHub, LeetCode, or other profile links...'
        }
        showFileUpload={false}
      />
    </div>
  )
}
