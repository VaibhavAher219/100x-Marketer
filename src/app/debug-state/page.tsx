'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function DebugStatePage() {
  const { 
    user, 
    profile, 
    employer, 
    candidate, 
    loading, 
    profileLoading, 
    hasCompletedSetup,
    isEmployer,
    isCandidate,
    hasProfile
  } = useAuth()
  const router = useRouter()

  const debugInfo = {
    // Auth State
    loading,
    profileLoading,
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    
    // Profile State
    hasProfile,
    profileId: profile?.id,
    userType: profile?.user_type,
    firstName: profile?.first_name,
    lastName: profile?.last_name,
    
    // Role-specific State
    isEmployer,
    isCandidate,
    hasEmployer: !!employer,
    hasCandidate: !!candidate,
    hasCompletedSetup,
    
    // Employer Data
    employerId: employer?.id,
    companyName: employer?.company_name,
    
    // Candidate Data
    candidateId: candidate?.id,
    candidateHeadline: candidate?.headline,
    
    // Computed States
    shouldGoToRoleSelection: !profile || !profile.user_type,
    shouldGoToEmployerSetup: profile?.user_type === 'employer' && !employer,
    shouldGoToCandidateSetup: profile?.user_type === 'candidate' && !candidate,
    shouldGoToEmployerDashboard: profile?.user_type === 'employer' && !!employer,
    shouldGoToCandidateDashboard: profile?.user_type === 'candidate' && !!candidate,
  }

  const testNavigation = (path: string) => {
    console.log(`Testing navigation to: ${path}`)
    router.push(path)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Auth State Debug</h1>
        
        {/* Current State */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Current State</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Raw Data */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">User Object</h3>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Profile Object</h3>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Employer Object</h3>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
              {JSON.stringify(employer, null, 2)}
            </pre>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Candidate Object</h3>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
              {JSON.stringify(candidate, null, 2)}
            </pre>
          </div>
        </div>

        {/* Navigation Tests */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Test Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => testNavigation('/select-role')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Role Selection
            </button>
            <button
              onClick={() => testNavigation('/candidate-setup')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Candidate Setup
            </button>
            <button
              onClick={() => testNavigation('/candidate-dashboard')}
              className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
            >
              Candidate Dashboard
            </button>
            <button
              onClick={() => testNavigation('/employer-setup')}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Employer Setup
            </button>
            <button
              onClick={() => testNavigation('/employer-dashboard')}
              className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800"
            >
              Employer Dashboard
            </button>
            <button
              onClick={() => testNavigation('/post-job')}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Post Job
            </button>
            <button
              onClick={() => testNavigation('/')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Home
            </button>
            <button
              onClick={() => testNavigation('/jobs')}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
            >
              Jobs
            </button>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">🎯 Recommendations</h3>
          <div className="space-y-2">
            {debugInfo.shouldGoToRoleSelection && (
              <div className="p-3 bg-blue-100 text-blue-800 rounded">
                ➡️ Should go to Role Selection (no profile or user_type)
              </div>
            )}
            {debugInfo.shouldGoToEmployerSetup && (
              <div className="p-3 bg-purple-100 text-purple-800 rounded">
                ➡️ Should go to Employer Setup (employer role but no employer profile)
              </div>
            )}
            {debugInfo.shouldGoToCandidateSetup && (
              <div className="p-3 bg-green-100 text-green-800 rounded">
                ➡️ Should go to Candidate Setup (candidate role but no candidate profile)
              </div>
            )}
            {debugInfo.shouldGoToEmployerDashboard && (
              <div className="p-3 bg-purple-200 text-purple-900 rounded">
                ✅ Should go to Employer Dashboard (complete employer)
              </div>
            )}
            {debugInfo.shouldGoToCandidateDashboard && (
              <div className="p-3 bg-green-200 text-green-900 rounded">
                ✅ Should go to Candidate Dashboard (complete candidate)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}