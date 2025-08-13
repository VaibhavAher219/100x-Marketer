import { Suspense } from 'react';
import JobPostingForm from '@/components/jobs/JobPostingForm';

export const metadata = {
  title: 'Post a Job - 100x Marketers',
  description: 'Post your AI marketing job opportunity and find the perfect candidate.',
};

export default function PostJobPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <JobPostingForm />
      </Suspense>
    </div>
  );
}