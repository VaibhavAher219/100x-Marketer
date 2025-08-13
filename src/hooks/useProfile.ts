'use client';

import { useState, useEffect } from 'react';
import { Profile, Employer, Candidate, EmployerStats, CandidateStats } from '@/types/database';
import { 
  getProfile, 
  getEmployer, 
  getCandidate, 
  getEmployerStats, 
  getCandidateStats,
  calculateProfileCompletion 
} from '@/lib/database';

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProfile(userId);
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const refetch = async () => {
    if (!userId) return;
    
    try {
      setError(null);
      const data = await getProfile(userId);
      setProfile(data);
    } catch (err) {
      console.error('Error refetching profile:', err);
      setError('Failed to load profile');
    }
  };

  return { profile, loading, error, refetch };
}

export function useEmployerProfile(profileId: string | null) {
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) {
      setEmployer(null);
      setLoading(false);
      return;
    }

    const fetchEmployer = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getEmployer(profileId);
        setEmployer(data);
      } catch (err) {
        console.error('Error fetching employer:', err);
        setError('Failed to load employer profile');
        setEmployer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployer();
  }, [profileId]);

  const refetch = async () => {
    if (!profileId) return;
    
    try {
      setError(null);
      const data = await getEmployer(profileId);
      setEmployer(data);
    } catch (err) {
      console.error('Error refetching employer:', err);
      setError('Failed to load employer profile');
    }
  };

  return { employer, loading, error, refetch };
}

export function useCandidateProfile(profileId: string | null) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) {
      setCandidate(null);
      setLoading(false);
      return;
    }

    const fetchCandidate = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCandidate(profileId);
        setCandidate(data);
      } catch (err) {
        console.error('Error fetching candidate:', err);
        setError('Failed to load candidate profile');
        setCandidate(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [profileId]);

  const refetch = async () => {
    if (!profileId) return;
    
    try {
      setError(null);
      const data = await getCandidate(profileId);
      setCandidate(data);
    } catch (err) {
      console.error('Error refetching candidate:', err);
      setError('Failed to load candidate profile');
    }
  };

  return { candidate, loading, error, refetch };
}

export function useEmployerStats(employerId: string | null) {
  const [stats, setStats] = useState<EmployerStats>({ activeJobs: 0, totalApplications: 0, viewsThisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employerId) {
      setStats({ activeJobs: 0, totalApplications: 0, viewsThisMonth: 0 });
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getEmployerStats(employerId);
        setStats(data);
      } catch (err) {
        console.error('Error fetching employer stats:', err);
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [employerId]);

  const refetch = async () => {
    if (!employerId) return;
    
    try {
      setError(null);
      const data = await getEmployerStats(employerId);
      setStats(data);
    } catch (err) {
      console.error('Error refetching employer stats:', err);
      setError('Failed to load stats');
    }
  };

  return { stats, loading, error, refetch };
}

export function useCandidateStats(candidateId: string | null) {
  const [stats, setStats] = useState<CandidateStats>({ profileViews: 0, applicationsSent: 0, jobAlerts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!candidateId) {
      setStats({ profileViews: 0, applicationsSent: 0, jobAlerts: 0 });
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCandidateStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching candidate stats:', err);
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [candidateId]);

  const refetch = async () => {
    if (!candidateId) return;
    
    try {
      setError(null);
      const data = await getCandidateStats();
      setStats(data);
    } catch (err) {
      console.error('Error refetching candidate stats:', err);
      setError('Failed to load stats');
    }
  };

  return { stats, loading, error, refetch };
}

export function useProfileCompletion(candidate: Candidate | null) {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    if (candidate) {
      const completionPercentage = calculateProfileCompletion(candidate);
      setCompletion(completionPercentage);
    } else {
      setCompletion(0);
    }
  }, [candidate]);

  return completion;
}