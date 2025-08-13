import { supabase } from '@/lib/supabase';
import {
  CompanyProfile,
  CompanyProfileRow,
  EmployeeTestimonial,
  EmployeeTestimonialRow,
  OfficeLocation,
  OfficeLocationRow,
  CreateCompanyProfileData,
  UpdateCompanyProfileData,
  CreateEmployeeTestimonialData,
  UpdateEmployeeTestimonialData,
  CreateOfficeLocationData,
  UpdateOfficeLocationData,
  CompanyProfileWithDetails,
} from '@/types/company';
import { Job } from '@/types/database';

export class CompanyProfileService {
  // Helper function to convert database row to CompanyProfile
  private mapRowToCompanyProfile(row: CompanyProfileRow, followerCount = 0, isFollowing = false): CompanyProfile {
    return {
      id: row.id,
      userId: row.user_id,
      slug: row.slug,
      companyName: row.company_name,
      description: row.description,
      industry: row.industry,
      companySize: row.company_size,
      websiteUrl: row.website_url,
      logoUrl: row.logo_url,
      bannerUrl: row.banner_url,
      brandColor: row.brand_color,
      mission: row.mission,
      values: row.values,
      cultureDescription: row.culture_description,
      followerCount,
      isFollowing,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // Helper function to convert database row to EmployeeTestimonial
  private mapRowToTestimonial(row: EmployeeTestimonialRow): EmployeeTestimonial {
    return {
      id: row.id,
      companyProfileId: row.company_profile_id,
      employeeName: row.employee_name,
      employeeRole: row.employee_role,
      testimonial: row.testimonial,
      employeePhotoUrl: row.employee_photo_url,
      displayOrder: row.display_order,
      createdAt: row.created_at,
    };
  }

  // Helper function to convert database row to OfficeLocation
  private mapRowToLocation(row: OfficeLocationRow): OfficeLocation {
    return {
      id: row.id,
      companyProfileId: row.company_profile_id,
      locationName: row.location_name,
      address: row.address,
      city: row.city,
      state: row.state,
      country: row.country,
      postalCode: row.postal_code,
      latitude: row.latitude,
      longitude: row.longitude,
      officePhotos: row.office_photos,
      isHeadquarters: row.is_headquarters,
      createdAt: row.created_at,
    };
  }

  // Generate unique slug for company
  async generateSlug(companyName: string): Promise<string> {
    const { data, error } = await supabase.rpc('generate_company_slug', {
      company_name: companyName,
    });

    if (error) {
      console.error('Error generating slug:', error);
      throw new Error('Failed to generate company slug');
    }

    return data;
  }

  // Get company profile by slug
  async getBySlug(slug: string, userId?: string): Promise<CompanyProfile | null> {
    const { data, error } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching company profile:', error);
      throw new Error('Failed to fetch company profile');
    }

    // Get follower count
    const followerCount = await this.getFollowerCount(data.id);
    
    // Check if user is following (if userId provided)
    let isFollowing = false;
    if (userId) {
      isFollowing = await this.isFollowing(userId, data.id);
    }

    return this.mapRowToCompanyProfile(data, followerCount, isFollowing);
  }

  // Get company profile by ID
  async getById(id: string, userId?: string): Promise<CompanyProfile | null> {
    const { data, error } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching company profile:', error);
      throw new Error('Failed to fetch company profile');
    }

    const followerCount = await this.getFollowerCount(data.id);
    let isFollowing = false;
    if (userId) {
      isFollowing = await this.isFollowing(userId, data.id);
    }

    return this.mapRowToCompanyProfile(data, followerCount, isFollowing);
  }

  // Get company profile by user ID
  async getByUserId(userId: string): Promise<CompanyProfile | null> {
    const { data, error } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching company profile:', error);
      throw new Error('Failed to fetch company profile');
    }

    const followerCount = await this.getFollowerCount(data.id);
    return this.mapRowToCompanyProfile(data, followerCount);
  }

  // Create company profile
  async create(userId: string, data: CreateCompanyProfileData): Promise<CompanyProfile> {
    // Generate slug
    const slug = await this.generateSlug(data.companyName);

    const insertData = {
      user_id: userId,
      slug,
      company_name: data.companyName,
      description: data.description,
      industry: data.industry,
      company_size: data.companySize,
      website_url: data.websiteUrl,
      logo_url: data.logoUrl,
      banner_url: data.bannerUrl,
      brand_color: data.brandColor,
      mission: data.mission,
      values: data.values,
      culture_description: data.cultureDescription,
    };

    const { data: result, error } = await supabase
      .from('company_profiles')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating company profile:', error);
      throw new Error('Failed to create company profile');
    }

    return this.mapRowToCompanyProfile(result);
  }

  // Update company profile
  async update(id: string, data: UpdateCompanyProfileData): Promise<CompanyProfile> {
    const updateData: Partial<CompanyProfileRow> = {};

    if (data.companyName !== undefined) {
      updateData.company_name = data.companyName;
      // Regenerate slug if company name changed
      updateData.slug = await this.generateSlug(data.companyName);
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.industry !== undefined) updateData.industry = data.industry;
    if (data.companySize !== undefined) updateData.company_size = data.companySize;
    if (data.websiteUrl !== undefined) updateData.website_url = data.websiteUrl;
    if (data.logoUrl !== undefined) updateData.logo_url = data.logoUrl;
    if (data.bannerUrl !== undefined) updateData.banner_url = data.bannerUrl;
    if (data.brandColor !== undefined) updateData.brand_color = data.brandColor;
    if (data.mission !== undefined) updateData.mission = data.mission;
    if (data.values !== undefined) updateData.values = data.values;
    if (data.cultureDescription !== undefined) updateData.culture_description = data.cultureDescription;

    const { data: result, error } = await supabase
      .from('company_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating company profile:', error);
      throw new Error('Failed to update company profile');
    }

    const followerCount = await this.getFollowerCount(result.id);
    return this.mapRowToCompanyProfile(result, followerCount);
  }

  // Delete company profile
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('company_profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting company profile:', error);
      throw new Error('Failed to delete company profile');
    }
  }

  // Get company profile with all details
  async getWithDetails(slug: string, userId?: string): Promise<CompanyProfileWithDetails | null> {
    const profile = await this.getBySlug(slug, userId);
    if (!profile) return null;

    // Get testimonials
    const testimonials = await this.getTestimonials(profile.id);
    
    // Get office locations
    const locations = await this.getOfficeLocations(profile.id);
    
    // Get job count
    const jobCount = await this.getJobCount(profile.id);

    return {
      ...profile,
      testimonials,
      locations,
      jobCount,
    };
  }

  // Get jobs by company
  async getJobsByCompany(companyId: string, limit = 10, offset = 0): Promise<Job[]> {
    // First get the user_id from company profile
    const { data: profile, error: profileError } = await supabase
      .from('company_profiles')
      .select('user_id')
      .eq('id', companyId)
      .single();

    if (profileError || !profile) {
      return [];
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', profile.user_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching company jobs:', error);
      return [];
    }

    return data || [];
  }

  // Get job count for company
  async getJobCount(companyId: string): Promise<number> {
    const { data: profile, error: profileError } = await supabase
      .from('company_profiles')
      .select('user_id')
      .eq('id', companyId)
      .single();

    if (profileError || !profile) {
      return 0;
    }

    const { count, error } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', profile.user_id)
      .eq('status', 'active');

    if (error) {
      console.error('Error counting company jobs:', error);
      return 0;
    }

    return count || 0;
  }

  // Employee testimonials methods
  async getTestimonials(companyProfileId: string): Promise<EmployeeTestimonial[]> {
    const { data, error } = await supabase
      .from('employee_testimonials')
      .select('*')
      .eq('company_profile_id', companyProfileId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }

    return data.map(this.mapRowToTestimonial);
  }

  async createTestimonial(data: CreateEmployeeTestimonialData): Promise<EmployeeTestimonial> {
    const insertData = {
      company_profile_id: data.companyProfileId,
      employee_name: data.employeeName,
      employee_role: data.employeeRole,
      testimonial: data.testimonial,
      employee_photo_url: data.employeePhotoUrl,
      display_order: data.displayOrder || 0,
    };

    const { data: result, error } = await supabase
      .from('employee_testimonials')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating testimonial:', error);
      throw new Error('Failed to create testimonial');
    }

    return this.mapRowToTestimonial(result);
  }

  async updateTestimonial(data: UpdateEmployeeTestimonialData): Promise<EmployeeTestimonial> {
    const updateData: Partial<EmployeeTestimonialRow> = {};
    
    if (data.employeeName !== undefined) updateData.employee_name = data.employeeName;
    if (data.employeeRole !== undefined) updateData.employee_role = data.employeeRole;
    if (data.testimonial !== undefined) updateData.testimonial = data.testimonial;
    if (data.employeePhotoUrl !== undefined) updateData.employee_photo_url = data.employeePhotoUrl;
    if (data.displayOrder !== undefined) updateData.display_order = data.displayOrder;

    const { data: result, error } = await supabase
      .from('employee_testimonials')
      .update(updateData)
      .eq('id', data.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating testimonial:', error);
      throw new Error('Failed to update testimonial');
    }

    return this.mapRowToTestimonial(result);
  }

  async deleteTestimonial(id: string): Promise<void> {
    const { error } = await supabase
      .from('employee_testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting testimonial:', error);
      throw new Error('Failed to delete testimonial');
    }
  }

  // Office locations methods
  async getOfficeLocations(companyProfileId: string): Promise<OfficeLocation[]> {
    const { data, error } = await supabase
      .from('office_locations')
      .select('*')
      .eq('company_profile_id', companyProfileId)
      .order('is_headquarters', { ascending: false });

    if (error) {
      console.error('Error fetching office locations:', error);
      return [];
    }

    return data.map(this.mapRowToLocation);
  }

  async createOfficeLocation(data: CreateOfficeLocationData): Promise<OfficeLocation> {
    const insertData = {
      company_profile_id: data.companyProfileId,
      location_name: data.locationName,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postal_code: data.postalCode,
      latitude: data.latitude,
      longitude: data.longitude,
      office_photos: data.officePhotos,
      is_headquarters: data.isHeadquarters || false,
    };

    const { data: result, error } = await supabase
      .from('office_locations')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating office location:', error);
      throw new Error('Failed to create office location');
    }

    return this.mapRowToLocation(result);
  }

  async updateOfficeLocation(data: UpdateOfficeLocationData): Promise<OfficeLocation> {
    const updateData: Partial<OfficeLocationRow> = {};
    
    if (data.locationName !== undefined) updateData.location_name = data.locationName;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.postalCode !== undefined) updateData.postal_code = data.postalCode;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.officePhotos !== undefined) updateData.office_photos = data.officePhotos;
    if (data.isHeadquarters !== undefined) updateData.is_headquarters = data.isHeadquarters;

    const { data: result, error } = await supabase
      .from('office_locations')
      .update(updateData)
      .eq('id', data.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating office location:', error);
      throw new Error('Failed to update office location');
    }

    return this.mapRowToLocation(result);
  }

  async deleteOfficeLocation(id: string): Promise<void> {
    const { error } = await supabase
      .from('office_locations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting office location:', error);
      throw new Error('Failed to delete office location');
    }
  }

  // Follower methods
  async getFollowerCount(companyProfileId: string): Promise<number> {
    const { count, error } = await supabase
      .from('company_followers')
      .select('*', { count: 'exact', head: true })
      .eq('company_profile_id', companyProfileId);

    if (error) {
      console.error('Error counting followers:', error);
      return 0;
    }

    return count || 0;
  }

  async isFollowing(userId: string, companyProfileId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('company_followers')
      .select('id')
      .eq('user_id', userId)
      .eq('company_profile_id', companyProfileId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking follow status:', error);
      return false;
    }

    return !!data;
  }

  async followCompany(userId: string, companyProfileId: string): Promise<void> {
    const { error } = await supabase
      .from('company_followers')
      .insert({
        user_id: userId,
        company_profile_id: companyProfileId,
      });

    if (error) {
      console.error('Error following company:', error);
      throw new Error('Failed to follow company');
    }
  }

  async unfollowCompany(userId: string, companyProfileId: string): Promise<void> {
    const { error } = await supabase
      .from('company_followers')
      .delete()
      .eq('user_id', userId)
      .eq('company_profile_id', companyProfileId);

    if (error) {
      console.error('Error unfollowing company:', error);
      throw new Error('Failed to unfollow company');
    }
  }

  // Search and listing methods
  async searchCompanies(
    query?: string,
    industry?: string,
    companySize?: string,
    limit = 10,
    offset = 0
  ): Promise<{ companies: CompanyProfile[]; total: number }> {
    let queryBuilder = supabase
      .from('company_profiles')
      .select('*', { count: 'exact' });

    if (query) {
      queryBuilder = queryBuilder.or(`company_name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (industry) {
      queryBuilder = queryBuilder.eq('industry', industry);
    }

    if (companySize) {
      queryBuilder = queryBuilder.eq('company_size', companySize);
    }

    const { data, error, count } = await queryBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error searching companies:', error);
      throw new Error('Failed to search companies');
    }

    const companies = await Promise.all(
      (data || []).map(async (row) => {
        const followerCount = await this.getFollowerCount(row.id);
        return this.mapRowToCompanyProfile(row, followerCount);
      })
    );

    return {
      companies,
      total: count || 0,
    };
  }
}

// Export singleton instance
export const companyProfileService = new CompanyProfileService();