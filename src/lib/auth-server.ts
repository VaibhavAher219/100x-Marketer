import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

// Server-side auth helper for API routes
export async function getServerSession() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  return { session, error, supabase }
}

// Middleware auth helper
export async function getMiddlewareSession(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
      },
    }
  )

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  return { session, error, supabase }
}

// Auth guard for API routes
export function withAuth(handler: (req: NextRequest, session: { session: unknown }) => Promise<Response>) {
  return async (req: NextRequest) => {
    const { session, error } = await getMiddlewareSession(req)

    if (!session || error) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return handler(req, { session })
  }
}