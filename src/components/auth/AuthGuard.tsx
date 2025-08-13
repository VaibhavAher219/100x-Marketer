'use client'


import { useAuth } from '@/contexts/AuthContext'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthGuard({ 
  children, 
  fallback = (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Verifying authentication...</p>
      </div>
    </div>
  )
}: AuthGuardProps) {
  const { user, loading } = useAuth()

  // Show loading state while checking auth
  if (loading) {
    return <>{fallback}</>
  }

  // If no user, the middleware should have redirected them
  // But as a fallback, show the loading state
  if (!user) {
    return <>{fallback}</>
  }

  // User is authenticated, show the protected content
  return <>{children}</>
}