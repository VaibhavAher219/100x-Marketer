import { z } from 'zod';
import { COMPANY_SIZES, INDUSTRIES } from '@/types/company';

// Company profile validation schemas
export const createCompanyProfileSchema = z.object({
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .max(255, 'Company name must be less than 255 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  industry: z
    .enum(INDUSTRIES)
    .optional(),
  companySize: z
    .enum(COMPANY_SIZES)
    .optional(),
  websiteUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  logoUrl: z
    .string()
    .url('Please enter a valid logo URL')
    .optional()
    .or(z.literal('')),
  bannerUrl: z
    .string()
    .url('Please enter a valid banner URL')
    .optional()
    .or(z.literal('')),
  brandColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color')
    .optional(),
  mission: z
    .string()
    .max(1000, 'Mission must be less than 1000 characters')
    .optional(),
  values: z
    .array(z.string().min(1).max(100))
    .max(10, 'Maximum 10 values allowed')
    .optional(),
  cultureDescription: z
    .string()
    .max(2000, 'Culture description must be less than 2000 characters')
    .optional(),
});

export const updateCompanyProfileSchema = createCompanyProfileSchema.partial().extend({
  id: z.string().uuid('Invalid company profile ID'),
});

// Employee testimonial validation schemas
export const createEmployeeTestimonialSchema = z.object({
  companyProfileId: z.string().uuid('Invalid company profile ID'),
  employeeName: z
    .string()
    .min(1, 'Employee name is required')
    .max(255, 'Employee name must be less than 255 characters')
    .trim(),
  employeeRole: z
    .string()
    .min(1, 'Employee role is required')
    .max(255, 'Employee role must be less than 255 characters')
    .trim(),
  testimonial: z
    .string()
    .min(10, 'Testimonial must be at least 10 characters')
    .max(1000, 'Testimonial must be less than 1000 characters')
    .trim(),
  employeePhotoUrl: z
    .string()
    .url('Please enter a valid photo URL')
    .optional()
    .or(z.literal('')),
  displayOrder: z
    .number()
    .int()
    .min(0)
    .max(100)
    .optional()
    .default(0),
});

export const updateEmployeeTestimonialSchema = createEmployeeTestimonialSchema.partial().extend({
  id: z.string().uuid('Invalid testimonial ID'),
});

// Office location validation schemas
export const createOfficeLocationSchema = z.object({
  companyProfileId: z.string().uuid('Invalid company profile ID'),
  locationName: z
    .string()
    .min(1, 'Location name is required')
    .max(255, 'Location name must be less than 255 characters')
    .trim(),
  address: z
    .string()
    .min(1, 'Address is required')
    .max(500, 'Address must be less than 500 characters')
    .trim(),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters')
    .trim(),
  state: z
    .string()
    .max(100, 'State must be less than 100 characters')
    .optional(),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country must be less than 100 characters')
    .trim(),
  postalCode: z
    .string()
    .max(20, 'Postal code must be less than 20 characters')
    .optional(),
  latitude: z
    .number()
    .min(-90)
    .max(90)
    .optional(),
  longitude: z
    .number()
    .min(-180)
    .max(180)
    .optional(),
  officePhotos: z
    .array(z.string().url('Please enter valid photo URLs'))
    .max(10, 'Maximum 10 photos allowed')
    .optional(),
  isHeadquarters: z
    .boolean()
    .optional()
    .default(false),
});

export const updateOfficeLocationSchema = createOfficeLocationSchema.partial().extend({
  id: z.string().uuid('Invalid office location ID'),
});

// Slug validation
export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(100, 'Slug must be less than 100 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  .refine((slug) => !slug.startsWith('-') && !slug.endsWith('-'), {
    message: 'Slug cannot start or end with a hyphen',
  })
  .refine((slug) => !slug.includes('--'), {
    message: 'Slug cannot contain consecutive hyphens',
  });

// Query parameter schemas
export const companyProfileQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, 'Page must be greater than 0'),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  industry: z
    .string()
    .optional()
    .refine((val) => !val || (INDUSTRIES as readonly string[]).includes(val), 'Invalid industry'),
  companySize: z
    .string()
    .optional()
    .refine((val) => !val || (COMPANY_SIZES as readonly string[]).includes(val), 'Invalid company size'),
  search: z
    .string()
    .max(100, 'Search query must be less than 100 characters')
    .optional(),
});

// Follow/unfollow validation
export const followCompanySchema = z.object({
  companyProfileId: z.string().uuid('Invalid company profile ID'),
});

// Bulk operations
export const bulkUpdateTestimonialsSchema = z.object({
  testimonials: z.array(
    z.object({
      id: z.string().uuid(),
      displayOrder: z.number().int().min(0).max(100),
    })
  ).max(50, 'Maximum 50 testimonials can be updated at once'),
});

// Image upload validation
export const imageUploadSchema = z.object({
  file: z.any().refine((file) => {
    if (!file) return false;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    return validTypes.includes(file.type);
  }, 'Only JPEG, PNG, and WebP images are allowed'),
  type: z.enum(['logo', 'banner', 'office', 'employee']),
});

// Export types for use in components
export type CreateCompanyProfileInput = z.infer<typeof createCompanyProfileSchema>;
export type UpdateCompanyProfileInput = z.infer<typeof updateCompanyProfileSchema>;
export type CreateEmployeeTestimonialInput = z.infer<typeof createEmployeeTestimonialSchema>;
export type UpdateEmployeeTestimonialInput = z.infer<typeof updateEmployeeTestimonialSchema>;
export type CreateOfficeLocationInput = z.infer<typeof createOfficeLocationSchema>;
export type UpdateOfficeLocationInput = z.infer<typeof updateOfficeLocationSchema>;
export type CompanyProfileQueryInput = z.infer<typeof companyProfileQuerySchema>;
export type FollowCompanyInput = z.infer<typeof followCompanySchema>;
export type BulkUpdateTestimonialsInput = z.infer<typeof bulkUpdateTestimonialsSchema>;
export type ImageUploadInput = z.infer<typeof imageUploadSchema>;