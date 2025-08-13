'use client';

import { useState } from 'react';
import { Calendar, MapPin, DollarSign, Building, Eye, Trash2, AlertCircle } from 'lucide-react';
import { Application, ApplicationStatus } from '@/types/database';
import { useApplications } from '@/hooks/useApplications';

const statusColors = {
  Applied: 'bg-blue-100 text-blue-800 border-blue-200',
  Reviewed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Shortlisted: 'bg-green-100 text-green-800 border-green-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
  Hired: 'bg-purple-100 text-purple-800 border-purple-200'
};

const statusIcons = {
  Applied: '📝',
  Reviewed: '👀',
  Shortlisted: '⭐',
  Rejected: '❌',
  Hired: '🎉'
};

export default function CandidateApplications() {
  const { applications, loading, withdrawApplication } = useApplications();
  const [withdrawing, setWithdrawing] = useState<string | null>(null);

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }

    setWithdrawing(applicationId);
    try {
      await withdrawApplication(applicationId);
    } finally {
      setWithdrawing(null);
    }
  };

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
        <p className="text-gray-600 mb-6">
          You haven't applied for any jobs yet. Start browsing opportunities to find your next role.
        </p>
        <a
          href="/jobs"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Browse Jobs
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
        <p className="text-sm text-gray-600">{applications.length} applications</p>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((application) => (
          <div key={application.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {application.job?.title}
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[application.status]}`}>
                      <span className="mr-1">{statusIcons[application.status]}</span>
                      {application.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      {application.job?.employer_id ? 'Company' : 'Company Name'}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {application.job?.location}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {formatSalary(application.job?.salary_min ?? undefined, application.job?.salary_max ?? undefined)}
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    Applied on {formatDate(application.application_date)}
                    {application.reviewed_at && (
                      <span className="ml-4">
                        • Last updated {formatDate(application.reviewed_at)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <a
                    href={`/jobs/${application.job?.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Job
                  </a>
                  
                  {application.status === 'Applied' && (
                    <button
                      onClick={() => handleWithdraw(application.id)}
                      disabled={withdrawing === application.id}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                    >
                      {withdrawing === application.id ? (
                        <>
                          <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-red-300 border-t-red-600"></div>
                          Withdrawing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Withdraw
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Cover Letter Preview */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Cover Letter</h4>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {application.cover_letter}
                </p>
              </div>

              {/* Resume Link */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <a
                  href={application.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Submitted Resume
                </a>
              </div>

              {/* Status Timeline */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      ['Applied', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'].includes(application.status)
                        ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-gray-600">Applied</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      ['Reviewed', 'Shortlisted', 'Rejected', 'Hired'].includes(application.status)
                        ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-gray-600">Under Review</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      ['Shortlisted', 'Hired'].includes(application.status)
                        ? 'bg-green-500' 
                        : application.status === 'Rejected'
                        ? 'bg-red-500'
                        : 'bg-gray-300'
                    }`}></div>
                    <span className="text-gray-600">
                      {application.status === 'Rejected' ? 'Rejected' : 'Decision'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}