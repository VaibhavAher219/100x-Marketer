import { supabase } from './supabase';
import { logger } from './logger';

export async function checkDatabaseSetup() {
  try {
    // Try to query the profiles table to see if it exists
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      logger.error('Database setup check failed', error);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Database setup check failed', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

export async function createProfileIfNotExists(userId: string, email: string) {
  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      return existingProfile;
    }

    // Create profile if it doesn't exist
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        user_type: null
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating profile', error, { userId, email });
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Error in createProfileIfNotExists', error instanceof Error ? error : new Error(String(error)), { userId, email });
    throw error;
  }
}