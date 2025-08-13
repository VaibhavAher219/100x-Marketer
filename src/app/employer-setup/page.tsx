import { Suspense } from 'react';
import EmployerSetup from '@/components/employer/EmployerSetup';

export const metadata = {
  title: 'Company Setup - 100x Marketers',
  description: 'Set up your company profile to start posting jobs and finding great candidates.',
};

export default function EmployerSetupPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <EmployerSetup />
      </Suspense>
    </div>
  );
}