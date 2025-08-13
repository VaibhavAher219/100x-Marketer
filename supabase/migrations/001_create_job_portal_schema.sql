-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_type TEXT CHECK (user_type IN ('employer', 'candidate')),
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employers table
CREATE TABLE employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_type TEXT CHECK (company_type IN ('Startup', 'SME', 'Enterprise', 'Agency', 'Non-profit')),
  company_email TEXT,
  company_website TEXT,
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  industry TEXT,
  company_description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create candidates table
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  headline TEXT,
  summary TEXT,
  experience_years INTEGER,
  current_salary INTEGER,
  expected_salary INTEGER,
  current_location TEXT,
  willing_to_relocate BOOLEAN DEFAULT FALSE,
  resume_url TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  public_profile_slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'USD',
  job_type TEXT CHECK (job_type IN ('Full-time', 'Part-time', 'Contract', 'Freelance')),
  location TEXT,
  remote_allowed BOOLEAN DEFAULT FALSE,
  experience_level TEXT CHECK (experience_level IN ('Entry', 'Mid', 'Senior', 'Executive')),
  category TEXT,
  skills_required TEXT[],
  status TEXT CHECK (status IN ('Draft', 'Published', 'Paused', 'Closed')) DEFAULT 'Draft',
  applications_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for employers
CREATE POLICY "Employers can manage own data" ON employers 
  FOR ALL USING (profile_id IN (SELECT id FROM profiles WHERE auth.uid() = id AND user_type = 'employer'));

-- RLS Policies for candidates
CREATE POLICY "Candidates can manage own data" ON candidates 
  FOR ALL USING (profile_id IN (SELECT id FROM profiles WHERE auth.uid() = id AND user_type = 'candidate'));
CREATE POLICY "Public can view published profiles" ON candidates FOR SELECT 
  USING (public_profile_slug IS NOT NULL);

-- RLS Policies for jobs
CREATE POLICY "Employers can manage own jobs" ON jobs 
  FOR ALL USING (employer_id IN (SELECT id FROM employers WHERE profile_id = auth.uid()));
CREATE POLICY "Public can view published jobs" ON jobs FOR SELECT 
  USING (status = 'Published');

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_employers_profile_id ON employers(profile_id);
CREATE INDEX idx_candidates_profile_id ON candidates(profile_id);
CREATE INDEX idx_candidates_slug ON candidates(public_profile_slug);
CREATE INDEX idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_category ON jobs(category);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();