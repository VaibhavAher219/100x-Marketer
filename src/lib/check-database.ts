import { supabase } from './supabase';

export async function checkDatabaseTables() {
  try {
    const tables = [
      'profiles',
      'employers',
      'candidates',
      'jobs',
      'applications',
      'company_profiles',
      'employee_testimonials',
      'office_locations',
      'company_followers'
    ]
    const results: Record<string, { exists: boolean; error?: string }> = {}
    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1)
      results[table] = { exists: !error, error: error?.message }
    }
    return results
  } catch (error) {
    console.error('Database check failed:', error)
    return {}
  }
}

export async function createMissingTables() {
  try {
    // Execute company profiles migration
    const companyProfilesMigration = `
      -- Company profiles table
      CREATE TABLE IF NOT EXISTS company_profiles (
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
      CREATE TABLE IF NOT EXISTS employee_testimonials (
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
      CREATE TABLE IF NOT EXISTS office_locations (
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
      CREATE TABLE IF NOT EXISTS company_followers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        company_profile_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE,
        followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, company_profile_id)
      );
    `;

    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql: companyProfilesMigration
    });

    if (migrationError) {
      console.error('Migration error:', migrationError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to create tables:', error);
    return false;
  }
}