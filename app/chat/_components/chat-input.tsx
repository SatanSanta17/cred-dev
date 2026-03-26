'use client'

import { useState, useRef, useCallback } from 'react'
import { Send, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  onFileUpload: (file: File) => void
  disabled: boolean
  placeholder: string
  showFileUpload: boolean
  className?: string
}

const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export function ChatInput({
  onSend,
  onFileUpload,
  disabled,
  placeholder,
  showFileUpload,
  className,
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return

    onSend(trimmed)
    setValue('')

    /* Reset textarea height after clearing */
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value)

      /* Auto-resize textarea up to a max height */
      const el = e.target
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`
    },
    [],
  )

  const handleFileClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > MAX_FILE_SIZE_BYTES) {
        /* Surface error via the parent in Part 2 — for now, alert */
        alert(`File must be under ${MAX_FILE_SIZE_MB}MB.`)
        return
      }

      onFileUpload(file)

      /* Reset so the same file can be selected again */
      e.target.value = ''
    },
    [onFileUpload],
  )

  const canSend = value.trim().length > 0 && !disabled

  return (
    <div
      className={cn(
        'border-t border-[var(--border-card)] bg-black/40 backdrop-blur-md px-4 py-3',
        className,
      )}
    >
      <div className="max-w-3xl mx-auto flex items-end gap-2">
        {/* File upload button */}
        {showFileUpload && (
          <>
            <button
              type="button"
              onClick={handleFileClick}
              disabled={disabled}
              className={cn(
                'flex-shrink-0 p-2 rounded-lg transition-colors',
                disabled
                  ? 'text-[var(--text-faint)] cursor-not-allowed'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-white/5',
              )}
              aria-label="Upload file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              aria-hidden="true"
            />
          </>
        )}

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className={cn(
            'flex-1 resize-none rounded-xl px-4 py-3 text-sm leading-relaxed',
            'input-dark text-[var(--text-heading)] placeholder:text-[var(--text-faint)]',
            'focus:outline-none focus:ring-1 focus:ring-purple-500/50',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'scrollbar-thin scrollbar-thumb-gray-700',
          )}
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            'flex-shrink-0 p-2.5 rounded-xl transition-all',
            canSend
              ? 'bg-cta-gradient text-white hover:opacity-90'
              : 'bg-white/5 text-[var(--text-faint)] cursor-not-allowed',
          )}
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
