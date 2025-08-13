-- Company profiles migration
-- This migration adds comprehensive company profile functionality

-- Company profiles table
CREATE TABLE company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slug VARCHAR(100) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  description TEXT,
  industry VARCHAR(100),
  company_size VARCHAR(50),
  website_url VARCHAR(255),
  logo_url VARCHAR(255),
  banner_url VARCHAR(255),
  brand_color VARCHAR(7),
  mission TEXT,
  values TEXT[],
  culture_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee testimonials
CREATE TABLE employee_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_profile_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE,
  employee_name VARCHAR(255) NOT NULL,
  employee_role VARCHAR(255) NOT NULL,
  testimonial TEXT NOT NULL,
  employee_photo_url VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Office locations
CREATE TABLE office_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_profile_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE,
  location_name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  country VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  office_photos TEXT[],
  is_headquarters BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company followers
CREATE TABLE company_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_profile_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE,
  followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, company_profile_id)
);

-- Add indexes for performance
CREATE INDEX idx_company_profiles_user_id ON company_profiles(user_id);
CREATE INDEX idx_company_profiles_slug ON company_profiles(slug);
CREATE INDEX idx_employee_testimonials_company_id ON employee_testimonials(company_profile_id);
CREATE INDEX idx_employee_testimonials_order ON employee_testimonials(company_profile_id, display_order);
CREATE INDEX idx_office_locations_company_id ON office_locations(company_profile_id);
CREATE INDEX idx_company_followers_user_id ON company_followers(user_id);
CREATE INDEX idx_company_followers_company_id ON company_followers(company_profile_id);

-- Add RLS policies
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_followers ENABLE ROW LEVEL SECURITY;

-- Company profiles policies
CREATE POLICY "Company profiles are viewable by everyone" ON company_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own company profile" ON company_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company profile" ON company_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company profile" ON company_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Employee testimonials policies
CREATE POLICY "Employee testimonials are viewable by everyone" ON employee_testimonials
  FOR SELECT USING (true);

CREATE POLICY "Company owners can manage testimonials" ON employee_testimonials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM company_profiles 
      WHERE id = company_profile_id AND user_id = auth.uid()
    )
  );

-- Office locations policies
CREATE POLICY "Office locations are viewable by everyone" ON office_locations
  FOR SELECT USING (true);

CREATE POLICY "Company owners can manage office locations" ON office_locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM company_profiles 
      WHERE id = company_profile_id AND user_id = auth.uid()
    )
  );

-- Company followers policies
CREATE POLICY "Users can view their own follows" ON company_followers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can follow companies" ON company_followers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow companies" ON company_followers
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_profiles_updated_at 
  BEFORE UPDATE ON company_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add function to generate unique slug
CREATE OR REPLACE FUNCTION generate_company_slug(company_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from company name
  base_slug := lower(regexp_replace(company_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  -- Ensure slug is not empty
  IF base_slug = '' THEN
    base_slug := 'company';
  END IF;
  
  -- Check if slug exists and increment if needed
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM company_profiles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;