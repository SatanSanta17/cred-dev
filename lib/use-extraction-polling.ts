'use client'

/**
 * Extraction Polling Hook
 *
 * Submits extraction request and polls for status updates.
 * Returns progress stage for ephemeral UI updates and final result on completion.
 *
 * Used by ChatInterface (Increment 2C) and could replace inline polling in try-flow.tsx.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { submitExtraction, getExtractionStatus } from './api'
import type { ExtractionStatusResponse } from './api'
import { getPlatformName } from './platform-utils'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ExtractionStage = 'submitting' | 'pending' | 'extracting' | 'extracted' | 'failed' | 'timeout'

export interface ExtractionProgress {
  stage: ExtractionStage
  message: string
}

export interface ExtractionResult {
  jobId: string
  candidateName: string
  platformsExtracted: string[]
}

interface UseExtractionPollingOptions {
  platformUrls: Record<string, string>
  resumeFile: File | null
  candidateName: string
  candidateEmail: string
  enabled: boolean
  onComplete: (result: ExtractionResult) => void
  onError: (message: string) => void
  onProgress: (progress: ExtractionProgress) => void
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const POLL_INTERVAL_MS = 3000
const MAX_POLLS = 40 // ~2 minutes

/** Cycling messages shown while extraction is in progress. */
const EXTRACTION_STAGE_MESSAGES: Record<string, string[]> = {
  pending: [
    'Preparing to connect to your platforms...',
    'Setting up extraction pipeline...',
  ],
  extracting: [
    'Pulling data from your profiles...',
    'Analyzing your GitHub repositories and contributions...',
    'Fetching your coding activity and problem-solving data...',
    'Cross-referencing profile information across platforms...',
    'Gathering your public contributions and activity...',
  ],
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useExtractionPolling({
  platformUrls,
  resumeFile,
  candidateName,
  candidateEmail,
  enabled,
  onComplete,
  onError,
  onProgress,
}: UseExtractionPollingOptions) {
  const [jobId, setJobId] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollCountRef = useRef(0)
  const completedRef = useRef(false)
  const messageIndexRef = useRef(0)

  const cleanup = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  /* Cycle through stage-appropriate messages */
  const getStageMessage = useCallback((stage: string): string => {
    const messages = EXTRACTION_STAGE_MESSAGES[stage] ?? EXTRACTION_STAGE_MESSAGES.extracting
    const index = messageIndexRef.current % messages.length
    messageIndexRef.current++
    return messages[index]
  }, [])

  /* Build the extraction summary message on completion */
  const buildSummary = useCallback((status: ExtractionStatusResponse): string => {
    const platforms = Object.keys(platformUrls).map(getPlatformName)
    const platformList = platforms.length > 0
      ? platforms.join(', ')
      : 'your profiles'

    return `Extraction complete! I've gathered data from ${platformList}.`
  }, [platformUrls])

  useEffect(() => {
    if (!enabled || completedRef.current) return

    let isMounted = true

    const run = async () => {
      /* ---- Step 1: Submit extraction ---- */
      onProgress({ stage: 'submitting', message: 'Starting extraction...' })

      try {
        // Separate github/leetcode for backward compat with the API
        const githubUrl = platformUrls.github ?? undefined
        const leetcodeUrl = platformUrls.leetcode ?? undefined

        // All URLs go in platform_urls as well
        const res = await submitExtraction({
          candidate_name: candidateName,
          candidate_email: candidateEmail,
          github_url: githubUrl,
          leetcode_url: leetcodeUrl,
          platform_urls: platformUrls,
          resume: resumeFile ?? undefined,
        })

        if (!isMounted) return
        setJobId(res.job_id)

        onProgress({ stage: 'pending', message: getStageMessage('pending') })

        /* ---- Step 2: Poll for status ---- */
        pollCountRef.current = 0

        pollRef.current = setInterval(async () => {
          if (completedRef.current || !isMounted) {
            cleanup()
            return
          }

          pollCountRef.current++

          if (pollCountRef.current > MAX_POLLS) {
            cleanup()
            completedRef.current = true
            onProgress({ stage: 'timeout', message: 'Extraction is taking longer than expected...' })
            onError('Extraction timed out. Please try again.')
            return
          }

          try {
            const status = await getExtractionStatus(res.job_id)

            if (!isMounted) return

            if (status.status === 'extracted') {
              if (completedRef.current) return
              completedRef.current = true
              cleanup()

              const summary = buildSummary(status)
              onProgress({ stage: 'extracted', message: summary })

              const platforms = Object.keys(platformUrls).map(getPlatformName)
              onComplete({
                jobId: res.job_id,
                candidateName: status.candidate_name ?? candidateName,
                platformsExtracted: platforms,
              })
            } else if (status.status === 'failed') {
              completedRef.current = true
              cleanup()
              onProgress({ stage: 'failed', message: 'Extraction failed.' })
              onError(status.error ?? 'Data extraction failed. Please try again.')
            } else {
              // Still pending or extracting — cycle messages
              onProgress({
                stage: status.status as ExtractionStage,
                message: getStageMessage(status.status),
              })
            }
          } catch {
            // Network error during polling — keep trying silently
          }
        }, POLL_INTERVAL_MS)
      } catch (err: unknown) {
        if (!isMounted) return
        const msg = err instanceof Error ? err.message : 'Failed to start extraction'
        onProgress({ stage: 'failed', message: msg })
        onError(msg)
      }
    }

    run()

    return () => {
      isMounted = false
      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  const reset = useCallback(() => {
    cleanup()
    setJobId(null)
    pollCountRef.current = 0
    completedRef.current = false
    messageIndexRef.current = 0
  }, [cleanup])

  return { jobId, reset }
}
