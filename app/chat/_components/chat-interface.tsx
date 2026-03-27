'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LogIn, LogOut } from 'lucide-react'
import { Brand } from '@/components/shared/brand'
import { AuthModal } from '@/components/shared/auth-modal'
import { useAuth } from '@/lib/auth-context'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import type { Message } from './chat-message'
import {
  processUserMessage,
  processResumeUpload,
  getGreeting,
  createInitialData,
} from './chat-agent'
import type { AgentState, CollectedData } from './chat-agent'

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const SCROLL_THRESHOLD = 100 // px from bottom to consider "scrolled up"
const TYPING_DELAY_MS = 600 // delay before agent replies (feels natural)

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function createMessage(partial: Omit<Message, 'id' | 'timestamp'>): Message {
  return { ...partial, id: generateId(), timestamp: new Date() }
}

/* ------------------------------------------------------------------ */
/*  ChatInterface                                                     */
/* ------------------------------------------------------------------ */

export function ChatInterface() {
  const { user, isAuthenticated, signOut } = useAuth()

  /* ----- Agent state machine ----------------------------------------- */
  const [agentState, setAgentState] = useState<AgentState>('greeting')
  const [collectedData, setCollectedData] = useState<CollectedData>(createInitialData)
  const [showFileUpload, setShowFileUpload] = useState(false)

  /* ----- Message state ------------------------------------------------ */
  const greetingContent = getGreeting(isAuthenticated, user?.user_metadata?.full_name)
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'greeting',
      role: 'agent',
      type: 'text',
      content: greetingContent,
      timestamp: new Date(),
    },
  ])
  const [isAgentTyping, setIsAgentTyping] = useState(false)

  /* ----- Auth modal state --------------------------------------------- */
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), [])
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), [])

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

  /* ----- Apply agent response ---------------------------------------- */
  const applyAgentResponse = useCallback(
    (response: ReturnType<typeof processUserMessage>) => {
      const { messages: agentMessages, nextState, updatedData, showFileUpload: fileUploadState } = response

      setAgentState(nextState)

      if (updatedData) {
        setCollectedData((prev) => ({ ...prev, ...updatedData }))
      }

      if (fileUploadState !== undefined) {
        setShowFileUpload(fileUploadState)
      }

      // Add agent messages with a brief typing delay
      setIsAgentTyping(true)

      setTimeout(() => {
        const newMessages = agentMessages.map(createMessage)
        setMessages((prev) => [...prev, ...newMessages])
        setIsAgentTyping(false)
      }, TYPING_DELAY_MS)
    },
    [],
  )

  /* ----- Send handler ------------------------------------------------- */
  const handleSend = useCallback(
    (content: string) => {
      // Optimistic: show user message immediately
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        type: 'text',
        content,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])

      // Process through state machine
      const response = processUserMessage(
        agentState,
        content,
        collectedData,
        isAuthenticated,
        user?.user_metadata?.full_name,
      )

      applyAgentResponse(response)
    },
    [agentState, collectedData, isAuthenticated, user, applyAgentResponse],
  )

  /* ----- File upload handler ------------------------------------------ */
  const handleFileUpload = useCallback(
    (file: File) => {
      // Show a user message indicating the upload
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        type: 'text',
        content: `📎 ${file.name}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])

      const response = processResumeUpload(agentState, file)
      if (response) {
        applyAgentResponse(response)
      }
    },
    [agentState, applyAgentResponse],
  )

  /* ----- Dynamic placeholder based on agent state --------------------- */
  const inputPlaceholder = isAgentTyping
    ? 'Agent is thinking...'
    : agentState === 'greeting' || agentState === 'collecting_links'
      ? 'Share your GitHub, LeetCode, or other profile links...'
      : agentState === 'confirming_links'
        ? 'Say "yes" to confirm or add more links...'
        : agentState === 'resume_prompt'
          ? 'Say "yes" to upload or "no" to skip...'
          : agentState === 'awaiting_resume'
            ? 'Upload your resume or say "skip"...'
            : agentState === 'extracting' || agentState === 'generating'
              ? 'Processing your data...'
              : 'Type a message...'

  /* ----- Disable input during non-interactive states ------------------ */
  const isInputDisabled =
    isAgentTyping ||
    agentState === 'checking_history'

  /* ----- Render ------------------------------------------------------- */
  return (
    <div className="flex flex-col h-dvh">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-[var(--border-card)] bg-black/40 backdrop-blur-md">
        <Brand size="sm" />

        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--text-body)] hidden sm:inline">
              {user.user_metadata?.full_name ?? user.email}
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-sm font-medium text-purple-400">
              {(user.user_metadata?.full_name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
            </div>
            <button
              type="button"
              onClick={signOut}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-white/5 transition-colors"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={openAuthModal}
            className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-purple-400 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign in
          </button>
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
        disabled={isInputDisabled}
        placeholder={inputPlaceholder}
        showFileUpload={showFileUpload}
      />

      {/* Auth modal — overlay, never a redirect */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onSuccess={closeAuthModal}
      />
    </div>
  )
}
