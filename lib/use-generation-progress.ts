'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getSSEUrl } from './api'

export interface ProgressData {
  stage: string
  percentage: number
  message: string
  status?: string
  error?: string
}

// Fallback messages when SSE disconnects — cycle every 30s
const FALLBACK_MESSAGES = [
  'Analyzing your GitHub repositories and commit patterns...',
  'Cross-referencing LeetCode submissions with problem difficulty...',
  'Evaluating code quality across your public contributions...',
  'Generating comprehensive technical assessment...',
  'Building your credibility profile from multiple data sources...',
  'Almost there — finalizing your developer insights...',
]

export function useGenerationProgress(jobId: string | null, enabled: boolean) {
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null)
  const fallbackIndexRef = useRef(0)

  const startFallback = useCallback(() => {
    if (fallbackTimerRef.current) return

    const tick = () => {
      const msg = FALLBACK_MESSAGES[fallbackIndexRef.current % FALLBACK_MESSAGES.length]
      setProgress((prev) => ({
        stage: prev?.stage || 'generating',
        percentage: Math.min((prev?.percentage || 10) + 2, 90),
        message: msg,
      }))
      fallbackIndexRef.current++
    }

    tick()
    fallbackTimerRef.current = setInterval(tick, 30000)
  }, [])

  const stopFallback = useCallback(() => {
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!jobId || !enabled) return

    const url = getSSEUrl(jobId)
    const es = new EventSource(url)
    eventSourceRef.current = es

    es.onopen = () => {
      setIsConnected(true)
      setError(null)
      stopFallback()
    }

    es.onmessage = (event) => {
      try {
        const data: ProgressData = JSON.parse(event.data)
        setProgress(data)
        stopFallback()

        if (data.status === 'completed' || data.status === 'failed') {
          es.close()
          setIsConnected(false)
          if (data.status === 'failed') {
            setError(data.error || 'Report generation failed')
          }
        }
      } catch {
        // ignore malformed messages
      }
    }

    es.onerror = () => {
      setIsConnected(false)
      // Don't set error immediately — SSE reconnects automatically
      // Start fallback messages instead
      startFallback()
    }

    return () => {
      es.close()
      eventSourceRef.current = null
      setIsConnected(false)
      stopFallback()
    }
  }, [jobId, enabled, startFallback, stopFallback])

  const reset = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    stopFallback()
    setProgress(null)
    setIsConnected(false)
    setError(null)
    fallbackIndexRef.current = 0
  }, [stopFallback])

  return { progress, isConnected, error, reset }
}
