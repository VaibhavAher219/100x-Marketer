'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Eye, MessageSquare, Calendar, User, Briefcase } from 'lucide-react';
import { Application, ApplicationStatus, ApplicationFilters } from '@/types/database';
import { useApplications } from '@/hooks/useApplications';
import ApplicationCard from './ApplicationCard';

interface ApplicationsListProps {
  employerId?: string;
}

export default function ApplicationsList({ employerId }: ApplicationsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('');
  const [jobFilter, setJobFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const filters: ApplicationFilters = useMemo(() => ({
    ...(statusFilter && { status: statusFilter }),
    ...(jobFilter && { job_id: jobFilter }),
    ...(searchTerm && { search: searchTerm })
  }), [statusFilter, jobFilter, searchTerm]);

  const { applications, loading, updateStatus } = useApplications(filters);

  // Get unique jobs for filter dropdown
  const uniqueJobs = useMemo(() => {
    const jobs = applications
      .map(app => app.job)
      .filter((job, index, self) => job && self.findIndex(j => j?.id === job.id) === index);
    return jobs;
  }, [applications]);

  const handleStatusUpdate = async (applicationId: string, status: ApplicationStatus, notes?: string) => {
    await updateStatus(applicationId, status, notes);
  };

  const groupedApplications = useMemo(() => {
    const grouped = applications.reduce((acc, app) => {
      const jobTitle = app.job?.title || 'Unknown Job';
      if (!acc[jobTitle]) {
        acc[jobTitle] = [];
      }
      acc[jobTitle].push(app);
      return acc;
    }, {} as Record<string, Application[]>);

    // Sort applications within each group by date
    Object.keys(grouped).forEach(jobTitle => {
      grouped[jobTitle].sort((a, b) => 
        new Date(b.application_date).getTime() - new Date(a.application_date).getTime()
      );
    });

    return grouped;
  }, [applications]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search candidates..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | '')}
          >
            <option value="">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Rejected">Rejected</option>
            <option value="Hired">Hired</option>
          </select>

          {/* Job Filter */}
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
          >
            <option value="">All Jobs</option>
            {uniqueJobs.map((job) => (
              <option key={job?.id} value={job?.id}>
                {job?.title}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setJobFilter('');
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Applications Count */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Applications ({applications.length})
        </h2>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter || jobFilter
              ? 'Try adjusting your filters to see more applications.'
              : 'Applications will appear here when candidates apply for your jobs.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedApplications).map(([jobTitle, jobApplications]) => (
            <div key={jobTitle} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">{jobTitle}</h3>
                <p className="text-sm text-gray-600">{jobApplications.length} applications</p>
              </div>
              <div className="divide-y divide-gray-200">
                {jobApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onStatusChange={handleStatusUpdate}
                    onViewDetails={setSelectedApplication}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onStatusChange={handleStatusUpdate}
        />
      )}
    </div>
  );
}

// Application Detail Modal Component
interface ApplicationDetailModalProps {
  application: Application;
  onClose: () => void;
  onStatusChange: (id: string, status: ApplicationStatus, notes?: string) => Promise<void>;
}

function ApplicationDetailModal({ application, onClose, onStatusChange }: ApplicationDetailModalProps) {
  const [notes, setNotes] = useState(application.notes || '');
  const [status, setStatus] = useState(application.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onStatusChange(application.id, status, notes);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              {(application.candidate?.headline || 'Candidate')} • {application.job?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Candidate Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Candidate Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p><strong>Candidate:</strong> {application.candidate?.headline || '—'}</p>
              <p><strong>Headline:</strong> {application.candidate?.headline || 'Not provided'}</p>
              <p><strong>Location:</strong> {application.candidate?.current_location || 'Not provided'}</p>
              <p><strong>Applied:</strong> {new Date(application.application_date).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Cover Letter</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{application.cover_letter}</p>
            </div>
          </div>

          {/* Resume */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Resume</h3>
            <a
              href={application.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Resume
            </a>
          </div>

          {/* Status and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Applied">Applied</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Rejected">Rejected</option>
                <option value="Hired">Hired</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Private Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add private notes about this candidate..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}