'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import {
  getSession,
  signInWithProvider,
  signOut as authSignOut,
  onAuthStateChange,
} from './supabase-auth'
import type { OAuthProvider } from './supabase-auth'

interface AuthContextValue {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (provider: OAuthProvider) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    let mounted = true

    async function restoreSession() {
      try {
        const currentSession = await getSession()
        if (mounted) {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)
        }
      } catch {
        // Session restoration failed — user is not authenticated
        if (mounted) {
          setSession(null)
          setUser(null)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      mounted = false
    }
  }, [])

  // Subscribe to auth state changes (login, logout, token refresh, cross-tab sync)
  useEffect(() => {
    const unsubscribe = onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = useCallback(async (provider: OAuthProvider) => {
    await signInWithProvider(provider)
    // Redirect happens — state updates via onAuthStateChange after redirect back
  }, [])

  const signOut = useCallback(async () => {
    await authSignOut()
    setSession(null)
    setUser(null)
  }, [])

  const value: AuthContextValue = {
    user,
    session,
    isAuthenticated: !!session,
    isLoading,
    signIn,
    signOut,
  }

  return <AuthContext value={value}>{children}</AuthContext>
}

/**
 * Access auth state and actions from any client component.
 * Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
