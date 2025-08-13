import { Suspense } from 'react';
import EmployerDashboard from '@/components/employer/EmployerDashboard';

export const metadata = {
  title: 'Employer Dashboard - 100x Marketers',
  description: 'Manage your job postings, view applications, and find the best AI marketing talent.',
};

export default function EmployerDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <EmployerDashboard />
      </Suspense>
    </div>
  );
}