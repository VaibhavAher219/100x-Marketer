export interface Profile {
  id: string;
  email: string;
  user_type: 'employer' | 'candidate' | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Employer {
  id: string;
  profile_id: string;
  company_name: string;
  company_type: 'Startup' | 'SME' | 'Enterprise' | 'Agency' | 'Non-profit' | null;
  company_email: string | null;
  company_website: string | null;
  company_size: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null;
  industry: string | null;
  company_description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  created_at: string;
}

export interface Candidate {
  id: string;
  profile_id: string;
  headline: string | null;
  summary: string | null;
  experience_years: number | null;
  current_salary: number | null;
  expected_salary: number | null;
  current_location: string | null;
  willing_to_relocate: boolean;
  resume_url: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  public_profile_slug: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  requirements: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  job_type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | null;
  location: string | null;
  remote_allowed: boolean;
  experience_level: 'Entry' | 'Mid' | 'Senior' | 'Executive' | null;
  category: string | null;
  skills_required: string[];
  status: 'Draft' | 'Published' | 'Paused' | 'Closed';
  applications_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

// Form data interfaces
export interface EmployerSetupData {
  companyName: string;
  companyType: 'Startup' | 'SME' | 'Enterprise' | 'Agency' | 'Non-profit';
  companyEmail: string;
  companyWebsite: string;
  industry: string;
  companySize: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  companyDescription: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface CandidateSetupData {
  firstName: string;
  lastName: string;
  headline: string;
  summary: string;
  experienceYears: number;
  currentLocation: string;
  willingToRelocate: boolean;
}

export interface JobPostingData {
  title: string;
  description: string;
  requirements: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance';
  location: string;
  remoteAllowed: boolean;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Executive';
  category: string;
  skillsRequired: string[];
  status: 'Draft' | 'Published';
}

// Application interfaces
export type ApplicationStatus = 'Applied' | 'Reviewed' | 'Shortlisted' | 'Rejected' | 'Hired';

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  cover_letter: string;
  resume_url: string;
  application_date: string;
  reviewed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  job?: Job;
  candidate?: Candidate;
  employer?: Employer;
}

export interface ApplicationFormData {
  cover_letter: string;
  resume_file: File;
}

export interface ApplicationFilters {
  status?: ApplicationStatus;
  job_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
  search?: string;
}

// Dashboard stats interfaces
export interface EmployerStats {
  activeJobs: number;
  totalApplications: number;
  viewsThisMonth: number;
}

export interface CandidateStats {
  profileViews: number;
  applicationsSent: number;
  jobAlerts: number;
}