import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/companies/route';
import { companyProfileService } from '@/lib/services/company-profile';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('@/lib/services/company-profile');
jest.mock('next-auth');

const mockCompanyProfileService = companyProfileService as jest.Mocked<typeof companyProfileService>;
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('/api/companies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/companies', () => {
    it('should return companies with pagination', async () => {
      const mockCompanies = [
        {
          id: '1',
          userId: 'user-1',
          slug: 'company-1',
          companyName: 'Company 1',
          description: 'First company',
          industry: 'Technology',
          companySize: '11-50',
          websiteUrl: null,
          logoUrl: null,
          bannerUrl: null,
          brandColor: null,
          mission: null,
          values: null,
          cultureDescription: null,
          followerCount: 5,
          isFollowing: false,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
      ];

      mockCompanyProfileService.searchCompanies.mockResolvedValue({
        companies: mockCompanies,
        total: 1,
      });

      const request = new NextRequest('http://localhost:3000/api/companies?page=1&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockCompanies);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });

      expect(mockCompanyProfileService.searchCompanies).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        10,
        0
      );
    });

    it('should handle search and filter parameters', async () => {
      mockCompanyProfileService.searchCompanies.mockResolvedValue({
        companies: [],
        total: 0,
      });

      const request = new NextRequest(
        'http://localhost:3000/api/companies?search=tech&industry=Technology&companySize=11-50&page=2&limit=5'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockCompanyProfileService.searchCompanies).toHaveBeenCalledWith(
        'tech',
        'Technology',
        '11-50',
        5,
        5
      );
    });

    it('should return 400 for invalid query parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/companies?page=0&limit=200');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid query parameters');
    });

    it('should return 500 for service errors', async () => {
      mockCompanyProfileService.searchCompanies.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/companies');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch companies');
    });
  });

  describe('POST /api/companies', () => {
    const validCompanyData = {
      companyName: 'New Tech Company',
      description: 'A new tech company',
      industry: 'Technology',
      companySize: '1-10',
      websiteUrl: 'https://newtech.com',
    };

    it('should create a new company profile', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      const mockCreatedProfile = {
        id: '456',
        userId: 'user-123',
        slug: 'new-tech-company',
        companyName: 'New Tech Company',
        description: 'A new tech company',
        industry: 'Technology',
        companySize: '1-10',
        websiteUrl: 'https://newtech.com',
        logoUrl: null,
        bannerUrl: null,
        brandColor: null,
        mission: null,
        values: null,
        cultureDescription: null,
        followerCount: 0,
        isFollowing: false,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      mockGetServerSession.mockResolvedValue(mockSession as any);
      mockCompanyProfileService.getByUserId.mockResolvedValue(null);
      mockCompanyProfileService.create.mockResolvedValue(mockCreatedProfile);

      const request = new NextRequest('http://localhost:3000/api/companies', {
        method: 'POST',
        body: JSON.stringify(validCompanyData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockCreatedProfile);

      expect(mockCompanyProfileService.create).toHaveBeenCalledWith(
        'user-123',
        validCompanyData
      );
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/companies', {
        method: 'POST',
        body: JSON.stringify(validCompanyData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 409 if company profile already exists', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      const existingProfile = {
        id: '123',
        userId: 'user-123',
        slug: 'existing-company',
        companyName: 'Existing Company',
        followerCount: 0,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      mockGetServerSession.mockResolvedValue(mockSession as any);
      mockCompanyProfileService.getByUserId.mockResolvedValue(existingProfile as any);

      const request = new NextRequest('http://localhost:3000/api/companies', {
        method: 'POST',
        body: JSON.stringify(validCompanyData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Company profile already exists');
    });

    it('should return 400 for invalid request data', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      mockGetServerSession.mockResolvedValue(mockSession as any);
      mockCompanyProfileService.getByUserId.mockResolvedValue(null);

      const invalidData = {
        companyName: '', // Invalid: empty name
        websiteUrl: 'not-a-url', // Invalid: not a URL
      };

      const request = new NextRequest('http://localhost:3000/api/companies', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request data');
    });

    it('should return 500 for service errors', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };

      mockGetServerSession.mockResolvedValue(mockSession as any);
      mockCompanyProfileService.getByUserId.mockResolvedValue(null);
      mockCompanyProfileService.create.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/companies', {
        method: 'POST',
        body: JSON.stringify(validCompanyData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to create company profile');
    });
  });
});