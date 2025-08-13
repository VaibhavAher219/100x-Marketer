-- Create applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('Applied', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired')) DEFAULT 'Applied',
  cover_letter TEXT NOT NULL,
  resume_url TEXT NOT NULL,
  application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT, -- For employer use
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate applications
  UNIQUE(job_id, candidate_id)
);

-- Create indexes for performance
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_date ON applications(application_date);

-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for applications
-- Candidates can view their own applications
CREATE POLICY "Candidates can view own applications" ON applications
  FOR SELECT USING (candidate_id IN (
    SELECT id FROM candidates WHERE profile_id = auth.uid()
  ));

-- Candidates can insert their own applications
CREATE POLICY "Candidates can create applications" ON applications
  FOR INSERT WITH CHECK (candidate_id IN (
    SELECT id FROM candidates WHERE profile_id = auth.uid()
  ));

-- Candidates can update their own applications (for withdrawal)
CREATE POLICY "Candidates can update own applications" ON applications
  FOR UPDATE USING (candidate_id IN (
    SELECT id FROM candidates WHERE profile_id = auth.uid()
  ));

-- Employers can view applications for their jobs
CREATE POLICY "Employers can view job applications" ON applications
  FOR SELECT USING (job_id IN (
    SELECT id FROM jobs WHERE employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  ));

-- Employers can update applications for their jobs
CREATE POLICY "Employers can update job applications" ON applications
  FOR UPDATE USING (job_id IN (
    SELECT id FROM jobs WHERE employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  ));

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- Storage policies for resumes
-- Candidates can upload resumes
CREATE POLICY "Candidates can upload resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resumes' AND
    (
      -- allow top-level folder candidate_id
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM candidates WHERE profile_id = auth.uid()
      )
      OR
      -- allow nested path candidate_id/job_id/filename
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM candidates WHERE profile_id = auth.uid()
      )
    )
  );

-- Resume access control
CREATE POLICY "Resume access control" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes' AND (
      -- Candidate can view their own resumes
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM candidates WHERE profile_id = auth.uid()
      ) OR
      -- Employer can view resumes for their job applications
      EXISTS (
        SELECT 1 FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN employers e ON j.employer_id = e.id
        JOIN candidates c ON a.candidate_id = c.id
        WHERE e.profile_id = auth.uid()
        AND c.id::text = (storage.foldername(name))[1]
      )
    )
  );

-- Function to update applications count on jobs table
CREATE OR REPLACE FUNCTION update_job_applications_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE jobs SET applications_count = applications_count + 1 WHERE id = NEW.job_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE jobs SET applications_count = applications_count - 1 WHERE id = OLD.job_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update applications count
CREATE TRIGGER trigger_update_job_applications_count
  AFTER INSERT OR DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_job_applications_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on applications
CREATE TRIGGER trigger_update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on applications
CREATE TRIGGER trigger_update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();