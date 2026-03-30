'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LogIn, LogOut } from 'lucide-react'
import { Brand } from '@/components/shared/brand'
import { AuthModal } from '@/components/shared/auth-modal'
import { useAuth } from '@/lib/auth-context'
import { useExtractionPolling } from '@/lib/use-extraction-polling'
import { useGenerationProgress } from '@/lib/use-generation-progress'
import { triggerGeneration, getUserReports } from '@/lib/api'
import type { ExtractionProgress, ExtractionResult } from '@/lib/use-extraction-polling'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { ReportCards } from './report-card'
import type { Message } from './chat-message'
import {
  processUserMessage,
  processResumeUpload,
  getGreeting,
  createInitialData,
  HISTORY_MESSAGES,
} from './chat-agent'
import { RATE_LIMIT_MESSAGES } from './chat-agent-messages'
import type { AgentState, CollectedData } from './chat-agent'

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const SCROLL_THRESHOLD = 100 // px from bottom to consider "scrolled up"
const TYPING_DELAY_MS = 600 // delay before agent replies (feels natural)
const EXTRACTION_LOADING_ID = 'extraction-loading' // stable ID for ephemeral message
const GENERATION_LOADING_ID = 'generation-loading' // stable ID for generation progress

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

  /* ----- Report cards state ------------------------------------------ */
  const [deliveredJobId, setDeliveredJobId] = useState<string | null>(null)

  /* ----- Auth modal state --------------------------------------------- */
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), [])
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), [])

  /* ----- Scroll state ------------------------------------------------- */
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollAnchorRef = useRef<HTMLDivElement>(null)
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false)

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setIsUserScrolledUp(distanceFromBottom > SCROLL_THRESHOLD)
  }, [])

  useEffect(() => {
    if (!isUserScrolledUp) {
      scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isUserScrolledUp, deliveredJobId])

  const scrollToBottom = useCallback(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' })
    setIsUserScrolledUp(false)
  }, [])

  /* ----- Global 401 listener ----------------------------------------- */
  useEffect(() => {
    function handleAuthExpired() {
      // Token expired mid-session — open auth modal to re-authenticate
      setIsAuthModalOpen(true)
      setMessages((prev) => [
        ...prev,
        createMessage({
          role: 'agent',
          type: 'text',
          content: 'Your session has expired. Please sign in again to continue.',
        }),
      ])
    }

    window.addEventListener('auth:expired', handleAuthExpired)
    return () => window.removeEventListener('auth:expired', handleAuthExpired)
  }, [])

  /* ----- On-mount: history-aware greeting for returning users --------- */
  const historyCheckedRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || historyCheckedRef.current) return
    historyCheckedRef.current = true

    const userName = user?.user_metadata?.full_name

    getUserReports(1, 1).then((res) => {
      if (res.total > 0 && userName) {
        // Update greeting message with history count
        const updatedGreeting = getGreeting(true, userName, res.total)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === 'greeting' ? { ...m, content: updatedGreeting } : m,
          ),
        )
      }
    }).catch(() => {
      // Silent — non-fatal, greeting stays as-is
    })
  }, [isAuthenticated, user])

  /* ----- Fetch and show report history -------------------------------- */

  const fetchAndShowHistory = useCallback(async () => {
    setAgentState('viewing_history')
    setMessages((prev) => [
      ...prev,
      createMessage({
        role: 'agent',
        type: 'text',
        content: HISTORY_MESSAGES.fetching,
      }),
    ])

    try {
      const history = await getUserReports(1, 50)

      if (history.reports.length === 0) {
        setMessages((prev) => [
          ...prev,
          createMessage({
            role: 'agent',
            type: 'text',
            content: HISTORY_MESSAGES.empty,
          }),
        ])
        setAgentState('idle')
        return
      }

      // Show completed reports as downloadable cards
      const completedReports = history.reports.filter((r) => r.status === 'completed')

      if (completedReports.length === 0) {
        setMessages((prev) => [
          ...prev,
          createMessage({
            role: 'agent',
            type: 'text',
            content: 'You have reports in progress but none are complete yet. Check back soon!',
          }),
        ])
        setAgentState('idle')
        return
      }

      setMessages((prev) => [
        ...prev,
        createMessage({
          role: 'agent',
          type: 'text',
          content: HISTORY_MESSAGES.header(completedReports.length),
        }),
      ])

      // Show the most recent completed report's cards
      setDeliveredJobId(completedReports[0].job_id)
      setAgentState('idle')
    } catch {
      setMessages((prev) => [
        ...prev,
        createMessage({
          role: 'agent',
          type: 'text',
          content: 'Sorry, I couldn\'t fetch your report history right now. Try again in a moment.',
        }),
      ])
      setAgentState('idle')
    }
  }, [])

  /* ----- Generation helpers (defined first — referenced by extraction) -- */

  const startGeneration = useCallback(async (jobId: string) => {
    setAgentState('generating')

    setMessages((prev) => [
      ...prev,
      {
        id: GENERATION_LOADING_ID,
        role: 'agent' as const,
        type: 'loading' as const,
        content: 'Starting report generation...',
        timestamp: new Date(),
      },
    ])

    try {
      await triggerGeneration(jobId)
      // SSE progress hook will take over from here
    } catch (err) {
      // Remove loading, show error
      setMessages((prev) => {
        const withoutLoading = prev.filter((m) => m.id !== GENERATION_LOADING_ID)
        return [
          ...withoutLoading,
          createMessage({
            role: 'agent',
            type: 'action',
            content: `Report generation failed: ${err instanceof Error ? err.message : 'Something went wrong'}`,
            metadata: {
              actions: [
                { label: 'Try Again', value: `generate_new:${jobId}` },
                { label: 'Start Over', value: 'start_over' },
              ],
            },
          }),
        ]
      })
      setAgentState('idle')
    }
  }, [])

  const checkHistoryAndGenerate = useCallback(async (jobId: string) => {
    setMessages((prev) => [
      ...prev,
      createMessage({
        role: 'agent',
        type: 'text',
        content: 'Checking for existing reports...',
      }),
    ])

    try {
      const history = await getUserReports(1, 10)

      // Check if any existing completed report matches the same platform URLs
      const currentUrls = collectedData.platformUrls
      const matchingReport = history.reports.find((r) => {
        if (r.status !== 'completed' || !r.platform_urls) return false
        if (r.job_id === jobId) return false // don't match current job
        const existingUrls = r.platform_urls
        const currentKeys = Object.keys(currentUrls)
        const existingKeys = Object.keys(existingUrls)
        // Exact match — same platforms, same URLs
        if (currentKeys.length !== existingKeys.length) return false
        return currentKeys.every(
          (platform) => existingUrls[platform] === currentUrls[platform],
        )
      })

      if (matchingReport) {
        // Found existing report — give user the choice
        setMessages((prev) => [
          ...prev,
          createMessage({
            role: 'agent',
            type: 'action',
            content: `I found an existing report for this profile from ${matchingReport.created_at ? new Date(matchingReport.created_at).toLocaleDateString() : 'a previous session'}. Want to view that or generate a fresh analysis?`,
            metadata: {
              actions: [
                { label: 'View Existing', value: `view_existing:${matchingReport.job_id}` },
                { label: 'Generate New', value: `generate_new:${jobId}` },
              ],
            },
          }),
        ])
        return
      }
    } catch {
      // History check failed — proceed with generation (non-fatal)
    }

    // No match or history unavailable — proceed to generate
    startGeneration(jobId)
  }, [collectedData.platformUrls, startGeneration])

  /* ----- Extraction polling ------------------------------------------ */

  const handleExtractionProgress = useCallback((progress: ExtractionProgress) => {
    // Update the ephemeral loading message content in-place
    setMessages((prev) => {
      const existing = prev.find((m) => m.id === EXTRACTION_LOADING_ID)
      if (existing) {
        return prev.map((m) =>
          m.id === EXTRACTION_LOADING_ID
            ? { ...m, content: progress.message }
            : m,
        )
      }
      // First progress update — add the ephemeral loading message
      return [
        ...prev,
        {
          id: EXTRACTION_LOADING_ID,
          role: 'agent' as const,
          type: 'loading' as const,
          content: progress.message,
          timestamp: new Date(),
        },
      ]
    })
  }, [])

  const handleExtractionComplete = useCallback((result: ExtractionResult) => {
    // Remove ephemeral loading message, add persistent summary
    setMessages((prev) => {
      const withoutLoading = prev.filter((m) => m.id !== EXTRACTION_LOADING_ID)
      const summary = `Extraction complete! I've gathered data from ${result.platformsExtracted.join(', ')}.`

      return [
        ...withoutLoading,
        createMessage({ role: 'agent', type: 'text', content: summary }),
      ]
    })

    // Store jobId in collected data
    setCollectedData((prev) => ({ ...prev, jobId: result.jobId }))

    // Transition: extracting → auth_gate (if not authenticated) or checking_history
    if (isAuthenticated) {
      setAgentState('checking_history')
      checkHistoryAndGenerate(result.jobId)
    } else {
      setAgentState('auth_gate')
      setMessages((prev) => [
        ...prev,
        createMessage({
          role: 'agent',
          type: 'text',
          content: 'Great — your data is ready! Sign in to generate your credibility reports.',
        }),
      ])
      setIsAuthModalOpen(true)
    }
  }, [isAuthenticated, checkHistoryAndGenerate])

  const handleExtractionError = useCallback((errorMsg: string) => {
    // Remove ephemeral loading message
    setMessages((prev) => prev.filter((m) => m.id !== EXTRACTION_LOADING_ID))

    // Detect rate limit (429) — surface auth modal instead of generic error
    const isRateLimited = errorMsg.toLowerCase().includes('rate limit') || errorMsg.includes('429')

    if (isRateLimited && !isAuthenticated) {
      setMessages((prev) => [
        ...prev,
        createMessage({
          role: 'agent',
          type: 'text',
          content: RATE_LIMIT_MESSAGES.exceeded,
        }),
      ])
      setAgentState('auth_gate')
      setIsAuthModalOpen(true)
      return
    }

    // Generic extraction error with retry options
    setMessages((prev) => [
      ...prev,
      createMessage({
        role: 'agent',
        type: 'action',
        content: `Something went wrong during extraction: ${errorMsg}`,
        metadata: {
          actions: [
            { label: 'Try Again', value: 'retry_extraction' },
            { label: 'Start Over', value: 'start_over' },
          ],
        },
      }),
    ])

    // Go back to collecting_links so user can retry
    setAgentState('collecting_links')
  }, [isAuthenticated])

  const { reset: resetExtraction } = useExtractionPolling({
    platformUrls: collectedData.platformUrls,
    resumeFile: collectedData.resumeFile,
    candidateName: user?.user_metadata?.full_name ?? 'Developer',
    candidateEmail: user?.email ?? '',
    enabled: agentState === 'extracting',
    onComplete: handleExtractionComplete,
    onError: handleExtractionError,
    onProgress: handleExtractionProgress,
  })

  /* ----- Generation SSE progress ------------------------------------- */

  const { progress: genProgress, error: genError, reset: resetGeneration } = useGenerationProgress(
    agentState === 'generating' ? collectedData.jobId : null,
    agentState === 'generating',
  )

  // Update ephemeral generation loading message when SSE progress arrives
  useEffect(() => {
    if (!genProgress || agentState !== 'generating') return

    if (genProgress.status === 'completed') {
      // Generation done — remove loading, add success message, show report cards
      setMessages((prev) => {
        const withoutLoading = prev.filter((m) => m.id !== GENERATION_LOADING_ID)
        return [
          ...withoutLoading,
          createMessage({
            role: 'agent',
            type: 'text',
            content: 'Your credibility reports are ready! Download them below.',
          }),
        ]
      })
      setDeliveredJobId(collectedData.jobId)
      setAgentState('delivering_report')
      resetGeneration()
      return
    }

    if (genProgress.status === 'failed') {
      setMessages((prev) => {
        const withoutLoading = prev.filter((m) => m.id !== GENERATION_LOADING_ID)
        return [
          ...withoutLoading,
          createMessage({
            role: 'agent',
            type: 'action',
            content: `Report generation failed: ${genProgress.error || 'Unknown error'}`,
            metadata: {
              actions: [
                { label: 'Try Again', value: `generate_new:${collectedData.jobId}` },
                { label: 'Start Over', value: 'start_over' },
              ],
            },
          }),
        ]
      })
      setAgentState('idle')
      resetGeneration()
      return
    }

    // In-progress — update ephemeral message content
    setMessages((prev) =>
      prev.map((m) =>
        m.id === GENERATION_LOADING_ID
          ? { ...m, content: genProgress.message || 'Generating reports...' }
          : m,
      ),
    )
  }, [genProgress, agentState, collectedData.jobId, resetGeneration])

  // Handle SSE connection error
  useEffect(() => {
    if (genError && agentState === 'generating') {
      setMessages((prev) => {
        const withoutLoading = prev.filter((m) => m.id !== GENERATION_LOADING_ID)
        return [
          ...withoutLoading,
          createMessage({
            role: 'agent',
            type: 'action',
            content: `Connection lost during generation: ${genError}`,
            metadata: {
              actions: [
                { label: 'Try Again', value: `generate_new:${collectedData.jobId}` },
                { label: 'Start Over', value: 'start_over' },
              ],
            },
          }),
        ]
      })
      setAgentState('idle')
      resetGeneration()
    }
  }, [genError, agentState, collectedData.jobId, resetGeneration])

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

      // State-triggered side effects
      if (nextState === 'viewing_history') {
        fetchAndShowHistory()
        return
      }

      // Add agent messages with a brief typing delay
      if (agentMessages.length > 0) {
        setIsAgentTyping(true)

        setTimeout(() => {
          const newMessages = agentMessages.map(createMessage)
          setMessages((prev) => [...prev, ...newMessages])
          setIsAgentTyping(false)
        }, TYPING_DELAY_MS)
      }
    },
    [fetchAndShowHistory],
  )

  /* ----- Send handler ------------------------------------------------- */
  const handleSend = useCallback(
    (content: string) => {
      // Handle special action values
      if (content === 'retry_extraction') {
        resetExtraction()
        setAgentState('extracting')
        setMessages((prev) => [
          ...prev,
          createMessage({ role: 'agent', type: 'text', content: 'Retrying extraction...' }),
        ])
        return
      }

      if (content === 'start_over') {
        resetExtraction()
        resetGeneration()
        setCollectedData(createInitialData())
        setDeliveredJobId(null)
        setAgentState('greeting')
        setMessages((prev) => [
          ...prev,
          createMessage({
            role: 'agent',
            type: 'text',
            content: "No problem — let's start fresh. Share your profile links and I'll get going.",
          }),
        ])
        return
      }

      // Handle "view existing" report from history check
      if (content.startsWith('view_existing:')) {
        const existingJobId = content.split(':')[1]
        setDeliveredJobId(existingJobId)
        setAgentState('delivering_report')
        setMessages((prev) => [
          ...prev,
          createMessage({
            role: 'agent',
            type: 'text',
            content: 'Here are your existing reports. Download them below.',
          }),
        ])
        return
      }

      // Handle "generate new" from history check
      if (content.startsWith('generate_new:')) {
        const jobId = content.split(':')[1]
        startGeneration(jobId)
        return
      }

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
    [agentState, collectedData, isAuthenticated, user, applyAgentResponse, resetExtraction, resetGeneration, startGeneration, fetchAndShowHistory],
  )

  /* ----- Action button handler (from action-type messages) ------------- */
  const handleAction = useCallback(
    (value: string) => {
      handleSend(value)
    },
    [handleSend],
  )

  /* ----- File upload handler ------------------------------------------ */
  const handleFileUpload = useCallback(
    (file: File) => {
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

  /* ----- Auth success handler ----------------------------------------- */
  const handleAuthSuccess = useCallback(() => {
    setIsAuthModalOpen(false)

    if (agentState === 'auth_gate') {
      if (collectedData.jobId) {
        // Auth completed post-extraction — check history and generate
        setAgentState('checking_history')
        setMessages((prev) => [
          ...prev,
          createMessage({
            role: 'agent',
            type: 'text',
            content: 'Signed in! Let me check your report history...',
          }),
        ])
        checkHistoryAndGenerate(collectedData.jobId)
      } else {
        // Auth completed after rate limit — retry extraction
        setMessages((prev) => [
          ...prev,
          createMessage({
            role: 'agent',
            type: 'text',
            content: 'Signed in! Let me retry the extraction for you...',
          }),
        ])
        resetExtraction()
        setAgentState('extracting')
      }
    }
  }, [agentState, collectedData.jobId, checkHistoryAndGenerate, resetExtraction])

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
    agentState === 'extracting' ||
    agentState === 'checking_history' ||
    agentState === 'generating'

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
              <ChatMessage key={msg.id} message={msg} onAction={handleAction} />
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

          {/* Report cards — rendered after delivery */}
          {deliveredJobId && (
            <ReportCards jobId={deliveredJobId} />
          )}

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
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}
