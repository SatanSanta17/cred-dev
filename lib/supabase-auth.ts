import { supabase } from './supabase'
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js'

export type OAuthProvider = 'github' | 'google'

/**
 * Sign in with an OAuth provider via Supabase Auth.
 * Opens a popup/redirect to the provider's consent screen.
 */
export async function signInWithProvider(provider: OAuthProvider, redirectTo?: string) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectTo ?? `${window.location.origin}/chat`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * Sign out the current user and clear the session.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Get the current session (access token + user) or null if not authenticated.
 */
export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  return data.session
}

/**
 * Get the current authenticated user or null.
 */
export async function getUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    // getUser returns an error when not authenticated — not a crash
    return null
  }

  return data.user
}

/**
 * Get the current access token for API calls.
 * Returns null if not authenticated.
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession()
  return session?.access_token ?? null
}

/**
 * Subscribe to auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED).
 * Returns an unsubscribe function for cleanup.
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const { data } = supabase.auth.onAuthStateChange(callback)
  return data.subscription.unsubscribe
}
