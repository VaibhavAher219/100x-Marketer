'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface ClientRedirectProps {
  children: React.ReactNode
}

export default function ClientRedirect({ children }: ClientRedirectProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Only redirect if we're on login/signup pages and user is authenticated
    if (!loading && user && (pathname === '/login' || pathname === '/signup')) {
      setIsRedirecting(true)
      const redirectTo = searchParams.get('redirectTo') || '/jobs'
      router.push(redirectTo)
    }
  }, [user, loading, router, searchParams, pathname])

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If user is authenticated and on auth pages, don't show content (will redirect)
  if (user && (pathname === '/login' || pathname === '/signup') || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Redirecting...</div>
      </div>
    )
  }

  return <>{children}</>
}