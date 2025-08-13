'use client';

import { useState } from 'react';
import { usePublishedJobs, useJobFilters } from '@/hooks/useJobs';
import { useExternalJobs } from '@/hooks/useExternalJobs';
import { Job } from '@/types/database';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Building2, 
  Search,
  Filter,
  ChevronDown,
  Briefcase
} from 'lucide-react';
import { InlineLoader } from '@/components/shared/LoadingSpinner';
import type { ExternalJob } from '@/hooks/useExternalJobs';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance'];
const EXPERIENCE_LEVELS = ['Entry', 'Mid', 'Senior', 'Executive'];
const JOB_CATEGORIES = [
  'AI Marketing Specialist',
  'Growth Hacker',
  'Content Creator',
  'Marketing Automation Expert',
  'Data-Driven Marketer',
  'Social Media AI Strategist',
  'Performance Marketing',
  'Email Marketing',
  'SEO/SEM Specialist',
  'Marketing Analytics'
];

export default function JobListings() {
  const { jobs, loading, error } = usePublishedJobs(50);
  const { jobs: externalJobs, loading: loadingExternal } = useExternalJobs(50);
  const { filters, updateFilter, clearFilters, applyFilters } = useJobFilters();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = applyFilters(
    jobs.filter(job => 
      searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const externalCards = externalJobs
    .filter(j =>
      searchQuery === '' ||
      (j.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.company_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((j) => (
      <ExternalJobCard key={`${j.source}-${j.external_id}`} job={j} />
    ));

  if (loading) {
    return <InlineLoader text="Loading job opportunities..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load jobs</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Available Opportunities
        </h2>
        <p className="text-gray-600 mb-6">
          Discover your next AI marketing role from our curated job listings.
        </p>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search jobs by title, company, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {JOB_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  value={filters.jobType}
                  onChange={(e) => updateFilter('jobType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {JOB_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  value={filters.experienceLevel}
                  onChange={(e) => updateFilter('experienceLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Levels</option>
                  {EXPERIENCE_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City, State"
                  value={filters.location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.remoteOnly}
                  onChange={(e) => updateFilter('remoteOnly', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Remote jobs only</span>
              </label>

              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500">Sort by:</span>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Recommended</option>
              <option>Newest</option>
              <option>Salary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Listings (internal + external) */}
      {(filteredJobs.length > 0 || externalCards.length > 0) ? (
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          {externalCards}
        </div>
      ) : (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search criteria or check back later for new opportunities.
          </p>
          <button
            onClick={clearFilters}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min || !max) return null;
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {job.title}
          </h3>
          <p className="text-sm text-gray-500 mb-2">Posted {timeAgo(job.created_at)}</p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <Building2 className="w-4 h-4 mr-1" />
              <span>Company Name</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{job.location || 'Remote'}</span>
              {job.remote_allowed && job.location && (
                <span className="ml-1 text-green-600">(Remote OK)</span>
              )}
            </div>
            
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{job.job_type}</span>
            </div>
            
            {job.salary_min && job.salary_max && (
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                <span>{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
              </div>
            )}
          </div>
          
          <p className="text-gray-700 mb-4 line-clamp-3">
            {job.description.substring(0, 200)}...
          </p>
          
          {job.skills_required.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills_required.slice(0, 5).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
              {job.skills_required.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  +{job.skills_required.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="ml-6 text-right">
          <a href={`/jobs/${job.id}`} className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md">
            View Details
          </a>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>{job.experience_level} Level</span>
          <span>•</span>
          <span>{job.category}</span>
          <span>•</span>
          <span>{job.views_count} views</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function ExternalJobCard({ job }: { job: ExternalJob }) {
  const formatSalary = (min?: number | null, max?: number | null, currency = 'USD') => {
    if (!min && !max) return null;
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    if (max) return `Up to ${currency} ${max.toLocaleString()}`;
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
              {job.source}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 truncate">{job.title}</h3>
          <div className="text-sm text-gray-600 truncate">{job.company_name || 'Company'}</div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-3">
            {job.location && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{job.location}</span>
              </div>
            )}
            {job.job_type && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span className="capitalize">{job.job_type}</span>
              </div>
            )}
            {formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined, job.salary_currency || 'USD') && (
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                <span>{formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined, job.salary_currency || 'USD')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="ml-6 flex-shrink-0">
          {job.apply_url ? (
            <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md">
              Apply Externally
            </a>
          ) : job.job_url ? (
            <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-md">
              View Posting
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}
