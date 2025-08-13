-- =====================================================
-- 100x MARKETERS JOB PORTAL - PRODUCTION MIGRATION
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- This will create all necessary tables and policies

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
-- Check if profiles table exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          user_type TEXT CHECK (user_type IN ('employer', 'candidate')),
          first_name TEXT,
          last_name TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created profiles table';
    ELSE
        RAISE NOTICE 'Profiles table already exists';
    END IF;
END $$;

-- Add missing columns to profiles table if they don't exist
DO $$ 
BEGIN
    -- Add user_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_type') THEN
        ALTER TABLE profiles ADD COLUMN user_type TEXT CHECK (user_type IN ('employer', 'candidate'));
        RAISE NOTICE 'Added user_type column to profiles';
    END IF;
    
    -- Add first_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE profiles ADD COLUMN first_name TEXT;
        RAISE NOTICE 'Added first_name column to profiles';
    END IF;
    
    -- Add last_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE profiles ADD COLUMN last_name TEXT;
        RAISE NOTICE 'Added last_name column to profiles';
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to profiles';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to profiles';
    END IF;
END $$;

-- =====================================================
-- 2. EMPLOYERS TABLE
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'employers') THEN
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
        RAISE NOTICE 'Created employers table';
    ELSE
        RAISE NOTICE 'Employers table already exists';
    END IF;
END $$;

-- =====================================================
-- 3. CANDIDATES TABLE
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'candidates') THEN
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
        RAISE NOTICE 'Created candidates table';
    ELSE
        RAISE NOTICE 'Candidates table already exists';
    END IF;
END $$;

-- =====================================================
-- 4. JOBS TABLE
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'jobs') THEN
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
        RAISE NOTICE 'Created jobs table';
    ELSE
        RAISE NOTICE 'Jobs table already exists';
    END IF;
END $$;

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES
-- =====================================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Employers policies
DROP POLICY IF EXISTS "Employers can manage own data" ON employers;
CREATE POLICY "Employers can manage own data" ON employers 
  FOR ALL USING (profile_id IN (SELECT id FROM profiles WHERE auth.uid() = id AND user_type = 'employer'));

-- Candidates policies
DROP POLICY IF EXISTS "Candidates can manage own data" ON candidates;
DROP POLICY IF EXISTS "Public can view published profiles" ON candidates;

CREATE POLICY "Candidates can manage own data" ON candidates 
  FOR ALL USING (profile_id IN (SELECT id FROM profiles WHERE auth.uid() = id AND user_type = 'candidate'));
CREATE POLICY "Public can view published profiles" ON candidates FOR SELECT 
  USING (public_profile_slug IS NOT NULL);

-- Jobs policies
DROP POLICY IF EXISTS "Employers can manage own jobs" ON jobs;
DROP POLICY IF EXISTS "Public can view published jobs" ON jobs;

CREATE POLICY "Employers can manage own jobs" ON jobs 
  FOR ALL USING (employer_id IN (SELECT id FROM employers WHERE profile_id = auth.uid()));
CREATE POLICY "Public can view published jobs" ON jobs FOR SELECT 
  USING (status = 'Published');

-- =====================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_employers_profile_id ON employers(profile_id);
CREATE INDEX IF NOT EXISTS idx_candidates_profile_id ON candidates(profile_id);
CREATE INDEX IF NOT EXISTS idx_candidates_slug ON candidates(public_profile_slug);
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);

-- =====================================================
-- 8. CREATE UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 9. ADD UPDATED_AT TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at 
  BEFORE UPDATE ON jobs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================
-- Check that all tables exist
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_name IN ('profiles', 'employers', 'candidates', 'jobs');
    
    IF table_count = 4 THEN
        RAISE NOTICE '✅ SUCCESS: All 4 tables created successfully!';
        RAISE NOTICE '✅ Tables: profiles, employers, candidates, jobs';
        RAISE NOTICE '✅ RLS policies enabled';
        RAISE NOTICE '✅ Indexes created';
        RAISE NOTICE '✅ Triggers added';
        RAISE NOTICE '';
        RAISE NOTICE '🚀 Your job portal database is ready!';
        RAISE NOTICE '🔗 You can now test at: /test-connection';
    ELSE
        RAISE NOTICE '❌ ERROR: Expected 4 tables, found %', table_count;
    END IF;
END $$;

-- Show table information
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename IN ('profiles', 'employers', 'candidates', 'jobs')
ORDER BY tablename;