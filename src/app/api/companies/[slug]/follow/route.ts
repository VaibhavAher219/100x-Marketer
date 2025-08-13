import { NextRequest, NextResponse } from 'next/server';
import { companyProfileService } from '@/lib/services/company-profile';
import { getServerSession } from '@/lib/auth-server';

interface RouteParams {
  params: {
    slug: string;
  };
}

// POST /api/companies/[slug]/follow - Follow/unfollow company
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

    // Get the company profile
    const companyProfile = await companyProfileService.getBySlug(slug);
    if (!companyProfile) {
      return NextResponse.json(
        { success: false, error: 'Company profile not found' },
        { status: 404 }
      );
    }

    // Check if user is already following
    const isCurrentlyFollowing = await companyProfileService.isFollowing(
      session.user.id,
      companyProfile.id
    );

    if (isCurrentlyFollowing) {
      // Unfollow
      await companyProfileService.unfollowCompany(session.user.id, companyProfile.id);
    } else {
      // Follow
      await companyProfileService.followCompany(session.user.id, companyProfile.id);
    }

    // Get updated follower count
    const followerCount = await companyProfileService.getFollowerCount(companyProfile.id);
    const isFollowing = !isCurrentlyFollowing;

    return NextResponse.json({
      success: true,
      isFollowing,
      followerCount,
    });
  } catch (error) {
    console.error('Error toggling follow status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update follow status' },
      { status: 500 }
    );
  }
}

// GET /api/companies/[slug]/follow - Get follow status
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    const { session } = await getServerSession();
    
    // Get the company profile
    const companyProfile = await companyProfileService.getBySlug(slug);
    if (!companyProfile) {
      return NextResponse.json(
        { success: false, error: 'Company profile not found' },
        { status: 404 }
      );
    }

    let isFollowing = false;
    if (session?.user?.id) {
      isFollowing = await companyProfileService.isFollowing(
        session.user.id,
        companyProfile.id
      );
    }

    const followerCount = await companyProfileService.getFollowerCount(companyProfile.id);

    return NextResponse.json({
      success: true,
      isFollowing,
      followerCount,
    });
  } catch (error) {
    console.error('Error fetching follow status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch follow status' },
      { status: 500 }
    );
  }
}