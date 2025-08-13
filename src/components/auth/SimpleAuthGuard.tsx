'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoadingScreen from '@/components/shared/LoadingScreen'

interface SimpleAuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireRole?: 'employer' | 'candidate'
  requireSetup?: boolean
}

export default function SimpleAuthGuard({ 
  children, 
  requireAuth = true, 
  requireRole,
  requireSetup = false 
}: SimpleAuthGuardProps) {
  const { user, profile, employer, candidate, loading, profileLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // Wait for auth to load
    if (loading || profileLoading) return

    // Prevent multiple redirects
    if (hasRedirected) return

    console.log('SimpleAuthGuard check:', {
      pathname,
      requireAuth,
      requireRole,
      requireSetup,
      hasUser: !!user,
      hasProfile: !!profile,
      userType: profile?.user_type,
      hasEmployer: !!employer,
      hasCandidate: !!candidate
    })

    // Check authentication requirement
    if (requireAuth && !user) {
      console.log('No user, redirecting to login')
      setHasRedirected(true)
      router.push(`/login?redirectTo=${pathname}`)
      return
    }

    // If no profile or role, redirect to role selection
    if (requireAuth && (!profile || !profile.user_type)) {
      console.log('No profile or role, redirecting to role selection')
      setHasRedirected(true)
      router.push('/select-role')
      return
    }

    // Check role requirement - but allow setup pages for the correct role
    if (requireRole && profile && profile.user_type !== requireRole) {
      console.log('Wrong role, redirecting to appropriate dashboard')
      setHasRedirected(true)
      const dashboardPath = profile.user_type === 'employer' ? '/employer-dashboard' : '/candidate-dashboard'
      router.push(dashboardPath)
      return
    }

    // Check setup requirement - only for dashboard pages, not setup pages
    if (requireSetup && requireRole && profile && profile.user_type === requireRole) {
      if (requireRole === 'employer' && !employer) {
        console.log('Employer needs setup, redirecting')
        setHasRedirected(true)
        router.push('/employer-setup')
        return
      }
      if (requireRole === 'candidate' && !candidate) {
        console.log('Candidate needs setup, redirecting')
        setHasRedirected(true)
        router.push('/candidate-setup')
        return
      }
    }

    // If we get here, access is allowed
    console.log('Access allowed for:', pathname)
  }, [user, profile, employer, candidate, loading, profileLoading, requireAuth, requireRole, requireSetup, router, pathname, hasRedirected])

  // Show loading while checking
  if (loading || profileLoading) {
    return <LoadingScreen message="Loading..." />
  }

  // If we need auth but don't have it, show loading (redirect is happening)
  if (requireAuth && !user) {
    return <LoadingScreen message="Redirecting to login..." />
  }

  // If we need a profile but don't have it, show loading (redirect is happening)
  if (requireAuth && (!profile || !profile.user_type)) {
    return <LoadingScreen message="Setting up profile..." />
  }

  // If we need a specific role but have wrong role, show loading (redirect is happening)
  if (requireRole && profile && profile.user_type !== requireRole) {
    return <LoadingScreen message="Redirecting..." />
  }

  // If we need setup but don't have it, show loading (redirect is happening)
  if (requireSetup && requireRole && profile && profile.user_type === requireRole) {
    if (requireRole === 'employer' && !employer) {
      return <LoadingScreen message="Setting up company profile..." />
    }
    if (requireRole === 'candidate' && !candidate) {
      return <LoadingScreen message="Setting up candidate profile..." />
    }
  }

  return <>{children}</>
}