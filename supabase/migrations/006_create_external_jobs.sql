-- Create table for external/scraped jobs
CREATE TABLE IF NOT EXISTS external_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL, -- 'indeed' | 'wellfound'
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  company_name TEXT,
  company_url TEXT,
  company_logo_url TEXT,
  location TEXT,
  is_remote BOOLEAN,
  job_type TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT,
  compensation TEXT,
  experience_level TEXT,
  category TEXT,
  skills TEXT[],
  description TEXT,
  description_html TEXT,
  apply_url TEXT,
  job_url TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  raw JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (source, external_id)
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_external_jobs_source ON external_jobs(source);
CREATE INDEX IF NOT EXISTS idx_external_jobs_posted_at ON external_jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_external_jobs_location ON external_jobs(location);

-- RLS
ALTER TABLE external_jobs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read external jobs
CREATE POLICY "External jobs are viewable by everyone" ON external_jobs
  FOR SELECT USING (true);

-- Insert/update/delete are restricted; server should use service role or direct DB connection
CREATE POLICY "Only service can modify external jobs" ON external_jobs
  FOR ALL TO authenticated USING (false) WITH CHECK (false);



CREATE TABLE IF NOT EXISTS external_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL, -- 'indeed' | 'wellfound'
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  company_name TEXT,
  company_url TEXT,
  company_logo_url TEXT,
  location TEXT,
  is_remote BOOLEAN,
  job_type TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT,
  compensation TEXT,
  experience_level TEXT,
  category TEXT,
  skills TEXT[],
  description TEXT,
  description_html TEXT,
  apply_url TEXT,
  job_url TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  raw JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (source, external_id)
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_external_jobs_source ON external_jobs(source);
CREATE INDEX IF NOT EXISTS idx_external_jobs_posted_at ON external_jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_external_jobs_location ON external_jobs(location);

-- RLS
ALTER TABLE external_jobs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read external jobs
CREATE POLICY "External jobs are viewable by everyone" ON external_jobs
  FOR SELECT USING (true);

-- Insert/update/delete are restricted; server should use service role or direct DB connection
CREATE POLICY "Only service can modify external jobs" ON external_jobs
  FOR ALL TO authenticated USING (false) WITH CHECK (false);





