// Company profile types and interfaces

export interface CompanyProfile {
  id: string;
  userId: string;
  slug: string;
  companyName: string;
  description?: string;
  industry?: string;
  companySize?: string;
  websiteUrl?: string;
  logoUrl?: string;
  bannerUrl?: string;
  brandColor?: string;
  mission?: string;
  values?: string[];
  cultureDescription?: string;
  followerCount: number;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeTestimonial {
  id: string;
  companyProfileId: string;
  employeeName: string;
  employeeRole: string;
  testimonial: string;
  employeePhotoUrl?: string;
  displayOrder: number;
  createdAt: string;
}

export interface OfficeLocation {
  id: string;
  companyProfileId: string;
  locationName: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  officePhotos?: string[];
  isHeadquarters: boolean;
  createdAt: string;
}

export interface CompanyFollower {
  id: string;
  userId: string;
  companyProfileId: string;
  followedAt: string;
}

// Database row types (snake_case)
export interface CompanyProfileRow {
  id: string;
  user_id: string;
  slug: string;
  company_name: string;
  description?: string;
  industry?: string;
  company_size?: string;
  website_url?: string;
  logo_url?: string;
  banner_url?: string;
  brand_color?: string;
  mission?: string;
  values?: string[];
  culture_description?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeTestimonialRow {
  id: string;
  company_profile_id: string;
  employee_name: string;
  employee_role: string;
  testimonial: string;
  employee_photo_url?: string;
  display_order: number;
  created_at: string;
}

export interface OfficeLocationRow {
  id: string;
  company_profile_id: string;
  location_name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  office_photos?: string[];
  is_headquarters: boolean;
  created_at: string;
}

export interface CompanyFollowerRow {
  id: string;
  user_id: string;
  company_profile_id: string;
  followed_at: string;
}

// Create/Update types
export interface CreateCompanyProfileData {
  companyName: string;
  description?: string;
  industry?: string;
  companySize?: string;
  websiteUrl?: string;
  logoUrl?: string;
  bannerUrl?: string;
  brandColor?: string;
  mission?: string;
  values?: string[];
  cultureDescription?: string;
}

export interface UpdateCompanyProfileData extends Partial<CreateCompanyProfileData> {
  id: string;
}

export interface CreateEmployeeTestimonialData {
  companyProfileId: string;
  employeeName: string;
  employeeRole: string;
  testimonial: string;
  employeePhotoUrl?: string;
  displayOrder?: number;
}

export interface UpdateEmployeeTestimonialData extends Partial<CreateEmployeeTestimonialData> {
  id: string;
}

export interface CreateOfficeLocationData {
  companyProfileId: string;
  locationName: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  officePhotos?: string[];
  isHeadquarters?: boolean;
}

export interface UpdateOfficeLocationData extends Partial<CreateOfficeLocationData> {
  id: string;
}

// Company size options
export const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5000+'
] as const;

export type CompanySize = typeof COMPANY_SIZES[number];

// Industry options
export const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Construction',
  'Transportation',
  'Real Estate',
  'Media & Entertainment',
  'Food & Beverage',
  'Energy',
  'Government',
  'Non-profit',
  'Other'
] as const;

export type Industry = typeof INDUSTRIES[number];

// Company profile with related data
export interface CompanyProfileWithDetails extends CompanyProfile {
  testimonials: EmployeeTestimonial[];
  locations: OfficeLocation[];
  jobCount: number;
  jobs?: import('./database').Job[];
}

// API response types
export interface CompanyProfileResponse {
  success: boolean;
  data?: CompanyProfile;
  error?: string;
}

export interface CompanyProfilesResponse {
  success: boolean;
  data?: CompanyProfile[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FollowResponse {
  success: boolean;
  isFollowing: boolean;
  followerCount: number;
  error?: string;
}