import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = 'https://lkdltnrpyuyuguttuaiy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrZGx0bnJweXV5dWd1dHR1YWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3OTI4MjgsImV4cCI6MjA2ODM2ODgyOH0.0CsOTdMhFAbJUjP-goS__u24TA4Zldk5bxmBTlll6T0'

export const createSupabaseServerClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

import { createClient } from '@supabase/supabase-js'

// This is the client-side client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
