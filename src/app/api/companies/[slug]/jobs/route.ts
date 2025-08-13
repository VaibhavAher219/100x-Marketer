import { NextRequest, NextResponse } from 'next/server';
import { companyProfileService } from '@/lib/services/company-profile';

interface RouteParams {
  params: {
    slug: string;
  };
}

// GET /api/companies/[slug]/jobs - Get jobs for a company
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Get the company profile
    const companyProfile = await companyProfileService.getBySlug(slug);
    if (!companyProfile) {
      return NextResponse.json(
        { success: false, error: 'Company profile not found' },
        { status: 404 }
      );
    }

    const offset = (page - 1) * limit;
    const jobs = await companyProfileService.getJobsByCompany(
      companyProfile.id,
      limit,
      offset
    );

    // Get total job count for pagination
    const totalJobs = await companyProfileService.getJobCount(companyProfile.id);
    const totalPages = Math.ceil(totalJobs / limit);

    return NextResponse.json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total: totalJobs,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch company jobs' },
      { status: 500 }
    );
  }
}