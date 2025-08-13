'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createProfile, updateProfile } from '@/lib/database';
import { Building2, User, ArrowRight } from 'lucide-react';

export default function RoleSelection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();

  const handleRoleSelect = async (role: 'employer' | 'candidate') => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      console.log('Selecting role:', role, 'for user:', user.id);

      if (profile) {
        // Update existing profile
        await updateProfile(user.id, { user_type: role });
      } else {
        // Create new profile
        await createProfile(user.id, user.email!, role);
      }

      console.log('Profile updated, refreshing auth context...');
      
      // Refresh profile data and wait for it to complete
      await refreshProfile();
      
      console.log('Profile refreshed, navigating...');
      
      // Use router.push for proper Next.js navigation
      const redirectPath = role === 'employer' ? '/employer-setup' : '/candidate-setup';
      router.push(redirectPath);
    } catch (err) {
      console.error('Error selecting role:', err);
      setError('Failed to select role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to 100x Marketers Jobs
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your role to get started with the perfect job portal experience tailored for you.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Employer Card */}
          <div
            onClick={() => !loading && handleRoleSelect('employer')}
            className={`
              relative bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent
              hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer
              ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
            `}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-blue-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                I&apos;m an Employer
              </h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Post job openings, find qualified AI marketing professionals, and build your dream team.
              </p>
              
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Post unlimited job listings
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Access qualified candidate profiles
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Manage applications efficiently
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Build your company brand
                </li>
              </ul>
              
              <div className="flex items-center justify-center text-blue-600 font-semibold">
                Get Started as Employer
                <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </div>
          </div>

          {/* Candidate Card */}
          <div
            onClick={() => !loading && handleRoleSelect('candidate')}
            className={`
              relative bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent
              hover:border-green-500 hover:shadow-xl transition-all duration-300 cursor-pointer
              ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
            `}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                I&apos;m a Candidate
              </h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Discover amazing AI marketing opportunities and advance your career with top companies.
              </p>
              
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Browse curated job opportunities
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Create your professional profile
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Get matched with relevant roles
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Track your applications
                </li>
              </ul>
              
              <div className="flex items-center justify-center text-green-600 font-semibold">
                Get Started as Candidate
                <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Setting up your account...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}