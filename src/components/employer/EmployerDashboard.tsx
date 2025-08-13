'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getEmployerStats, getEmployerJobs } from '@/lib/database';
import { EmployerStats, Job } from '@/types/database';
import { 
  Building2, 
  Plus, 
  Briefcase, 
  Users, 
  Eye, 
  FileText, 
  Settings,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';

export default function EmployerDashboard() {
  const [stats, setStats] = useState<EmployerStats>({ activeJobs: 0, totalApplications: 0, viewsThisMonth: 0 });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { employer } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!employer) return;

      try {
        const [statsData, jobsData] = await Promise.all([
          getEmployerStats(employer.id),
          getEmployerJobs(employer.id)
        ]);

        setStats(statsData);
        setRecentJobs(jobsData.slice(0, 5)); // Show only recent 5 jobs
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [employer]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Company profile not found</h2>
          <p className="text-gray-600 mt-2">Please complete your company setup first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {employer.company_name}
                </h1>
                <p className="text-gray-600">
                  Manage your job postings and find great candidates
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/post-job')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Post New Job
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeJobs}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">Currently published</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalApplications}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-gray-600">All time</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Views This Month</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.viewsThisMonth}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-purple-600">Job post views</span>
                </div>
              </div>
            </div>

            {/* Recent Jobs */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Job Postings</h2>
                  <button
                    onClick={() => router.push('/employer/jobs')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All Jobs
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {recentJobs.length > 0 ? (
                  <div className="space-y-4">
                    {recentJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{job.location || 'Remote'}</span>
                            <span className="mx-2">•</span>
                            <span>{job.job_type}</span>
                            <span className="mx-2">•</span>
                            <span className="capitalize">{job.status.toLowerCase()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{job.applications_count} applications</p>
                            <p className="text-sm text-gray-600">{job.views_count} views</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            job.status === 'Published' 
                              ? 'bg-green-100 text-green-800'
                              : job.status === 'Draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {job.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                    <p className="text-gray-600 mb-6">Start by posting your first job to attract great candidates.</p>
                    <button
                      onClick={() => router.push('/post-job')}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Post Your First Job
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/post-job')}
                  className="w-full flex items-center px-4 py-3 text-left bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-3" />
                  Post New Job
                </button>
                <button
                  onClick={() => router.push('/applications')}
                  className="w-full flex items-center px-4 py-3 text-left bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FileText className="w-5 h-5 mr-3" />
                  Manage Applications
                </button>
                <button
                  onClick={() => router.push('/employer/profile')}
                  className="w-full flex items-center px-4 py-3 text-left bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Edit Company Profile
                </button>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Company Type</p>
                  <p className="text-gray-900">{employer.company_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Industry</p>
                  <p className="text-gray-900">{employer.industry}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Company Size</p>
                  <p className="text-gray-900">{employer.company_size} employees</p>
                </div>
                {employer.city && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Location</p>
                    <p className="text-gray-900">{employer.city}, {employer.country}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}