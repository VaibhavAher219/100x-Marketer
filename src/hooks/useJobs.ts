'use client';

import { useState, useEffect } from 'react';
import { Job } from '@/types/database';
import { getPublishedJobs, getEmployerJobs } from '@/lib/database';

export function usePublishedJobs(limit?: number) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPublishedJobs(limit);
        setJobs(data);
      } catch (err) {
        console.error('Error fetching published jobs:', err);
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [limit]);

  const refetch = async () => {
    try {
      setError(null);
      const data = await getPublishedJobs(limit);
      setJobs(data);
    } catch (err) {
      console.error('Error refetching published jobs:', err);
      setError('Failed to load jobs');
    }
  };

  return { jobs, loading, error, refetch };
}

export function useEmployerJobs(employerId: string | null) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employerId) {
      setJobs([]);
      setLoading(false);
      return;
    }

    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getEmployerJobs(employerId);
        setJobs(data);
      } catch (err) {
        console.error('Error fetching employer jobs:', err);
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [employerId]);

  const refetch = async () => {
    if (!employerId) return;
    
    try {
      setError(null);
      const data = await getEmployerJobs(employerId);
      setJobs(data);
    } catch (err) {
      console.error('Error refetching employer jobs:', err);
      setError('Failed to load jobs');
    }
  };

  return { jobs, loading, error, refetch };
}

export function useJobFilters() {
  const [filters, setFilters] = useState({
    category: '',
    jobType: '',
    experienceLevel: '',
    location: '',
    remoteOnly: false,
    salaryMin: 0,
    salaryMax: 0
  });

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      jobType: '',
      experienceLevel: '',
      location: '',
      remoteOnly: false,
      salaryMin: 0,
      salaryMax: 0
    });
  };

  const applyFilters = (jobs: Job[]) => {
    return jobs.filter(job => {
      if (filters.category && job.category !== filters.category) return false;
      if (filters.jobType && job.job_type !== filters.jobType) return false;
      if (filters.experienceLevel && job.experience_level !== filters.experienceLevel) return false;
      if (filters.location && job.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.remoteOnly && !job.remote_allowed) return false;
      if (filters.salaryMin && job.salary_min && job.salary_min < filters.salaryMin) return false;
      if (filters.salaryMax && job.salary_max && job.salary_max > filters.salaryMax) return false;
      return true;
    });
  };

  return { filters, updateFilter, clearFilters, applyFilters };
}