'use client';

import { useState } from 'react';
import { Send, Check, Loader2 } from 'lucide-react';
import { Job } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useApplicationStatus } from '@/hooks/useApplications';
import ApplicationModal from './ApplicationModal';

interface ApplyButtonProps {
  job: Job;
  className?: string;
}

export default function ApplyButton({ job, className = '' }: ApplyButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const { user, profile } = useAuth();
  const { hasApplied, loading } = useApplicationStatus(job.id);

  // Don't show apply button for employers or job owners
  if (!user || !profile || profile.user_type !== 'candidate') {
    return (
      <button
        onClick={() => window.location.href = '/login'}
        className={`inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${className}`}
      >
        <Send className="w-5 h-5 mr-3" />
        Sign in to Apply
      </button>
    );
  }

  if (loading) {
    return (
      <button
        disabled
        className={`inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gray-400 cursor-not-allowed ${className}`}
      >
        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
        Loading...
      </button>
    );
  }

  if (hasApplied) {
    return (
      <button
        disabled
        className={`inline-flex items-center justify-center px-8 py-4 border-2 border-green-200 text-lg font-semibold rounded-xl text-green-700 bg-green-50 cursor-not-allowed ${className}`}
      >
        <Check className="w-5 h-5 mr-3 text-green-600" />
        Application Submitted
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${className}`}
      >
        <Send className="w-5 h-5 mr-3" />
        Apply Now
      </button>

      <ApplicationModal
        job={job}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          // Refresh the page or update state to show "Already Applied"
          window.location.reload();
        }}
      />
    </>
  );
}