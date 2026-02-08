import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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