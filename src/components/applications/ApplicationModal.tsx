'use client';

import { useState } from 'react';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import { Job, ApplicationFormData } from '@/types/database';
import { useApplications, useFileUpload } from '@/hooks/useApplications';

interface ApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ApplicationModal({ job, isOpen, onClose, onSuccess }: ApplicationModalProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    cover_letter: '',
    resume_file: null as any
  });
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { submitApplication } = useApplications();
  const { uploading, progress } = useFileUpload();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cover_letter.trim() || !formData.resume_file) {
      return;
    }

    setSubmitting(true);
    try {
      const success = await submitApplication(job.id, formData);
      if (success) {
        onClose();
        onSuccess?.();
        // Reset form
        setFormData({ cover_letter: '', resume_file: null as any });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (file: File) => {
    setFormData(prev => ({ ...prev, resume_file: file }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const isFormValid = formData.cover_letter.trim().length > 0 && formData.resume_file;
  const isLoading = submitting || uploading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Apply for Position</h2>
            <p className="text-lg text-gray-600 mt-1 font-medium">{job.title}</p>
            <p className="text-sm text-gray-500 mt-1">Complete the form below to submit your application</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Cover Letter */}
          <div>
            <label htmlFor="cover_letter" className="block text-lg font-semibold text-gray-900 mb-3">
              Cover Letter *
            </label>
            <div className="relative">
              <textarea
                id="cover_letter"
                rows={10}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-700 leading-relaxed transition-all duration-200"
                placeholder="Dear Hiring Manager,

I am excited to apply for this position because..."
                value={formData.cover_letter}
                onChange={(e) => setFormData(prev => ({ ...prev, cover_letter: e.target.value }))}
                maxLength={5000}
                disabled={isLoading}
                required
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                {formData.cover_letter.length}/5000
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Write a compelling cover letter that highlights your relevant experience and enthusiasm for the role.
            </p>
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Resume *
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 scale-105'
                  : formData.resume_file
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {formData.resume_file ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-green-700">
                      {formData.resume_file.name}
                    </p>
                    <p className="text-sm text-green-600">
                      {(formData.resume_file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, resume_file: null as any }))}
                    className="text-sm text-red-600 hover:text-red-700 underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Drop your resume here, or{' '}
                      <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-semibold underline">
                        browse files
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                          disabled={isLoading}
                        />
                      </label>
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports PDF, DOC, and DOCX files up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center justify-between text-sm text-blue-700 mb-2">
                  <span className="font-medium">Uploading your resume...</span>
                  <span className="font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Your application will be sent directly to the employer
            </p>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-base font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-all duration-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="px-8 py-3 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>{isLoading ? 'Submitting Application...' : 'Submit Application'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}