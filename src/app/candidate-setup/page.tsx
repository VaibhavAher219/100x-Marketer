import { Suspense } from 'react';
import CandidateSetup from '@/components/candidate/CandidateSetup';

export const metadata = {
  title: 'Profile Setup - 100x Marketers',
  description: 'Set up your professional profile to discover amazing AI marketing opportunities.',
};

export default function CandidateSetupPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <CandidateSetup />
      </Suspense>
    </div>
  );
}