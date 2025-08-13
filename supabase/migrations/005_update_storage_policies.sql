-- Ensure resumes bucket exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'resumes'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('resumes', 'resumes', false);
  END IF;
END $$;

-- Refresh storage RLS policies for resumes
DROP POLICY IF EXISTS "Candidates can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Resume access control" ON storage.objects;

-- Insert policy: candidate can upload into their own folder path
CREATE POLICY "Candidates can upload resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.candidates WHERE profile_id = auth.uid()
    )
  );

-- Read policy: candidate or employer who owns the job may read
CREATE POLICY "Resume access control" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes' AND (
      -- Candidate can read own resumes
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.candidates WHERE profile_id = auth.uid()
      )
      OR
      -- Employer can read resumes for their job applications
      EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON a.job_id = j.id
        JOIN public.employers e ON j.employer_id = e.id
        JOIN public.candidates c ON a.candidate_id = c.id
        WHERE e.profile_id = auth.uid()
          AND c.id::text = (storage.foldername(name))[1]
      )
    )
  );



DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'resumes'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('resumes', 'resumes', false);
  END IF;
END $$;

-- Refresh storage RLS policies for resumes
DROP POLICY IF EXISTS "Candidates can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Resume access control" ON storage.objects;

-- Insert policy: candidate can upload into their own folder path
CREATE POLICY "Candidates can upload resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.candidates WHERE profile_id = auth.uid()
    )
  );

-- Read policy: candidate or employer who owns the job may read
CREATE POLICY "Resume access control" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes' AND (
      -- Candidate can read own resumes
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.candidates WHERE profile_id = auth.uid()
      )
      OR
      -- Employer can read resumes for their job applications
      EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON a.job_id = j.id
        JOIN public.employers e ON j.employer_id = e.id
        JOIN public.candidates c ON a.candidate_id = c.id
        WHERE e.profile_id = auth.uid()
          AND c.id::text = (storage.foldername(name))[1]
      )
    )
  );





