import { describe, it, expect } from '@jest/globals';
import {
  createCompanyProfileSchema,
  updateCompanyProfileSchema,
  createEmployeeTestimonialSchema,
  createOfficeLocationSchema,
  slugSchema,
  companyProfileQuerySchema,
} from '@/lib/validations/company';

describe('Company Validation Schemas', () => {
  describe('createCompanyProfileSchema', () => {
    it('should validate valid company profile data', () => {
      const validData = {
        companyName: 'Tech Company',
        description: 'A great tech company',
        industry: 'Technology',
        companySize: '11-50',
        websiteUrl: 'https://techcompany.com',
        logoUrl: 'https://example.com/logo.png',
        bannerUrl: 'https://example.com/banner.png',
        brandColor: '#FF0000',
        mission: 'To innovate',
        values: ['Innovation', 'Quality'],
        cultureDescription: 'Great culture',
      };

      const result = createCompanyProfileSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should validate minimal required data', () => {
      const minimalData = {
        companyName: 'Tech Company',
      };

      const result = createCompanyProfileSchema.parse(minimalData);
      expect(result.companyName).toBe('Tech Company');
    });

    it('should reject empty company name', () => {
      const invalidData = {
        companyName: '',
      };

      expect(() => createCompanyProfileSchema.parse(invalidData)).toThrow();
    });

    it('should reject company name that is too long', () => {
      const invalidData = {
        companyName: 'A'.repeat(256), // Too long
      };

      expect(() => createCompanyProfileSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid website URL', () => {
      const invalidData = {
        companyName: 'Tech Company',
        websiteUrl: 'not-a-url',
      };

      expect(() => createCompanyProfileSchema.parse(invalidData)).toThrow();
    });

    it('should accept empty string for optional URL fields', () => {
      const validData = {
        companyName: 'Tech Company',
        websiteUrl: '',
        logoUrl: '',
        bannerUrl: '',
      };

      const result = createCompanyProfileSchema.parse(validData);
      expect(result.websiteUrl).toBe('');
    });

    it('should reject invalid brand color', () => {
      const invalidData = {
        companyName: 'Tech Company',
        brandColor: 'red', // Should be hex format
      };

      expect(() => createCompanyProfileSchema.parse(invalidData)).toThrow();
    });

    it('should reject too many values', () => {
      const invalidData = {
        companyName: 'Tech Company',
        values: Array(11).fill('Value'), // Max 10 allowed
      };

      expect(() => createCompanyProfileSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid industry', () => {
      const invalidData = {
        companyName: 'Tech Company',
        industry: 'InvalidIndustry',
      };

      expect(() => createCompanyProfileSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid company size', () => {
      const invalidData = {
        companyName: 'Tech Company',
        companySize: 'InvalidSize',
      };

      expect(() => createCompanyProfileSchema.parse(invalidData)).toThrow();
    });
  });

  describe('updateCompanyProfileSchema', () => {
    it('should validate partial update data', () => {
      const updateData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        companyName: 'Updated Company Name',
        description: 'Updated description',
      };

      const result = updateCompanyProfileSchema.parse(updateData);
      expect(result).toEqual(updateData);
    });

    it('should require valid UUID for id', () => {
      const invalidData = {
        id: 'invalid-uuid',
        companyName: 'Updated Company Name',
      };

      expect(() => updateCompanyProfileSchema.parse(invalidData)).toThrow();
    });

    it('should allow empty update (only id)', () => {
      const minimalData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = updateCompanyProfileSchema.parse(minimalData);
      expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    });
  });

  describe('createEmployeeTestimonialSchema', () => {
    it('should validate valid testimonial data', () => {
      const validData = {
        companyProfileId: '123e4567-e89b-12d3-a456-426614174000',
        employeeName: 'John Doe',
        employeeRole: 'Software Engineer',
        testimonial: 'Great place to work with amazing colleagues and challenging projects.',
        employeePhotoUrl: 'https://example.com/photo.jpg',
        displayOrder: 1,
      };

      const result = createEmployeeTestimonialSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should set default display order', () => {
      const dataWithoutOrder = {
        companyProfileId: '123e4567-e89b-12d3-a456-426614174000',
        employeeName: 'John Doe',
        employeeRole: 'Software Engineer',
        testimonial: 'Great place to work with amazing colleagues.',
      };

      const result = createEmployeeTestimonialSchema.parse(dataWithoutOrder);
      expect(result.displayOrder).toBe(0);
    });

    it('should reject testimonial that is too short', () => {
      const invalidData = {
        companyProfileId: '123e4567-e89b-12d3-a456-426614174000',
        employeeName: 'John Doe',
        employeeRole: 'Software Engineer',
        testimonial: 'Too short', // Less than 10 characters
      };

      expect(() => createEmployeeTestimonialSchema.parse(invalidData)).toThrow();
    });

    it('should reject testimonial that is too long', () => {
      const invalidData = {
        companyProfileId: '123e4567-e89b-12d3-a456-426614174000',
        employeeName: 'John Doe',
        employeeRole: 'Software Engineer',
        testimonial: 'A'.repeat(1001), // Too long
      };

      expect(() => createEmployeeTestimonialSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid company profile ID', () => {
      const invalidData = {
        companyProfileId: 'invalid-uuid',
        employeeName: 'John Doe',
        employeeRole: 'Software Engineer',
        testimonial: 'Great place to work.',
      };

      expect(() => createEmployeeTestimonialSchema.parse(invalidData)).toThrow();
    });
  });

  describe('createOfficeLocationSchema', () => {
    it('should validate valid office location data', () => {
      const validData = {
        companyProfileId: '123e4567-e89b-12d3-a456-426614174000',
        locationName: 'San Francisco Office',
        address: '123 Market Street',
        city: 'San Francisco',
        state: 'California',
        country: 'United States',
        postalCode: '94105',
        latitude: 37.7749,
        longitude: -122.4194,
        officePhotos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
        isHeadquarters: true,
      };

      const result = createOfficeLocationSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should set default isHeadquarters to false', () => {
      const dataWithoutHQ = {
        companyProfileId: '123e4567-e89b-12d3-a456-426614174000',
        locationName: 'San Francisco Office',
        address: '123 Market Street',
        city: 'San Francisco',
        country: 'United States',
      };

      const result = createOfficeLocationSchema.parse(dataWithoutHQ);
      expect(result.isHeadquarters).toBe(false);
    });

    it('should reject invalid latitude', () => {
      const invalidData = {
        companyProfileId: '123e4567-e89b-12d3-a456-426614174000',
        locationName: 'Office',
        address: '123 Street',
        city: 'City',
        country: 'Country',
        latitude: 91, // Invalid: > 90
      };

      expect(() => createOfficeLocationSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid longitude', () => {
      const invalidData = {
        companyProfileId: '123e4567-e89b-12d3-a456-426614174000',
        locationName: 'Office',
        address: '123 Street',
        city: 'City',
        country: 'Country',
        longitude: 181, // Invalid: > 180
      };

      expect(() => createOfficeLocationSchema.parse(invalidData)).toThrow();
    });

    it('should reject too many office photos', () => {
      const invalidData = {
        companyProfileId: '123e4567-e89b-12d3-a456-426614174000',
        locationName: 'Office',
        address: '123 Street',
        city: 'City',
        country: 'Country',
        officePhotos: Array(11).fill('https://example.com/photo.jpg'), // Max 10 allowed
      };

      expect(() => createOfficeLocationSchema.parse(invalidData)).toThrow();
    });
  });

  describe('slugSchema', () => {
    it('should validate valid slugs', () => {
      const validSlugs = [
        'tech-company',
        'my-startup-123',
        'company-name',
        'abc',
      ];

      validSlugs.forEach(slug => {
        const result = slugSchema.parse(slug);
        expect(result).toBe(slug);
      });
    });

    it('should reject slugs that are too short', () => {
      expect(() => slugSchema.parse('ab')).toThrow();
    });

    it('should reject slugs that are too long', () => {
      const longSlug = 'a'.repeat(101);
      expect(() => slugSchema.parse(longSlug)).toThrow();
    });

    it('should reject slugs with invalid characters', () => {
      const invalidSlugs = [
        'Tech Company', // Spaces
        'tech_company', // Underscores
        'tech.company', // Dots
        'tech@company', // Special characters
        'TECH-COMPANY', // Uppercase
      ];

      invalidSlugs.forEach(slug => {
        expect(() => slugSchema.parse(slug)).toThrow();
      });
    });

    it('should reject slugs starting or ending with hyphens', () => {
      const invalidSlugs = [
        '-tech-company',
        'tech-company-',
        '-tech-company-',
      ];

      invalidSlugs.forEach(slug => {
        expect(() => slugSchema.parse(slug)).toThrow();
      });
    });

    it('should reject slugs with consecutive hyphens', () => {
      expect(() => slugSchema.parse('tech--company')).toThrow();
    });
  });

  describe('companyProfileQuerySchema', () => {
    it('should validate and transform query parameters', () => {
      const queryParams = {
        page: '2',
        limit: '20',
        industry: 'Technology',
        companySize: '11-50',
        search: 'tech startup',
      };

      const result = companyProfileQuerySchema.parse(queryParams);
      
      expect(result).toEqual({
        page: 2,
        limit: 20,
        industry: 'Technology',
        companySize: '11-50',
        search: 'tech startup',
      });
    });

    it('should use default values for missing parameters', () => {
      const result = companyProfileQuerySchema.parse({});
      
      expect(result).toEqual({
        page: 1,
        limit: 10,
      });
    });

    it('should reject invalid page numbers', () => {
      expect(() => companyProfileQuerySchema.parse({ page: '0' })).toThrow();
      expect(() => companyProfileQuerySchema.parse({ page: '-1' })).toThrow();
    });

    it('should reject invalid limit values', () => {
      expect(() => companyProfileQuerySchema.parse({ limit: '0' })).toThrow();
      expect(() => companyProfileQuerySchema.parse({ limit: '101' })).toThrow();
    });

    it('should reject invalid industry values', () => {
      expect(() => companyProfileQuerySchema.parse({ industry: 'InvalidIndustry' })).toThrow();
    });

    it('should reject search queries that are too long', () => {
      const longSearch = 'a'.repeat(101);
      expect(() => companyProfileQuerySchema.parse({ search: longSearch })).toThrow();
    });
  });
});