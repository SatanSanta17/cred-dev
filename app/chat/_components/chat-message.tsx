'use client'

import { motion } from 'framer-motion'
import { Brand } from '@/components/shared/brand'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Message types — shared across all chat components                 */
/* ------------------------------------------------------------------ */

export type MessageType = 'text' | 'loading' | 'action' | 'system'
export type MessageRole = 'agent' | 'user'

export interface Message {
  id: string
  role: MessageRole
  type: MessageType
  content: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

/* ------------------------------------------------------------------ */
/*  ChatMessage component                                             */
/* ------------------------------------------------------------------ */

interface ChatMessageProps {
  message: Message
  className?: string
}

export function ChatMessage({ message, className }: ChatMessageProps) {
  const isAgent = message.role === 'agent'

  /* System messages — centered, muted, no bubble */
  if (message.type === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn('flex justify-center px-4 py-2', className)}
      >
        <span className="text-sm text-[var(--text-muted)] text-center max-w-md">
          {message.content}
        </span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-3 px-4 py-2',
        isAgent ? 'justify-start' : 'justify-end',
        className,
      )}
    >
      {/* Agent avatar */}
      {isAgent && (
        <div className="flex-shrink-0 mt-1">
          <Brand size="sm" iconOnly className="pointer-events-none" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[80%] md:max-w-[65%] rounded-2xl px-4 py-3',
          isAgent
            ? 'glass-card-light text-[var(--text-body)]'
            : 'bg-cta-gradient text-white',
        )}
      >
        {message.type === 'loading' ? (
          <TypingIndicator />
        ) : message.type === 'action' ? (
          <ActionContent content={message.content} metadata={message.metadata} />
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        )}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Typing indicator (three bouncing dots)                            */
/* ------------------------------------------------------------------ */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1 px-1" aria-label="Agent is typing">
      <span className="typing-dot w-2 h-2 rounded-full bg-[var(--text-muted)]" />
      <span className="typing-dot w-2 h-2 rounded-full bg-[var(--text-muted)] animation-delay-200" />
      <span className="typing-dot w-2 h-2 rounded-full bg-[var(--text-muted)] animation-delay-400" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Action content — text + optional buttons from metadata            */
/* ------------------------------------------------------------------ */

interface ActionContentProps {
  content: string
  metadata?: Record<string, unknown>
}

function ActionContent({ content, metadata }: ActionContentProps) {
  const actions = (metadata?.actions ?? []) as Array<{
    label: string
    value: string
  }>

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.value}
              className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border-card)] text-[var(--text-heading)] hover:border-purple-500/50 hover:text-purple-400 transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
