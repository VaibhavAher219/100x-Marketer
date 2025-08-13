'use client'

import { useAuth } from '@/hooks/useAuth'
import { useSearchParams } from 'next/navigation'

export default function AuthDebug() {
  const { user, loading, session } = useAuth()
  const searchParams = useSearchParams()
  
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded text-xs max-w-sm z-50">
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>User: {user ? user.email : 'null'}</div>
      <div>Session: {session ? 'exists' : 'null'}</div>
      <div>RedirectTo: {searchParams.get('redirectTo') || 'none'}</div>
      <div>URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</div>
    </div>
  )
}