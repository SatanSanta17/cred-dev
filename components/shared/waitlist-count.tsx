'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface WaitlistCountProps {
  className?: string
  showLabel?: boolean
  userType?: 'developer' | 'recruiter' | 'all'
  hideUntil?: number // Hide count until this threshold is reached
  fallbackText?: string // Text to show when count is below threshold
}

export function WaitlistCount({ 
  className = '', 
  showLabel = true,
  userType = 'all',
  hideUntil = 0,
  fallbackText = ''
}: WaitlistCountProps) {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial fetch
    async function fetchCount() {
      try {
        let query = supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true })

        // Filter by user type if specified
        if (userType !== 'all') {
          query = query.eq('user_type', userType)
        }

        const { count, error } = await query

        if (error) throw error
        
        setCount(count || 0)
      } catch (error) {
        console.error('Error fetching waitlist count:', error)
        setCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchCount()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('waitlist-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'waitlist',
        },
        () => {
          // Increment count when new entry is added
          setCount(prev => (prev || 0) + 1)
        }
      )
      .subscribe()

    // Optional: Refresh count every 30 seconds
    const interval = setInterval(fetchCount, 30000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [userType])

  if (loading) {
    return <span className={className}>...</span>
  }

  const displayCount = count || 0

  // If count is below threshold and fallback text exists, show fallback
  if (hideUntil > 0 && displayCount < hideUntil && fallbackText) {
    return <span className={className}>{fallbackText}</span>
  }

  // If count is below threshold and no fallback, return null (hide completely)
  if (hideUntil > 0 && displayCount < hideUntil && !fallbackText) {
    return null
  }

  // Determine the label based on user type
  const getLabel = () => {
    if (!showLabel) return null
    
    if (userType === 'developer') {
      return `${displayCount.toLocaleString()}+ developers on the waitlist`
    } else if (userType === 'recruiter') {
      return `${displayCount.toLocaleString()}+ recruiters on the waitlist`
    } else {
      return `${displayCount.toLocaleString()}+ people on the waitlist`
    }
  }

  return (
    <span className={className}>
      {showLabel ? (
        <>Join <strong>{displayCount.toLocaleString()}</strong>+ {userType === 'developer' ? 'developers' : userType === 'recruiter' ? 'recruiters' : 'people'} on the waitlist</>
      ) : (
        <strong>{displayCount.toLocaleString()}</strong>
      )}
    </span>
  )
}
