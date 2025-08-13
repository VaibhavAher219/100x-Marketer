import { NextRequest, NextResponse } from 'next/server';
import { companyProfileService } from '@/lib/services/company-profile';
import { createCompanyProfileSchema, companyProfileQuerySchema } from '@/lib/validations/company';
import { getServerSession } from '@/lib/auth-server';

// GET /api/companies - List companies with search and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedParams = companyProfileQuerySchema.parse(queryParams);
    
    const { page, limit, industry, companySize, search } = validatedParams;
    const offset = (page - 1) * limit;

    const { companies, total } = await companyProfileService.searchCompanies(
      search,
      industry,
      companySize,
      limit,
      offset
    );

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: companies,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

// POST /api/companies - Create a new company profile
export async function POST(request: NextRequest) {
  try {
    const { session } = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user already has a company profile
    const existingProfile = await companyProfileService.getByUserId(session.user.id);
    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Company profile already exists' },
        { status: 409 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = createCompanyProfileSchema.parse(body);

    const companyProfile = await companyProfileService.create(session.user.id, validatedData);

    return NextResponse.json({
      success: true,
      data: companyProfile,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating company profile:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create company profile' },
      { status: 500 }
    );
  }
}