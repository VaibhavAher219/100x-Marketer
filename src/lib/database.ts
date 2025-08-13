import { supabase } from './supabase';
import { logger, withDatabaseRetry } from './logger';
import { 
  Profile, 
  Employer, 
  Candidate, 
  Job, 
  EmployerSetupData, 
  CandidateSetupData, 
  JobPostingData,
  EmployerStats,
  CandidateStats
} from '@/types/database';
import { getCachedData, cacheKeys, invalidateUserCache, invalidateJobsCache, invalidateStatsCache } from './cache';

// Profile operations
export async function createProfile(userId: string, email: string, userType: 'employer' | 'candidate') {
  return withDatabaseRetry(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        user_type: userType
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create profile', error, { userId, email, userType });
      throw error;
    }

    invalidateUserCache(userId);
    logger.info('Profile created successfully', { userId, userType });
    return data as Profile;
  });
}

export async function getProfile(userId: string) {
  return getCachedData(
    cacheKeys.profile(userId),
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    10 // Cache for 10 minutes
  );
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  
  // Invalidate cache
  invalidateUserCache(userId);
  
  return data as Profile;
}

// Employer operations
export async function createEmployer(profileId: string, employerData: EmployerSetupData) {
  const { data, error } = await supabase
    .from('employers')
    .insert({
      profile_id: profileId,
      company_name: employerData.companyName,
      company_type: employerData.companyType,
      company_email: employerData.companyEmail,
      company_website: employerData.companyWebsite,
      industry: employerData.industry,
      company_size: employerData.companySize,
      company_description: employerData.companyDescription,
      address: employerData.address,
      city: employerData.city,
      state: employerData.state,
      country: employerData.country
    })
    .select()
    .single();

  if (error) throw error;
  return data as Employer;
}

export async function getEmployer(profileId: string) {
  return getCachedData(
    cacheKeys.employer(profileId),
    async () => {
      const { data, error } = await supabase
        .from('employers')
        .select('*')
        .eq('profile_id', profileId)
        .single();

      if (error) throw error;
      return data as Employer;
    },
    15 // Cache for 15 minutes
  );
}

export async function getEmployerStats(employerId: string): Promise<EmployerStats> {
  // Get active jobs count
  const { count: activeJobs } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('employer_id', employerId)
    .eq('status', 'Published');

  // For now, return mock data for applications and views
  // These would be implemented with actual application tracking
  return {
    activeJobs: activeJobs || 0,
    totalApplications: 0,
    viewsThisMonth: 0
  };
}

// Candidate operations
export async function createCandidate(profileId: string, candidateData: CandidateSetupData) {
  // Generate unique profile slug
  const baseSlug = `${candidateData.firstName}-${candidateData.lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
  let slug = baseSlug;
  let counter = 1;

  // Check if slug exists and increment if needed
  while (true) {
    const { data: existing } = await supabase
      .from('candidates')
      .select('id')
      .eq('public_profile_slug', slug)
      .single();

    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const { data, error } = await supabase
    .from('candidates')
    .insert({
      profile_id: profileId,
      headline: candidateData.headline,
      summary: candidateData.summary,
      experience_years: candidateData.experienceYears,
      current_location: candidateData.currentLocation,
      willing_to_relocate: candidateData.willingToRelocate,
      public_profile_slug: slug
    })
    .select()
    .single();

  if (error) throw error;
  return data as Candidate;
}

export async function getCandidate(profileId: string) {
  return getCachedData(
    cacheKeys.candidate(profileId),
    async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('profile_id', profileId)
        .single();

      if (error) throw error;
      return data as Candidate;
    },
    15 // Cache for 15 minutes
  );
}

export async function getCandidateStats(): Promise<CandidateStats> {
  // For now, return mock data
  // These would be implemented with actual application and view tracking
  return {
    profileViews: 0,
    applicationsSent: 0,
    jobAlerts: 0
  };
}

export function calculateProfileCompletion(candidate: Candidate): number {
  const fields = [
    candidate.headline,
    candidate.summary,
    candidate.experience_years,
    candidate.current_location,
    candidate.resume_url,
    candidate.portfolio_url,
    candidate.linkedin_url
  ];

  const completedFields = fields.filter(field => field !== null && field !== '').length;
  return Math.round((completedFields / fields.length) * 100);
}

// Job operations
export async function createJob(employerId: string, jobData: JobPostingData) {
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      employer_id: employerId,
      title: jobData.title,
      description: jobData.description,
      requirements: jobData.requirements,
      salary_min: jobData.salaryMin,
      salary_max: jobData.salaryMax,
      salary_currency: jobData.salaryCurrency,
      job_type: jobData.jobType,
      location: jobData.location,
      remote_allowed: jobData.remoteAllowed,
      experience_level: jobData.experienceLevel,
      category: jobData.category,
      skills_required: jobData.skillsRequired,
      status: jobData.status
    })
    .select()
    .single();

  if (error) throw error;
  
  // Invalidate jobs cache
  invalidateJobsCache();
  invalidateStatsCache(employerId);
  
  return data as Job;
}

export async function getEmployerJobs(employerId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('employer_id', employerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Job[];
}

export async function getPublishedJobs(limit = 10) {
  return getCachedData(
    cacheKeys.publishedJobs(limit),
    async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'Published')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Job[];
    },
    5 // Cache for 5 minutes
  );
}

export async function updateJob(jobId: string, updates: Partial<Job>) {
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single();

  if (error) throw error;
  return data as Job;
}

export async function getJob(jobId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) throw error;
  return data as Job;
}