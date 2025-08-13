import { useState, useEffect, useCallback } from 'react';
import { Application, ApplicationStatus, ApplicationFilters, ApplicationFormData } from '@/types/database';
import { applicationService, fileService, ApplicationError } from '@/lib/applications';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/shared/Toast';

interface UseApplicationsReturn {
  applications: Application[];
  loading: boolean;
  error: string | null;
  submitApplication: (jobId: string, data: ApplicationFormData) => Promise<boolean>;
  updateStatus: (id: string, status: ApplicationStatus, notes?: string) => Promise<void>;
  withdrawApplication: (id: string) => Promise<void>;
  hasApplied: (jobId: string) => boolean;
  refetch: () => void;
}

export function useApplications(filters?: ApplicationFilters): UseApplicationsReturn {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile, candidate } = useAuth();
  const { showToast } = useToast();

  const fetchApplications = useCallback(async () => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      setError(null);

      let data: Application[];
      if (profile.user_type === 'candidate') {
        // Get candidate's applications
        const candidateData = await applicationService.getCandidateApplications(profile.id);
        data = candidateData;
      } else if (profile.user_type === 'employer') {
        // Get employer's job applications
        const employerData = await applicationService.getEmployerApplications(profile.id, filters);
        data = employerData;
      } else {
        data = [];
      }

      setApplications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications');
      showToast({ type: 'error', title: 'Failed to load applications' });
    } finally {
      setLoading(false);
    }
  }, [user, profile, filters, showToast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const submitApplication = async (jobId: string, data: ApplicationFormData): Promise<boolean> => {
    if (!user || !profile || profile.user_type !== 'candidate' || !candidate) {
      showToast({ type: 'error', title: 'You must be logged in as a candidate to apply' });
      return false;
    }

    try {
      setError(null);

      // Upload resume
      const resumeUrl = await fileService.uploadResume(data.resume_file, candidate.id, jobId);

      // Submit application
      const application = await applicationService.submitApplication({
        job_id: jobId,
        candidate_id: candidate.id,
        cover_letter: data.cover_letter,
        resume_url: resumeUrl
      });

      // Update local state
      setApplications(prev => [application, ...prev]);
      
      showToast({ type: 'success', title: 'Application submitted successfully!' });
      return true;
    } catch (err: any) {
      const errorMessage = err instanceof ApplicationError ? err.message : 'Failed to submit application';
      setError(errorMessage);
      showToast({ type: 'error', title: errorMessage });
      return false;
    }
  };

  const updateStatus = async (id: string, status: ApplicationStatus, notes?: string): Promise<void> => {
    try {
      setError(null);
      
      // Optimistic update
      setApplications(prev => 
        prev.map(app => 
          app.id === id 
            ? { ...app, status, notes: notes || app.notes, reviewed_at: new Date().toISOString() }
            : app
        )
      );

      await applicationService.updateApplicationStatus(id, status, notes);
      showToast({ type: 'success', title: 'Application status updated' });
    } catch (err: any) {
      // Revert optimistic update
      fetchApplications();
      const errorMessage = err instanceof ApplicationError ? err.message : 'Failed to update status';
      setError(errorMessage);
      showToast({ type: 'error', title: errorMessage });
    }
  };

  const withdrawApplication = async (id: string): Promise<void> => {
    try {
      setError(null);
      
      // Optimistic update
      setApplications(prev => prev.filter(app => app.id !== id));

      await applicationService.withdrawApplication(id);
      showToast({ type: 'success', title: 'Application withdrawn' });
    } catch (err: any) {
      // Revert optimistic update
      fetchApplications();
      const errorMessage = err instanceof ApplicationError ? err.message : 'Failed to withdraw application';
      setError(errorMessage);
      showToast({ type: 'error', title: errorMessage });
    }
  };

  const hasApplied = (jobId: string): boolean => {
    return applications.some(app => app.job_id === jobId);
  };

  return {
    applications,
    loading,
    error,
    submitApplication,
    updateStatus,
    withdrawApplication,
    hasApplied,
    refetch: fetchApplications
  };
}

// Hook for file upload with progress
interface UseFileUploadReturn {
  uploadFile: (file: File, candidateId: string, jobId: string) => Promise<string>;
  uploading: boolean;
  progress: number;
  error: string | null;
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, candidateId: string, jobId: string): Promise<string> => {
    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const url = await fileService.uploadResume(file, candidateId, jobId);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      return url;
    } catch (err: any) {
      const errorMessage = err instanceof ApplicationError ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return {
    uploadFile,
    uploading,
    progress,
    error
  };
}

// Hook for checking application status
export function useApplicationStatus(jobId: string) {
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!user || !profile || profile.user_type !== 'candidate' || !jobId) {
        setLoading(false);
        return;
      }

      try {
        const applied = await applicationService.hasApplied(jobId, profile.id);
        setHasApplied(applied);
      } catch (error) {
        console.error('Failed to check application status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkApplicationStatus();
  }, [jobId, user, profile]);

  return { hasApplied, loading };
}