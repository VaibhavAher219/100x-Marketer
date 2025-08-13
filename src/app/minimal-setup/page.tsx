'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MinimalSetupPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate form submission
    setTimeout(() => {
      alert('Setup completed! This would normally create your candidate profile.')
      router.push('/candidate-dashboard')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Minimal Candidate Setup</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your first name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your last name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Headline
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., AI Marketing Specialist"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
          </button>
        </form>
        
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600 mb-4">Test Navigation:</p>
          <div className="space-y-2">
            <a 
              href="/debug-state" 
              className="block text-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Debug State
            </a>
            <a 
              href="/bypass-test" 
              className="block text-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Bypass Test
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}