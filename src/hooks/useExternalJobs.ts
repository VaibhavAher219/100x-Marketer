'use client';

import { useEffect, useState } from 'react';

export interface ExternalJob {
  id: string;
  source: 'indeed' | 'wellfound' | string;
  external_id: string;
  title: string;
  company_name?: string | null;
  company_url?: string | null;
  company_logo_url?: string | null;
  location?: string | null;
  is_remote?: boolean | null;
  job_type?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  compensation?: string | null;
  experience_level?: string | null;
  category?: string | null;
  skills?: string[] | null;
  description?: string | null;
  description_html?: string | null;
  apply_url?: string | null;
  job_url?: string | null;
  posted_at?: string | null;
}

export function useExternalJobs(limit = 50) {
  const [jobs, setJobs] = useState<ExternalJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/external-jobs');
        if (!res.ok) throw new Error('Failed to load external jobs');
        const json = await res.json();
        const data: ExternalJob[] = json.jobs || [];
        setJobs(data.slice(0, limit));
      } catch (e: any) {
        setError(e?.message || 'Failed to load external jobs');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [limit]);

  return { jobs, loading, error };
}
 


