import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { applicationService } from '@/lib/applications';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const application = await applicationService.getApplicationById(params.id);

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check if user has permission to view this application
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, user_type')
      .eq('id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Candidates can only view their own applications
    if (profile.user_type === 'candidate') {
      const { data: candidate } = await supabase
        .from('candidates')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      if (!candidate || application.candidate_id !== candidate.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    // Employers can only view applications for their jobs
    else if (profile.user_type === 'employer') {
      const { data: employer } = await supabase
        .from('employers')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      if (!employer || application.job?.employer_id !== employer.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ application });
  } catch (error: unknown) {
    console.error('Get application error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Verify user is an employer and owns the job
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, user_type')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.user_type !== 'employer') {
      return NextResponse.json({ error: 'Only employers can update application status' }, { status: 403 });
    }

    const application = await applicationService.updateApplicationStatus(params.id, status, notes);

    return NextResponse.json({ application });
  } catch (error: unknown) {
    console.error('Update application error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update application' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify user is a candidate and owns the application
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, user_type')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.user_type !== 'candidate') {
      return NextResponse.json({ error: 'Only candidates can withdraw applications' }, { status: 403 });
    }

    const { data: candidate } = await supabase
      .from('candidates')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
    }

    // Verify ownership
    const { data: application } = await supabase
      .from('applications')
      .select('candidate_id')
      .eq('id', params.id)
      .single();

    if (!application || application.candidate_id !== candidate.id) {
      return NextResponse.json({ error: 'Application not found or access denied' }, { status: 404 });
    }

    await applicationService.withdrawApplication(params.id);

    return NextResponse.json({ message: 'Application withdrawn successfully' });
  } catch (error: unknown) {
    console.error('Delete application error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to withdraw application' },
      { status: 500 }
    );
  }
}