'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TryForm, type TryFormData } from './try-form'
import { GenerationLoader } from './generation-loader'
import { submitExtraction, getExtractionStatus, triggerGeneration, resendEmail } from '@/lib/api'
import { useGenerationProgress } from '@/lib/use-generation-progress'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, RotateCcw, Mail, Loader2, ArrowLeft, AlertTriangle, Send } from 'lucide-react'
import Link from 'next/link'

type FlowState = 'form' | 'extracting' | 'generating' | 'success' | 'error'

export function TryFlow() {
  const [state, setState] = useState<FlowState>('form')
  const [jobId, setJobId] = useState<string | null>(null)
  const [candidateName, setCandidateName] = useState('')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [emailFailed, setEmailFailed] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const pollCountRef = useRef(0)

  const { progress, error: sseError, reset: resetSSE } = useGenerationProgress(
    jobId,
    state === 'generating'
  )

  // Watch for SSE completion or failure
  if (state === 'generating' && progress?.status === 'completed') {
    if (progress.email_failed) {
      setEmailFailed(true)
    }
    setState('success')
  }
  if (state === 'generating' && (progress?.status === 'failed' || sseError)) {
    setErrorMessage(sseError || progress?.error || 'Report generation failed')
    setState('error')
  }

  const cleanup = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const handleSubmit = useCallback(async (data: TryFormData) => {
    setFormLoading(true)

    try {
      // Build platform_urls from additional links
      const platformUrls: Record<string, string> = {}
      for (const link of data.additionalLinks) {
        const key = link.platformName.toLowerCase().replace(/\s+/g, '_') || 'other'
        platformUrls[key] = link.url
      }

      // Phase 1: Submit extraction
      const extractRes = await submitExtraction({
        candidate_name: data.name,
        candidate_email: data.email,
        github_url: data.github_url || undefined,
        leetcode_url: data.leetcode_url || undefined,
        platform_urls: Object.keys(platformUrls).length > 0 ? platformUrls : undefined,
        resume: data.resume,
      })

      setJobId(extractRes.job_id)
      setCandidateName(data.name)
      setCandidateEmail(data.email)
      setState('extracting')
      setFormLoading(false)

      // Phase 2: Poll extraction status every 3s (max ~2 minutes)
      const MAX_POLLS = 40
      pollCountRef.current = 0
      let generationTriggered = false

      const pollExtraction = () => {
        pollRef.current = setInterval(async () => {
          // Guard: don't trigger generation twice
          if (generationTriggered) return

          pollCountRef.current += 1

          // Timeout: if still pending/extracting after MAX_POLLS, treat as failed
          if (pollCountRef.current > MAX_POLLS) {
            cleanup()
            setErrorMessage('Extraction timed out. Please try again.')
            setState('error')
            return
          }

          try {
            const status = await getExtractionStatus(extractRes.job_id)

            if (status.status === 'extracted') {
              // Double-check: another in-flight callback may have triggered generation
              // while this one was awaiting getExtractionStatus
              if (generationTriggered) return
              generationTriggered = true
              cleanup()

              // Phase 3: Trigger generation
              try {
                await triggerGeneration(extractRes.job_id)
                setState('generating') // SSE hook takes over from here
              } catch (genErr: unknown) {
                const msg = genErr instanceof Error ? genErr.message : 'Generation trigger failed'
                // If generation was already started (409), transition to generating state
                if (msg.includes('already in progress') || msg.includes('already been generated')) {
                  setState('generating')
                } else {
                  setErrorMessage(msg)
                  setState('error')
                }
              }
            } else if (status.status === 'failed') {
              cleanup()
              setErrorMessage(status.error || 'Data extraction failed')
              setState('error')
            }
            // Otherwise keep polling (status is "pending" or "extracting")
          } catch {
            // Network error during polling — keep trying
          }
        }, 3000)
      }

      pollExtraction()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(msg)
      setFormLoading(false)
    }
  }, [cleanup])

  const handleRetry = useCallback(() => {
    cleanup()
    resetSSE()
    setJobId(null)
    setErrorMessage('')
    setFormLoading(false)
    setEmailFailed(false)
    setResendLoading(false)
    setEmailSent(false)
    setState('form')
  }, [cleanup, resetSSE])

  const handleResendEmail = useCallback(async () => {
    if (!jobId || resendLoading) return
    setResendLoading(true)
    try {
      await resendEmail(jobId)
      setEmailFailed(false)
      setEmailSent(true)
      toast.success('Reports sent to your email!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to resend email'
      toast.error(msg)
    } finally {
      setResendLoading(false)
    }
  }, [jobId, resendLoading])

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-12">
      <AnimatePresence mode="wait">
        {/* Form State */}
        {state === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <TryForm onSubmit={handleSubmit} loading={formLoading} />
          </motion.div>
        )}

        {/* Extracting State */}
        {state === 'extracting' && (
          <motion.div
            key="extracting"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md mx-auto text-center"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-lg" />
              <div className="relative rounded-2xl glass-card p-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="inline-block mb-6"
                >
                  <Loader2 className="w-12 h-12 text-purple-400" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">Connecting to Platforms</h3>
                <p className="text-gray-400 text-sm">
                  Fetching data from your submitted profiles...
                </p>
                <p className="text-gray-600 text-xs mt-4">This usually takes 10-30 seconds</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Generating State */}
        {state === 'generating' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <GenerationLoader progress={progress} candidateName={candidateName} />
          </motion.div>
        )}

        {/* Success State */}
        {state === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-full max-w-md mx-auto text-center"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-lg" />
              <div className="relative rounded-2xl glass-card !border-green-500/20 p-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-green-400" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">Report Generated!</h3>
                <p className="text-gray-300 mb-2">
                  Your credibility report has been created successfully.
                </p>
                {emailFailed ? (
                  <div className="mb-6">
                    <div className="flex items-center justify-center gap-2 text-sm text-amber-400 mb-3">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Email delivery failed — your reports are saved</span>
                    </div>
                    <Button
                      onClick={handleResendEmail}
                      disabled={resendLoading}
                      size="sm"
                      className="bg-cta-gradient"
                    >
                      {resendLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Resend Email
                        </>
                      )}
                    </Button>
                  </div>
                ) : candidateEmail ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
                    <Mail className="w-4 h-4" />
                    <span>{emailSent ? 'Resent' : 'Sent'} to {candidateEmail}</span>
                  </div>
                ) : null}
                <div className="flex flex-col gap-3 mt-6">
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    className="border-gray-700 hover:bg-gray-800"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Analyze Another Profile
                  </Button>
                  <Link href="/">
                    <Button variant="ghost" className="text-gray-400 hover:text-white w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md mx-auto text-center"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-lg" />
              <div className="relative rounded-2xl glass-card !border-red-500/20 p-10">
                <XCircle className="w-14 h-14 mx-auto mb-6 text-red-400" />
                <h3 className="text-xl font-bold text-white mb-3">Something Went Wrong</h3>
                <p className="text-gray-400 text-sm mb-6">{errorMessage}</p>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleRetry}
                    className="bg-cta-gradient"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Link href="/">
                    <Button variant="ghost" className="text-gray-400 hover:text-white w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
