'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ForceCandidateSetupPage() {
  const router = useRouter()

  useEffect(() => {
    // Force redirect to candidate setup after a short delay
    const timer = setTimeout(() => {
      console.log('Force redirecting to candidate setup')
      router.push('/candidate-setup')
    }, 1000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Setting up your profile...</p>
        <p className="text-sm text-gray-500 mt-2">Redirecting to candidate setup...</p>
      </div>
    </div>
  )
}