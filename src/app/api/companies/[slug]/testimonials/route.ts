import { NextRequest, NextResponse } from 'next/server';
import { companyProfileService } from '@/lib/services/company-profile';
import { createEmployeeTestimonialSchema } from '@/lib/validations/company';
import { getServerSession } from '@/lib/auth-server';

interface RouteParams {
  params: {
    slug: string;
  };
}

// GET /api/companies/[slug]/testimonials - Get testimonials for a company
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

    const testimonials = await companyProfileService.getTestimonials(companyProfile.id);

    return NextResponse.json({
      success: true,
      data: testimonials,
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

// POST /api/companies/[slug]/testimonials - Create a new testimonial
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
        { success: false, error: 'Unauthorized to add testimonials to this profile' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = createEmployeeTestimonialSchema.parse({
      ...body,
      companyProfileId: companyProfile.id,
    });

    const testimonial = await companyProfileService.createTestimonial(validatedData);

    return NextResponse.json({
      success: true,
      data: testimonial,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}