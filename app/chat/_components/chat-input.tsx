'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Send, Paperclip, X, FileText, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
const FILE_ERROR_DISPLAY_MS = 4000

export function ChatInput({
  onSend,
  onFileUpload,
  disabled,
  placeholder,
  showFileUpload,
  className,
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* Auto-dismiss file error after a few seconds */
  useEffect(() => {
    if (!fileError) return
    const timer = setTimeout(() => setFileError(null), FILE_ERROR_DISPLAY_MS)
    return () => clearTimeout(timer)
  }, [fileError])

  /* Refocus textarea when input becomes enabled again (e.g. after agent finishes typing) */
  useEffect(() => {
    if (!disabled) {
      requestAnimationFrame(() => {
        textareaRef.current?.focus()
      })
    }
  }, [disabled])

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return

    onSend(trimmed)
    setValue('')

    /* Reset textarea height after clearing */
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    /* Refocus textarea after React re-renders */
    requestAnimationFrame(() => {
      textareaRef.current?.focus()
    })
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

      /* Reset input so the same file can be selected again */
      e.target.value = ''

      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setFileError('Only PDF files are accepted.')
        return
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError(`File must be under ${MAX_FILE_SIZE_MB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`)
        return
      }

      setFileError(null)
      setPendingFile(file)
    },
    [],
  )

  const handleFileConfirm = useCallback(() => {
    if (!pendingFile) return
    onFileUpload(pendingFile)
    setPendingFile(null)

    /* Refocus textarea after upload */
    requestAnimationFrame(() => {
      textareaRef.current?.focus()
    })
  }, [pendingFile, onFileUpload])

  const handleFileRemove = useCallback(() => {
    setPendingFile(null)
  }, [])

  const canSend = value.trim().length > 0 && !disabled

  return (
    <div
      className={cn(
        'border-[var(--border-card)] bg-black/40 backdrop-blur-md px-4 py-3',
        className,
      )}
    >
      <div className="max-w-3xl mx-auto space-y-2">
        {/* File error banner */}
        <AnimatePresence>
          {fileError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{fileError}</span>
              <button
                type="button"
                onClick={() => setFileError(null)}
                className="flex-shrink-0 p-0.5 rounded hover:bg-red-500/10 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pending file badge */}
        <AnimatePresence>
          {pendingFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card-light text-sm">
                <FileText className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-[var(--text-body)] truncate max-w-[200px]">
                  {pendingFile.name}
                </span>
                <span className="text-[var(--text-muted)] text-xs">
                  ({(pendingFile.size / (1024 * 1024)).toFixed(1)}MB)
                </span>
                <button
                  type="button"
                  onClick={handleFileRemove}
                  className="flex-shrink-0 p-0.5 rounded hover:bg-white/10 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleFileConfirm}
                disabled={disabled}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  disabled
                    ? 'bg-white/5 text-[var(--text-faint)] cursor-not-allowed'
                    : 'bg-cta-gradient text-white hover:opacity-90',
                )}
              >
                Upload
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input row */}
        <div className="flex items-end gap-2">
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
                aria-label="Upload resume (PDF)"
                title="Upload resume (PDF, max 10MB)"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
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
    </div>
  )
}
