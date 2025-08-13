import { NextRequest, NextResponse } from 'next/server';
import { companyProfileService } from '@/lib/services/company-profile';
import { createOfficeLocationSchema } from '@/lib/validations/company';
import { getServerSession } from '@/lib/auth-server';

interface RouteParams {
  params: {
    slug: string;
  };
}

// GET /api/companies/[slug]/locations - Get office locations for a company
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    
    // Get the company profile
    const companyProfile = await companyProfileService.getBySlug(slug);
    if (!companyProfile) {
      return NextResponse.json(
        { success: false, error: 'Company profile not found' },
        { status: 404 }
      );
    }

    const locations = await companyProfileService.getOfficeLocations(companyProfile.id);

    return NextResponse.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error('Error fetching office locations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch office locations' },
      { status: 500 }
    );
  }
}

// POST /api/companies/[slug]/locations - Create a new office location
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    const { session } = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the company profile and check ownership
    const companyProfile = await companyProfileService.getBySlug(slug);
    if (!companyProfile) {
      return NextResponse.json(
        { success: false, error: 'Company profile not found' },
        { status: 404 }
      );
    }

    if (companyProfile.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to add locations to this profile' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = createOfficeLocationSchema.parse({
      ...body,
      companyProfileId: companyProfile.id,
    });

    const location = await companyProfileService.createOfficeLocation(validatedData);

    return NextResponse.json({
      success: true,
      data: location,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating office location:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create office location' },
      { status: 500 }
    );
  }
}