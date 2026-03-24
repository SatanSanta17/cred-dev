import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey)

// Type definitions for your database
export type WaitlistEntry = {
  id: string
  email: string
  user_type: 'developer' | 'recruiter'
  github_profile: string | null
  organization: string | null
  willing_to_connect: boolean
  created_at: string
}