'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function DebugAuthPage() {
  const { user, session, profile, loading, profileLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<{
    user: { id: string; email: string | undefined } | null;
    session: { expires_at: number | undefined } | null;
    profile: unknown;
    loading: boolean;
    profileLoading: boolean;
    timestamp: string;
  }>({
    user: null,
    session: null,
    profile: null,
    loading: false,
    profileLoading: false,
    timestamp: ''
  });

  useEffect(() => {
    setDebugInfo({
      user: user ? { id: user.id, email: user.email } : null,
      session: session ? { expires_at: session.expires_at } : null,
      profile: profile,
      loading,
      profileLoading,
      timestamp: new Date().toISOString()
    });
  }, [user, session, profile, loading, profileLoading]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Auth Debug Information
          </h1>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Loading States</h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p><strong>Auth Loading:</strong> {loading ? 'true' : 'false'}</p>
                <p><strong>Profile Loading:</strong> {profileLoading ? 'true' : 'false'}</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">User Info</h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(debugInfo.user, null, 2)}
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Profile Info</h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(debugInfo.profile, null, 2)}
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Full Debug Info</h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Homepage
              </button>
              <button
                onClick={() => window.location.href = '/setup-check'}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Check Database Setup
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}