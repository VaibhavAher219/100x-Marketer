import { NextRequest, NextResponse } from 'next/server';
import { companyProfileService } from '@/lib/services/company-profile';
import { updateCompanyProfileSchema } from '@/lib/validations/company';
import { getServerSession } from '@/lib/auth-server';

interface RouteParams {
  params: {
    slug: string;
  };
}

// GET /api/companies/[slug] - Get company profile by slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    const { session } = await getServerSession();
    
    const companyProfile = await companyProfileService.getWithDetails(
      slug,
      session?.user?.id
    );

    if (!companyProfile) {
      return NextResponse.json(
        { success: false, error: 'Company profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: companyProfile,
    });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch company profile' },
      { status: 500 }
    );
  }
}

// PUT /api/companies/[slug] - Update company profile
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    const { session } = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the company profile to check ownership
    const existingProfile = await companyProfileService.getBySlug(slug);
    if (!existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Company profile not found' },
        { status: 404 }
      );
    }

    if (existingProfile.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to update this profile' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = updateCompanyProfileSchema.parse({
      ...body,
      id: existingProfile.id,
    });

    const updatedProfile = await companyProfileService.update(
      existingProfile.id,
      validatedData
    );

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating company profile:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update company profile' },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[slug] - Delete company profile
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    const { session } = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the company profile to check ownership
    const existingProfile = await companyProfileService.getBySlug(slug);
    if (!existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Company profile not found' },
        { status: 404 }
      );
    }

    if (existingProfile.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to delete this profile' },
        { status: 403 }
      );
    }

    await companyProfileService.delete(existingProfile.id);

    return NextResponse.json({
      success: true,
      message: 'Company profile deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting company profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete company profile' },
      { status: 500 }
    );
  }
}