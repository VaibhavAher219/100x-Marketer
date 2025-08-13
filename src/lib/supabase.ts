import { createClient } from '@supabase/supabase-js'

// Get environment variables directly with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create client with fallback values to prevent crashes
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Only add auth state listener if we have valid credentials
if (supabaseUrl && supabaseAnonKey && typeof window !== 'undefined') {
  console.log('Supabase client initialized successfully')
}