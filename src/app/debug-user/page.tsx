'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';

export default function DebugUserPage() {
  const { user, session, profile, loading, profileLoading } = useAuth();
  const [manualProfile, setManualProfile] = useState<Profile | null>(null);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');

  const checkManualProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setManualProfile(data);
      console.log('Manual profile check:', { data, error });
    } catch (error) {
      console.log('Manual profile check error:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      checkManualProfile();
    }
  }, [user, checkManualProfile]);

  const createProfile = async () => {
    if (!user) return;
    
    try {
      setCreating(true);
      setMessage('Creating profile...');
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          user_type: null,
          first_name: null,
          last_name: null
        })
        .select()
        .single();
      
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('Profile created successfully!');
        setManualProfile(data);
        // Refresh the auth context
        window.location.reload();
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            User Debug Information
          </h1>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Auth Status</h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
                <p><strong>Profile Loading:</strong> {profileLoading ? 'true' : 'false'}</p>
                <p><strong>User Exists:</strong> {user ? 'true' : 'false'}</p>
                <p><strong>Session Exists:</strong> {session ? 'true' : 'false'}</p>
                <p><strong>Profile Exists:</strong> {profile ? 'true' : 'false'}</p>
              </div>
            </div>

            {user && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">User Info</h2>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify({
                      id: user.id,
                      email: user.email,
                      created_at: user.created_at,
                      email_confirmed_at: user.email_confirmed_at
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Profile from AuthContext</h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(profile, null, 2)}
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Manual Profile Check</h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(manualProfile, null, 2)}
                </pre>
              </div>
              <button
                onClick={checkManualProfile}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Refresh Manual Check
              </button>
            </div>

            {user && !manualProfile && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Profile Missing</h3>
                <p className="text-yellow-700 mb-4">
                  Your user account exists but there&apos;s no profile record. This is causing the redirect loop.
                </p>
                <button
                  onClick={createProfile}
                  disabled={creating}
                  className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {creating ? 'Creating Profile...' : 'Create Profile Now'}
                </button>
                {message && (
                  <p className="mt-2 text-sm text-gray-700">{message}</p>
                )}
              </div>
            )}

            {manualProfile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Profile Found</h3>
                <p className="text-green-700 mb-4">
                  Your profile exists! You should now be able to access the role selection.
                </p>
                <button
                  onClick={() => window.location.href = '/select-role'}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                  Go to Role Selection
                </button>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Go Home
              </button>
              <button
                onClick={() => window.location.href = '/test-connection'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Test Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}