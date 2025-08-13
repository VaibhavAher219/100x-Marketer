import { Suspense } from 'react';
import CandidateDashboard from '@/components/candidate/CandidateDashboard';

export const metadata = {
  title: 'Candidate Dashboard - 100x Marketers',
  description: 'Track your job applications, manage your profile, and discover new opportunities.',
};

export default function CandidateDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <CandidateDashboard />
      </Suspense>
    </div>
  );
}