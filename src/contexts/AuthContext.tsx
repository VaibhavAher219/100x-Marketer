'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile, Employer, Candidate } from '@/types/database'
import { getProfile, getEmployer, getCandidate } from '@/lib/database'
import { createProfileIfNotExists } from '@/lib/database-check'
import { logger } from '@/lib/logger'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  employer: Employer | null
  candidate: Candidate | null
  loading: boolean
  profileLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  refreshProfile: () => Promise<void>
  isEmployer: boolean
  isCandidate: boolean
  hasProfile: boolean
  hasCompletedSetup: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [employer, setEmployer] = useState<Employer | null>(null)
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  const loadProfile = async (userId: string, userEmail?: string) => {
    try {
      setProfileLoading(true)
      
      let profileData;
      try {
        profileData = await getProfile(userId)
      } catch {
        // Profile doesn't exist, try to create it if we have email
        if (userEmail) {
          try {
            logger.info('Creating profile for existing user', { userId })
            profileData = await createProfileIfNotExists(userId, userEmail)
          } catch (createError) {
            logger.error('Failed to create profile', createError as Error, { userId })
            // If we can't create a profile, set everything to null and continue
            setProfile(null)
            setEmployer(null)
            setCandidate(null)
            return;
          }
        } else {
          logger.warn('No profile found and no email provided', { userId })
          setProfile(null)
          setEmployer(null)
          setCandidate(null)
          return;
        }
      }
      
      setProfile(profileData)

      // Load role-specific data only if we have a profile
      if (profileData && profileData.user_type === 'employer') {
        try {
          const employerData = await getEmployer(userId)
          setEmployer(employerData)
        } catch {
          // Employer profile doesn't exist yet
          setEmployer(null)
        }
      } else if (profileData && profileData.user_type === 'candidate') {
        try {
          const candidateData = await getCandidate(userId)
          setCandidate(candidateData)
        } catch {
          // Candidate profile doesn't exist yet
          setCandidate(null)
        }
      } else {
        // No role selected yet
        setEmployer(null)
        setCandidate(null)
      }
    } catch (error) {
      logger.error('Error loading profile', error as Error, { userId })
      // Set everything to null on any error
      setProfile(null)
      setEmployer(null)
      setCandidate(null)
    } finally {
      setProfileLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id, user.email)
    }
  }

  useEffect(() => {
    let mounted = true;
    
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        logger.warn('Auth loading timeout - setting loading to false')
        setLoading(false)
        setProfileLoading(false)
      }
    }, 10000) // 10 second timeout

    // Additional timeout specifically for profile loading
    const profileTimeout = setTimeout(() => {
      if (mounted) {
        logger.warn('Profile loading timeout - setting profileLoading to false')
        setProfileLoading(false)
      }
    }, 5000) // 5 second timeout for profile

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return;
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadProfile(session.user.id, session.user.email)
        }
        
        if (mounted) {
          setLoading(false)
          clearTimeout(loadingTimeout)
        }
      } catch (error) {
        logger.error('Error getting initial session', error as Error)
        if (mounted) {
          setLoading(false)
          clearTimeout(loadingTimeout)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadProfile(session.user.id, session.user.email)
        } else {
          setProfile(null)
          setEmployer(null)
          setCandidate(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout)
      clearTimeout(profileTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { error }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/jobs`
      }
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // Computed properties
  const isEmployer = profile?.user_type === 'employer'
  const isCandidate = profile?.user_type === 'candidate'
  const hasProfile = profile !== null
  const hasCompletedSetup = (isEmployer && employer !== null) || (isCandidate && candidate !== null)

  const value = {
    user,
    session,
    profile,
    employer,
    candidate,
    loading,
    profileLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshProfile,
    isEmployer,
    isCandidate,
    hasProfile,
    hasCompletedSetup,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}