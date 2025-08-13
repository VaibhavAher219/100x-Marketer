import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CompanyProfileService } from '@/lib/services/company-profile';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('CompanyProfileService', () => {
  let service: CompanyProfileService;
  
  beforeEach(() => {
    service = new CompanyProfileService();
    jest.clearAllMocks();
  });

  describe('generateSlug', () => {
    it('should generate a unique slug from company name', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 'tech-company',
        error: null,
      });

      const slug = await service.generateSlug('Tech Company');
      
      expect(slug).toBe('tech-company');
      expect(mockSupabase.rpc).toHaveBeenCalledWith('generate_company_slug', {
        company_name: 'Tech Company',
      });
    });

    it('should throw error if slug generation fails', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(service.generateSlug('Tech Company')).rejects.toThrow(
        'Failed to generate company slug'
      );
    });
  });

  describe('getBySlug', () => {
    const mockCompanyRow = {
      id: '123',
      user_id: 'user-123',
      slug: 'tech-company',
      company_name: 'Tech Company',
      description: 'A tech company',
      industry: 'Technology',
      company_size: '11-50',
      website_url: 'https://techcompany.com',
      logo_url: 'https://example.com/logo.png',
      banner_url: 'https://example.com/banner.png',
      brand_color: '#000000',
      mission: 'To innovate',
      values: ['Innovation', 'Quality'],
      culture_description: 'Great culture',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    it('should return company profile by slug', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockCompanyRow,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      // Mock follower count
      jest.spyOn(service, 'getFollowerCount').mockResolvedValue(5);

      const result = await service.getBySlug('tech-company');

      expect(result).toEqual({
        id: '123',
        userId: 'user-123',
        slug: 'tech-company',
        companyName: 'Tech Company',
        description: 'A tech company',
        industry: 'Technology',
        companySize: '11-50',
        websiteUrl: 'https://techcompany.com',
        logoUrl: 'https://example.com/logo.png',
        bannerUrl: 'https://example.com/banner.png',
        brandColor: '#000000',
        mission: 'To innovate',
        values: ['Innovation', 'Quality'],
        cultureDescription: 'Great culture',
        followerCount: 5,
        isFollowing: false,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('company_profiles');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('slug', 'tech-company');
      expect(mockQuery.single).toHaveBeenCalled();
    });

    it('should return null if company not found', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }, // Not found error
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await service.getBySlug('non-existent');
      expect(result).toBeNull();
    });

    it('should throw error for database errors', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'OTHER_ERROR', message: 'Database error' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await expect(service.getBySlug('tech-company')).rejects.toThrow(
        'Failed to fetch company profile'
      );
    });
  });

  describe('create', () => {
    const createData = {
      companyName: 'New Tech Company',
      description: 'A new tech company',
      industry: 'Technology',
      companySize: '1-10',
      websiteUrl: 'https://newtech.com',
    };

    it('should create a new company profile', async () => {
      const mockInsertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: '456',
            user_id: 'user-456',
            slug: 'new-tech-company',
            company_name: 'New Tech Company',
            description: 'A new tech company',
            industry: 'Technology',
            company_size: '1-10',
            website_url: 'https://newtech.com',
            logo_url: null,
            banner_url: null,
            brand_color: null,
            mission: null,
            values: null,
            culture_description: null,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockInsertQuery as any);
      jest.spyOn(service, 'generateSlug').mockResolvedValue('new-tech-company');

      const result = await service.create('user-456', createData);

      expect(result.companyName).toBe('New Tech Company');
      expect(result.slug).toBe('new-tech-company');
      expect(result.userId).toBe('user-456');

      expect(mockInsertQuery.insert).toHaveBeenCalledWith({
        user_id: 'user-456',
        slug: 'new-tech-company',
        company_name: 'New Tech Company',
        description: 'A new tech company',
        industry: 'Technology',
        company_size: '1-10',
        website_url: 'https://newtech.com',
        logo_url: undefined,
        banner_url: undefined,
        brand_color: undefined,
        mission: undefined,
        values: undefined,
        culture_description: undefined,
      });
    });

    it('should throw error if creation fails', async () => {
      const mockInsertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockInsertQuery as any);
      jest.spyOn(service, 'generateSlug').mockResolvedValue('new-tech-company');

      await expect(service.create('user-456', createData)).rejects.toThrow(
        'Failed to create company profile'
      );
    });
  });

  describe('followCompany', () => {
    it('should follow a company', async () => {
      const mockInsertQuery = {
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockInsertQuery as any);

      await service.followCompany('user-123', 'company-456');

      expect(mockSupabase.from).toHaveBeenCalledWith('company_followers');
      expect(mockInsertQuery.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        company_profile_id: 'company-456',
      });
    });

    it('should throw error if follow fails', async () => {
      const mockInsertQuery = {
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockInsertQuery as any);

      await expect(service.followCompany('user-123', 'company-456')).rejects.toThrow(
        'Failed to follow company'
      );
    });
  });

  describe('getFollowerCount', () => {
    it('should return follower count', async () => {
      const mockCountQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          count: 10,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockCountQuery as any);

      const count = await service.getFollowerCount('company-123');

      expect(count).toBe(10);
      expect(mockSupabase.from).toHaveBeenCalledWith('company_followers');
      expect(mockCountQuery.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
      expect(mockCountQuery.eq).toHaveBeenCalledWith('company_profile_id', 'company-123');
    });

    it('should return 0 if count fails', async () => {
      const mockCountQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          count: null,
          error: { message: 'Count failed' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockCountQuery as any);

      const count = await service.getFollowerCount('company-123');
      expect(count).toBe(0);
    });
  });

  describe('searchCompanies', () => {
    const mockCompanies = [
      {
        id: '1',
        user_id: 'user-1',
        slug: 'company-1',
        company_name: 'Company 1',
        description: 'First company',
        industry: 'Technology',
        company_size: '11-50',
        website_url: null,
        logo_url: null,
        banner_url: null,
        brand_color: null,
        mission: null,
        values: null,
        culture_description: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ];

    it('should search companies with filters', async () => {
      const mockSearchQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockCompanies,
          error: null,
          count: 1,
        }),
      };

      mockSupabase.from.mockReturnValue(mockSearchQuery as any);
      jest.spyOn(service, 'getFollowerCount').mockResolvedValue(5);

      const result = await service.searchCompanies('tech', 'Technology', '11-50', 10, 0);

      expect(result.companies).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.companies[0].companyName).toBe('Company 1');

      expect(mockSearchQuery.or).toHaveBeenCalledWith(
        'company_name.ilike.%tech%,description.ilike.%tech%'
      );
      expect(mockSearchQuery.eq).toHaveBeenCalledWith('industry', 'Technology');
      expect(mockSearchQuery.eq).toHaveBeenCalledWith('company_size', '11-50');
    });

    it('should handle search without filters', async () => {
      const mockSearchQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockCompanies,
          error: null,
          count: 1,
        }),
      };

      mockSupabase.from.mockReturnValue(mockSearchQuery as any);
      jest.spyOn(service, 'getFollowerCount').mockResolvedValue(0);

      const result = await service.searchCompanies(undefined, undefined, undefined, 10, 0);

      expect(result.companies).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});