'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Job } from '@/types/database';
import { 
  MapPinIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  BriefcaseIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface CompanyJobsProps {
  companyId: string;
  companySlug: string;
  limit?: number;
  showViewAll?: boolean;
  showFilters?: boolean;
}

export function CompanyJobs({ 
  companyId, 
  companySlug, 
  limit, 
  showViewAll = false,
  showFilters = false 
}: CompanyJobsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, [companySlug, limit, page]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: (limit || 10).toString(),
      });

      const response = await fetch(`/api/companies/${companySlug}/jobs?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      
      if (data.success) {
        if (page === 1) {
          setJobs(data.data);
        } else {
          setJobs(prev => [...prev, ...data.data]);
        }
        setHasMore(data.pagination.page < data.pagination.totalPages);
      } else {
        throw new Error(data.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !selectedType || job.job_type === selectedType;
    const matchesLevel = !selectedLevel || job.experience_level === selectedLevel;
    
    return matchesSearch && matchesType && matchesLevel;
  });

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  if (loading && page === 1) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-red-600">
          <p>Error loading jobs: {error}</p>
          <button 
            onClick={() => {
              setError(null);
              setPage(1);
              fetchJobs();
            }}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Job Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
            </select>

            {/* Experience Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Levels</option>
              <option value="Entry">Entry</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
              <option value="Executive">Executive</option>
            </select>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredJobs.length === 0 ? (
          <div className="p-8 text-center">
            <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              {jobs.length === 0 
                ? "This company doesn't have any open positions at the moment."
                : "No jobs match your current filters. Try adjusting your search criteria."
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>

      {/* Load More / View All */}
      {!showFilters && showViewAll && jobs.length > 0 && (
        <div className="text-center">
          <Link
            href={`/company/${companySlug}#jobs`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View all jobs
          </Link>
        </div>
      )}

      {showFilters && hasMore && !loading && (
        <div className="text-center">
          <button
            onClick={loadMore}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Load more jobs
          </button>
        </div>
      )}

      {loading && page > 1 && (
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 text-sm text-gray-600">
            <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            Loading more jobs...
          </div>
        </div>
      )}
    </div>
  );
}

interface JobCardProps {
  job: Job;
}

function JobCard({ job }: JobCardProps) {
  const formatSalary = (min?: number | null, max?: number | null, currency = 'USD') => {
    if (!min && !max) return null;
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    }
    
    return formatter.format(min || max || 0);
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const jobDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - jobDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);

  return (
    <Link href={`/jobs/${job.id}`} className="block hover:bg-gray-50 transition-colors">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
              {job.job_type && (
                <span className="flex items-center">
                  <BriefcaseIcon className="w-4 h-4 mr-1" />
                  {job.job_type}
                </span>
              )}
              
              {job.location && (
                <span className="flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  {job.location}
                  {job.remote_allowed && (
                    <span className="ml-1 text-green-600">(Remote OK)</span>
                  )}
                </span>
              )}
              
              {salary && (
                <span className="flex items-center">
                  <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                  {salary}
                </span>
              )}
              
              {job.experience_level && (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                  {job.experience_level}
                </span>
              )}
            </div>
            
            <p className="text-gray-700 line-clamp-2 mb-3">
              {job.description}
            </p>
            
            {job.skills_required && job.skills_required.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {job.skills_required.slice(0, 5).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                  >
                    {skill}
                  </span>
                ))}
                {job.skills_required.length > 5 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    +{job.skills_required.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end ml-4">
            <span className="flex items-center text-sm text-gray-500 mb-2">
              <ClockIcon className="w-4 h-4 mr-1" />
              {timeAgo(job.created_at)}
            </span>
            
            {job.applications_count > 0 && (
              <span className="text-xs text-gray-500">
                {job.applications_count} applicant{job.applications_count !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}