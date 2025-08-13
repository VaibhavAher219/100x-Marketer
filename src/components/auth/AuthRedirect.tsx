'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AuthRedirectProps {
  children: React.ReactNode
}

export default function AuthRedirect({ children }: AuthRedirectProps) {
  const { user, profile, employer, candidate, loading, profileLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // Wait for both auth and profile to load
    if (loading || profileLoading) return
    
    // Prevent multiple redirects
    if (hasRedirected) return

    // If user is logged in and on auth pages, redirect them appropriately
    if (user) {
      const redirectTo = searchParams.get('redirectTo')
      
      console.log('AuthRedirect - User logged in, determining redirect:', {
        hasUser: !!user,
        hasProfile: !!profile,
        userType: profile?.user_type,
        hasEmployer: !!employer,
        hasCandidate: !!candidate,
        redirectTo
      })
      
      setHasRedirected(true)
      
      // Determine where to redirect based on user state
      let targetPath = '/jobs' // fallback
      
      if (!profile || !profile.user_type) {
        // No profile or no role selected - go to role selection
        targetPath = '/select-role'
      } else if (profile.user_type === 'employer') {
        if (!employer) {
          // Employer role but no employer profile - go to setup
          targetPath = '/employer-setup'
        } else {
          // Complete employer - go to dashboard
          targetPath = '/employer-dashboard'
        }
      } else if (profile.user_type === 'candidate') {
        if (!candidate) {
          // Candidate role but no candidate profile - go to setup
          targetPath = '/candidate-setup'
        } else {
          // Complete candidate - go to dashboard
          targetPath = '/candidate-dashboard'
        }
      }
      
      // If they have a specific redirect destination and it's safe, use it
      if (redirectTo && (employer || candidate)) {
        // Only redirect to the requested page if user has completed setup
        targetPath = redirectTo
      }
      
      console.log('AuthRedirect - Redirecting to:', targetPath)
      router.push(targetPath)
    }
  }, [user, profile, employer, candidate, loading, profileLoading, searchParams, router, hasRedirected])

  // Show loading while checking auth state
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If user is authenticated, show redirecting message
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Redirecting...</div>
        </div>
      </div>
    )
  }

  // User is not authenticated, show the login/signup form
  return <>{children}</>
}