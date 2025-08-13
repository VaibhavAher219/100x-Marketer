'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getCandidateStats, calculateProfileCompletion, getPublishedJobs } from '@/lib/database';
import { CandidateStats, Job } from '@/types/database';
import { 
  User, 
  Search, 
  Eye, 
  FileText, 
  Bell, 
  Settings,
  ExternalLink,
  Copy,
  CheckCircle,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  TrendingUp
} from 'lucide-react';

export default function CandidateDashboard() {
  const [stats, setStats] = useState<CandidateStats>({ profileViews: 0, applicationsSent: 0, jobAlerts: 0 });
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [jobRecommendations, setJobRecommendations] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { candidate, profile, user, loading: authLoading, profileLoading } = useAuth();
  const router = useRouter();

  // Handle routing logic
  useEffect(() => {
    if (authLoading || profileLoading) return;

    if (!user) {
      router.push('/login?redirectTo=/candidate-dashboard');
      return;
    }

    if (!profile || profile.user_type !== 'candidate') {
      router.push('/select-role');
      return;
    }

    if (!candidate) {
      router.push('/candidate-setup');
      return;
    }
  }, [user, profile, candidate, authLoading, profileLoading, router]);

  const publicProfileUrl = candidate?.public_profile_slug 
    ? `${window.location.origin}/profile/${candidate.public_profile_slug}`
    : '';

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!candidate) return;

      try {
        const [statsData, jobsData] = await Promise.all([
          getCandidateStats(),
          getPublishedJobs(5) // Get 5 job recommendations
        ]);

        setStats(statsData);
        setJobRecommendations(jobsData);
        setProfileCompletion(calculateProfileCompletion(candidate));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [candidate]);

  const copyProfileUrl = async () => {
    if (publicProfileUrl) {
      await navigator.clipboard.writeText(publicProfileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (authLoading || profileLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user || !profile || !candidate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {profile.first_name}!
                </h1>
                <p className="text-gray-600">
                  {candidate.headline || 'AI Marketing Professional'}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/jobs')}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <Search className="w-5 h-5 mr-2" />
              Browse Jobs
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Profile Completion */}
            {profileCompletion < 100 && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Complete Your Profile</h3>
                  <span className="text-sm font-medium text-green-600">{profileCompletion}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
                <p className="text-gray-600 mb-4">
                  A complete profile helps you get discovered by employers and increases your chances of landing your dream job.
                </p>
                <button
                  onClick={() => router.push('/candidate/profile')}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Complete Profile
                </button>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Profile Views</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.profileViews}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-blue-600">This month</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Applications Sent</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.applicationsSent}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <Clock className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-gray-600">All time</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Job Alerts</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.jobAlerts}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <Bell className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-purple-600">Active alerts</span>
                </div>
              </div>
            </div>

            {/* Job Recommendations */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recommended Jobs</h2>
                  <button
                    onClick={() => router.push('/jobs')}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    View All Jobs
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {jobRecommendations.length > 0 ? (
                  <div className="space-y-6">
                    {jobRecommendations.map((job) => (
                      <div key={job.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                            <div className="flex items-center text-sm text-gray-600 mb-3">
                              <Building2 className="w-4 h-4 mr-1" />
                              <span>Company Name</span>
                              <span className="mx-2">•</span>
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{job.location || 'Remote'}</span>
                              <span className="mx-2">•</span>
                              <span>{job.job_type}</span>
                            </div>
                            <p className="text-gray-700 mb-4 line-clamp-2">
                              {job.description.substring(0, 150)}...
                            </p>
                            <div className="flex items-center space-x-4">
                              {job.salary_min && job.salary_max && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  <span>${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>{new Date(job.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => router.push(`/jobs/${job.id}`)}
                            className="ml-4 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            View Job
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No job recommendations yet</h3>
                    <p className="text-gray-600 mb-6">Complete your profile to get personalized job recommendations.</p>
                    <button
                      onClick={() => router.push('/jobs')}
                      className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Browse All Jobs
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
                  onClick={() => router.push('/candidate/profile')}
                  className="w-full flex items-center px-4 py-3 text-left bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Edit Profile
                </button>
                <button
                  onClick={() => router.push('/applications')}
                  className="w-full flex items-center px-4 py-3 text-left bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FileText className="w-5 h-5 mr-3" />
                  View Applications
                </button>
                <button
                  onClick={() => router.push('/candidate/alerts')}
                  className="w-full flex items-center px-4 py-3 text-left bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Bell className="w-5 h-5 mr-3" />
                  Set Job Alerts
                </button>
              </div>
            </div>

            {/* Public Profile */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Public Profile</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Profile is live</span>
                  </div>
                </div>
                
                {publicProfileUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Public Profile URL
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={publicProfileUrl}
                        readOnly
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <button
                        onClick={copyProfileUrl}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Copy URL"
                      >
                        {copied ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => window.open(publicProfileUrl, '_blank')}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Experience</p>
                  <p className="text-gray-900">
                    {candidate.experience_years === 0 ? 'Less than 1 year' : 
                     candidate.experience_years === 1 ? '1 year' :
                     candidate.experience_years && candidate.experience_years < 6 ? `${candidate.experience_years} years` :
                     candidate.experience_years === 6 ? '6-10 years' : '10+ years'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-gray-900">{candidate.current_location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Open to Relocation</p>
                  <p className="text-gray-900">{candidate.willing_to_relocate ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}