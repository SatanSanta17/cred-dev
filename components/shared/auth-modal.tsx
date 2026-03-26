'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Github, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import type { OAuthProvider } from '@/lib/supabase-auth'

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  className?: string
}

/* ------------------------------------------------------------------ */
/*  AuthModal                                                         */
/* ------------------------------------------------------------------ */

export function AuthModal({ isOpen, onClose, onSuccess, className }: AuthModalProps) {
  const { signIn, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState<string | null>(null)

  /* Close on successful auth (detected via context state change) */
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onSuccess()
    }
  }, [isAuthenticated, isOpen, onSuccess])

  /* Close on Escape key */
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSignIn = useCallback(
    async (provider: OAuthProvider) => {
      setError(null)
      setIsLoading(provider)

      try {
        await signIn(provider)
        /* OAuth redirect will happen — browser navigates away.
           If we're still here, the popup/redirect hasn't triggered. */
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        setIsLoading(null)
      }
    },
    [signIn],
  )

  /* Reset state when modal closes */
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(null)
      setError(null)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        /* Backdrop */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center p-4',
            'bg-black/60 backdrop-blur-sm',
            className,
          )}
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-label="Sign in to CredDev"
        >
          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card rounded-2xl w-full max-w-sm p-6 relative"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-white/5 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-[var(--text-heading)] mb-2">
                Sign in to continue
              </h2>
              <p className="text-sm text-[var(--text-body)]">
                Your report is ready to generate. Sign in to save it to your account.
              </p>
            </div>

            {/* OAuth buttons */}
            <div className="space-y-3">
              <OAuthButton
                provider="github"
                label="Continue with GitHub"
                icon={<Github className="w-5 h-5" />}
                isLoading={isLoading === 'github'}
                disabled={isLoading !== null}
                onClick={() => handleSignIn('github')}
              />

              <OAuthButton
                provider="google"
                label="Continue with Google"
                icon={<GoogleIcon />}
                isLoading={isLoading === 'google'}
                disabled={isLoading !== null}
                onClick={() => handleSignIn('google')}
              />
            </div>

            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-sm text-red-400 text-center"
              >
                {error}
              </motion.p>
            )}

            {/* Footer */}
            <p className="mt-6 text-xs text-[var(--text-faint)] text-center">
              By signing in, you agree to let CredDev store your report.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ */
/*  OAuth button                                                      */
/* ------------------------------------------------------------------ */

interface OAuthButtonProps {
  provider: OAuthProvider
  label: string
  icon: React.ReactNode
  isLoading: boolean
  disabled: boolean
  onClick: () => void
}

function OAuthButton({ label, icon, isLoading, disabled, onClick }: OAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl',
        'border border-[var(--border-card)] text-[var(--text-heading)]',
        'transition-all',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-purple-500/40 hover:bg-white/5',
      )}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Google icon (inline SVG — no lucide-react Google icon available)   */
/* ------------------------------------------------------------------ */

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
