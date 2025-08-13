'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoadingScreen from '@/components/shared/LoadingScreen'

interface RouteGuardProps {
  children: React.ReactNode
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { user, profile, employer, candidate, loading, profileLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Public routes that don't need any checks
    const publicRoutes = ['/', '/jobs', '/login', '/signup']
    const isPublicRoute = publicRoutes.includes(pathname)

    if (isPublicRoute) {
      setIsReady(true)
      return
    }

    // For protected routes, wait for auth to load
    if (loading || profileLoading) {
      return
    }

    // Now handle protected routes
    console.log('RouteGuard - Protected route check:', pathname, {
      hasUser: !!user,
      hasProfile: !!profile,
      userType: profile?.user_type,
      hasEmployer: !!employer,
      hasCandidate: !!candidate
    })

    // If not authenticated, redirect to login
    if (!user) {
      router.push(`/login?redirectTo=${pathname}`)
      return
    }

    // If no profile, redirect to role selection
    if (!profile || !profile.user_type) {
      router.push('/select-role')
      return
    }

    // Handle role-specific routing
    if (profile.user_type === 'employer') {
      if (pathname === '/candidate-setup' || pathname === '/candidate-dashboard') {
        router.push('/employer-dashboard')
        return
      }
      if (pathname === '/employer-setup' && employer) {
        router.push('/employer-dashboard')
        return
      }
      if ((pathname === '/employer-dashboard' || pathname === '/post-job') && !employer) {
        router.push('/employer-setup')
        return
      }
    }

    if (profile.user_type === 'candidate') {
      if (pathname === '/employer-setup' || pathname === '/employer-dashboard' || pathname === '/post-job') {
        router.push('/candidate-dashboard')
        return
      }
      if (pathname === '/candidate-setup' && candidate) {
        router.push('/candidate-dashboard')
        return
      }
      if (pathname === '/candidate-dashboard' && !candidate) {
        router.push('/candidate-setup')
        return
      }
    }

    // If we get here, allow access
    setIsReady(true)
  }, [user, profile, employer, candidate, loading, profileLoading, pathname, router])

  // Show loading only if we're still checking auth state
  if (!isReady && (loading || profileLoading || (!pathname.startsWith('/') || pathname === '/' || pathname === '/jobs' || pathname === '/login' || pathname === '/signup' ? false : true))) {
    return <LoadingScreen message="Loading..." />
  }

  return <>{children}</>
}