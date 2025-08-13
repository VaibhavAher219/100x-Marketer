'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/shared/Header';
import ApplicationsList from '@/components/applications/ApplicationsList';
import CandidateApplications from '@/components/applications/CandidateApplications';
import LoadingScreen from '@/components/shared/LoadingScreen';

export default function ApplicationsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <LoadingScreen />;

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-8">
        {profile.user_type === 'employer' ? (
          <ApplicationsList />
        ) : profile.user_type === 'candidate' ? (
          <CandidateApplications />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-8">
              You need to complete your profile setup to access applications.
            </p>
            <a
              href="/select-role"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Complete Setup
            </a>
          </div>
        )}
      </div>
    </div>
  );
}