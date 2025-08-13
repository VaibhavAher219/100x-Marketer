import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { applicationService } from '@/lib/applications';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const jobId = searchParams.get('job_id');
    const search = searchParams.get('search');

    // Get user profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, user_type')
      .eq('id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    let applications: unknown;
    const filters: Record<string, unknown> = {
      ...(status ? { status } : {}),
      ...(jobId ? { job_id: jobId } : {}),
      ...(search ? { search } : {}),
    };

    if (profile.user_type === 'candidate') {
      applications = await applicationService.getCandidateApplications(profile.id);
    } else if (profile.user_type === 'employer') {
      applications = await applicationService.getEmployerApplications(profile.id, filters);
    } else {
      return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
    }

    return NextResponse.json({ applications });
  } catch (error: unknown) {
    console.error('Applications API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { job_id, cover_letter, resume_url } = body;

    if (!job_id || !cover_letter || !resume_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get candidate profile
    const { data: candidate } = await supabase
      .from('candidates')
      .select('id')
      .eq('profile_id', session.user.id)
      .single();

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
    }

    const application = await applicationService.submitApplication({
      job_id,
      candidate_id: candidate.id,
      cover_letter,
      resume_url
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error: unknown) {
    console.error('Application submission error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit application' },
      { status: 500 }
    );
  }
}