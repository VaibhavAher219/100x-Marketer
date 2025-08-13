'use client';

import { useAuth } from '@/contexts/AuthContext';
import RoleSelection from '@/components/role/RoleSelection';

export default function TestRoleSelectPage() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Not authenticated</h2>
          <p className="text-gray-600 mt-2">Please log in first.</p>
          <a href="/login" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-4 bg-yellow-100 border-b border-yellow-200">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-yellow-800">
            <strong>Test Page:</strong> This bypasses middleware to test role selection directly.
            User: {user.email} | Profile: {profile ? 'exists' : 'missing'} | User Type: {profile?.user_type || 'none'}
          </p>
        </div>
      </div>
      <RoleSelection />
    </div>
  );
}