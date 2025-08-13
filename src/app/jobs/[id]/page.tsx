'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, DollarSign, Users, Building, Share2, Briefcase, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Job, Employer } from '@/types/database';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import ApplyButton from '@/components/applications/ApplyButton';
import LoadingScreen from '@/components/shared/LoadingScreen';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch job with employer details
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select(`
            *,
            employer:employers(*)
          `)
          .eq('id', jobId)
          .eq('status', 'Published')
          .single();

        if (jobError) throw jobError;
        
        setJob(jobData);
        setEmployer(jobData.employer);

        // Fetch related jobs from same employer or category
        const { data: relatedData } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'Published')
          .neq('id', jobId)
          .or(`employer_id.eq.${jobData.employer_id},category.eq.${jobData.category}`)
          .limit(5);

        setRelatedJobs(relatedData || []);

        // Increment view count
        await supabase
          .from('jobs')
          .update({ views_count: jobData.views_count + 1 })
          .eq('id', jobId);

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load job details'
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const formatSalary = (min?: number | null, max?: number | null, currency = 'USD') => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()} ${currency}`;
    if (min) return `From $${min.toLocaleString()} ${currency}`;
    if (max) return `Up to $${max.toLocaleString()} ${currency}`;
  };

  const shareJob = async (platform: string) => {
    const url = window.location.href;
    const title = `${job?.title} at ${employer?.company_name}`;
    
    switch (platform) {
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this job opportunity: ${url}`)}`;
        break;
    }
  };

  if (loading) return <LoadingScreen />;
  
  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-8">The job you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link
            href="/jobs"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Browse All Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Job Header */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{job.title}</h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Building className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="font-medium">{employer?.company_name}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                      <span>{job.location}</span>
                      {job.remote_allowed && (
                        <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          Remote OK
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                      <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    {job.job_type && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <Briefcase className="w-4 h-4 mr-1.5" />
                        {job.job_type}
                      </span>
                    )}
                    {job.experience_level && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                        <Users className="w-4 h-4 mr-1.5" />
                        {job.experience_level}
                      </span>
                    )}
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      <DollarSign className="w-4 h-4 mr-1.5" />
                       {formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined, job.salary_currency)}
                    </span>
                  </div>

                  {/* Apply Button */}
                  <ApplyButton job={job} className="w-full sm:w-auto" />
                </div>

                {/* Share Dropdown */}
                <div className="flex-shrink-0">
                  <div className="relative group">
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <div className="py-2">
                        <button
                          onClick={() => shareJob('linkedin')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Share on LinkedIn
                        </button>
                        <button
                          onClick={() => shareJob('twitter')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Share on Twitter
                        </button>
                        <button
                          onClick={() => shareJob('email')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Share via Email
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Description</h2>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                {job.description.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="mb-4 text-gray-600 leading-7">{paragraph}</p>
                  )
                ))}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  {job.requirements.split('\n').map((requirement, index) => (
                    requirement.trim() && (
                      <div key={index} className="flex items-start mb-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                        <p className="text-gray-600 leading-7">{requirement}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {job.skills_required && job.skills_required.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Required Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {job.skills_required.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            {employer && (
              <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{employer.company_name}</h3>
                  {employer.company_type && (
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {employer.company_type}
                    </span>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  {employer.company_size && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="text-sm">Company Size</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{employer.company_size}</span>
                    </div>
                  )}
                  {employer.industry && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center text-gray-600">
                        <Briefcase className="w-4 h-4 mr-2" />
                        <span className="text-sm">Industry</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{employer.industry}</span>
                    </div>
                  )}
                  {employer.city && employer.country && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">Location</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{employer.city}, {employer.country}</span>
                    </div>
                  )}
                </div>

                {employer.company_description && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{employer.company_description}</p>
                  </div>
                )}

                {employer.company_website && (
                  <a
                    href={employer.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    Visit Company Website
                  </a>
                )}
              </div>
            )}

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Similar Jobs</h3>
                <div className="space-y-4">
                  {relatedJobs.map((relatedJob) => (
                    <div key={relatedJob.id} className="group">
                      <Link
                        href={`/jobs/${relatedJob.id}`}
                        className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                      >
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-2 line-clamp-2">
                          {relatedJob.title}
                        </h4>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{relatedJob.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            {relatedJob.job_type}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(relatedJob.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}