import { supabase } from './supabase';
import { Application, ApplicationStatus, ApplicationFilters } from '@/types/database';

export class ApplicationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ApplicationError';
  }
}

// Application CRUD operations
export const applicationService = {
  // Submit a new application
  async submitApplication(data: {
    job_id: string;
    candidate_id: string;
    cover_letter: string;
    resume_url: string;
  }): Promise<Application> {
    try {
      // Check for duplicate application
      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', data.job_id)
        .eq('candidate_id', data.candidate_id)
        .single();

      if (existing) {
        throw new ApplicationError('You have already applied for this job', 'DUPLICATE_APPLICATION');
      }

      const { data: application, error } = await supabase
        .from('applications')
        .insert(data)
        .select(`
          *,
          job:jobs(*),
          candidate:candidates(*)
        `)
        .single();

      if (error) throw error;
      return application;
    } catch (error: any) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError('Failed to submit application', 'SUBMISSION_FAILED');
    }
  },

  // Get applications for a candidate
  async getCandidateApplications(candidateId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(
          *,
          employer:employers(*)
        )
      `)
      .eq('candidate_id', candidateId)
      .order('application_date', { ascending: false });

    if (error) throw new ApplicationError('Failed to fetch applications', 'FETCH_FAILED');
    return data || [];
  },

  // Get applications for an employer's jobs
  async getEmployerApplications(employerId: string, filters?: ApplicationFilters): Promise<Application[]> {
    let query = supabase
      .from('applications')
      .select(`
        *,
        job:jobs!inner(*),
        candidate:candidates(*)
      `)
      .eq('job.employer_id', employerId);

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.job_id) {
      query = query.eq('job_id', filters.job_id);
    }
    if (filters?.search) {
      query = query.or(`candidate.first_name.ilike.%${filters.search}%,candidate.last_name.ilike.%${filters.search}%`);
    }
    if (filters?.date_range) {
      query = query
        .gte('application_date', filters.date_range.start)
        .lte('application_date', filters.date_range.end);
    }

    query = query.order('application_date', { ascending: false });

    const { data, error } = await query;
    if (error) throw new ApplicationError('Failed to fetch applications', 'FETCH_FAILED');
    return data || [];
  },

  // Update application status
  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    notes?: string
  ): Promise<Application> {
    const updateData: any = { 
      status,
      reviewed_at: new Date().toISOString()
    };
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data, error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', applicationId)
      .select(`
        *,
        job:jobs(*),
        candidate:candidates(*)
      `)
      .single();

    if (error) throw new ApplicationError('Failed to update application', 'UPDATE_FAILED');
    return data;
  },

  // Withdraw application (candidate only)
  async withdrawApplication(applicationId: string): Promise<void> {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId);

    if (error) throw new ApplicationError('Failed to withdraw application', 'WITHDRAWAL_FAILED');
  },

  // Check if candidate has applied for a job
  async hasApplied(jobId: string, candidateId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('candidate_id', candidateId)
      .single();

    return !!data && !error;
  },

  // Get application by ID
  async getApplicationById(applicationId: string): Promise<Application | null> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(
          *,
          employer:employers(*)
        ),
        candidate:candidates(*)
      `)
      .eq('id', applicationId)
      .single();

    if (error) return null;
    return data;
  }
};

// File upload utilities
export const fileService = {
  // Upload resume file
  async uploadResume(file: File, candidateId: string, jobId: string): Promise<string> {
    try {
      // Validate file
      this.validateResumeFile(file);

      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${candidateId}/${jobId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error: any) {
      throw new ApplicationError(`File upload failed: ${error.message}`, 'UPLOAD_FAILED');
    }
  },

  // Validate resume file
  validateResumeFile(file: File): void {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new ApplicationError('Invalid file type. Please upload PDF, DOC, or DOCX files only.', 'INVALID_FILE_TYPE');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new ApplicationError('File size too large. Maximum size is 5MB.', 'FILE_TOO_LARGE');
    }
  },

  // Delete resume file
  async deleteResume(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from('resumes')
      .remove([filePath]);

    if (error) {
      console.error('Failed to delete resume:', error);
    }
  }
};

// Application statistics
export const applicationStats = {
  // Get candidate application stats
  async getCandidateStats(candidateId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select('status')
      .eq('candidate_id', candidateId);

    if (error) return { total: 0, pending: 0, reviewed: 0, shortlisted: 0, rejected: 0, hired: 0 };

    const stats = data.reduce((acc, app) => {
      acc.total++;
      acc[app.status.toLowerCase() as keyof typeof acc]++;
      return acc;
    }, { total: 0, applied: 0, reviewed: 0, shortlisted: 0, rejected: 0, hired: 0 });

    return {
      ...stats,
      pending: stats.applied + stats.reviewed
    };
  },

  // Get employer application stats
  async getEmployerStats(employerId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        status,
        job:jobs!inner(employer_id)
      `)
      .eq('job.employer_id', employerId);

    if (error) return { total: 0, pending: 0, reviewed: 0, shortlisted: 0 };

    const stats = data.reduce((acc, app) => {
      acc.total++;
      if (app.status === 'Applied') acc.pending++;
      if (app.status === 'Reviewed') acc.reviewed++;
      if (app.status === 'Shortlisted') acc.shortlisted++;
      return acc;
    }, { total: 0, pending: 0, reviewed: 0, shortlisted: 0 });

    return stats;
  }
};