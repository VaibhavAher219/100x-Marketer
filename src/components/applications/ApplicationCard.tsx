'use client';

import { useState } from 'react';
import { User, Calendar, Eye, MessageSquare, ChevronDown } from 'lucide-react';
import { Application, ApplicationStatus } from '@/types/database';

interface ApplicationCardProps {
  application: Application;
  onStatusChange: (id: string, status: ApplicationStatus, notes?: string) => Promise<void>;
  onViewDetails: (application: Application) => void;
}

const statusColors = {
  Applied: 'bg-blue-100 text-blue-800',
  Reviewed: 'bg-yellow-100 text-yellow-800',
  Shortlisted: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Hired: 'bg-purple-100 text-purple-800'
};

export default function ApplicationCard({ application, onStatusChange, onViewDetails }: ApplicationCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    setUpdating(true);
    try {
      await onStatusChange(application.id, newStatus);
      setShowActions(false);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Candidate Avatar */}
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-gray-500" />
          </div>

          {/* Candidate Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-1">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {application.candidate?.headline || 'Candidate'}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[application.status]}`}>
                {application.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2 truncate">
              {application.candidate?.headline || 'No headline provided'}
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Applied {formatDate(application.application_date)}
              </div>
              {application.candidate?.current_location && (
                <span>{application.candidate.current_location}</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewDetails(application)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </button>

          {/* Status Change Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              disabled={updating}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Change Status'}
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>

            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  {(['Applied', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'] as ApplicationStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={status === application.status}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                        status === application.status ? 'bg-gray-50 text-gray-500' : 'text-gray-700'
                      }`}
                    >
                      {status === application.status && '✓ '}
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cover Letter Preview */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 line-clamp-2">
          {application.cover_letter.length > 150 
            ? `${application.cover_letter.substring(0, 150)}...`
            : application.cover_letter
          }
        </p>
      </div>

      {/* Notes Preview */}
      {application.notes && (
        <div className="mt-2 p-3 bg-yellow-50 rounded-md">
          <div className="flex items-start">
            <MessageSquare className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-yellow-800 line-clamp-1">
              <strong>Note:</strong> {application.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}