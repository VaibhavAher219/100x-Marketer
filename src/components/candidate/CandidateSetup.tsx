'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createCandidate, updateProfile } from '@/lib/database';
import { CandidateSetupData } from '@/types/database';
import { User, MapPin, Briefcase, FileText } from 'lucide-react';

export default function CandidateSetup() {
  const [formData, setFormData] = useState<CandidateSetupData>({
    firstName: '',
    lastName: '',
    headline: '',
    summary: '',
    experienceYears: 0,
    currentLocation: '',
    willingToRelocate: false
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CandidateSetupData, string>>>({});
  const { user, profile, candidate, refreshProfile, loading: authLoading, profileLoading } = useAuth();
  const router = useRouter();

  // Handle routing logic
  useEffect(() => {
    if (authLoading || profileLoading) return;

    if (!user) {
      router.push('/login?redirectTo=/candidate-setup');
      return;
    }

    if (!profile || profile.user_type !== 'candidate') {
      router.push('/select-role');
      return;
    }

    if (candidate) {
      router.push('/candidate-dashboard');
      return;
    }
  }, [user, profile, candidate, authLoading, profileLoading, router]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CandidateSetupData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.headline.trim()) {
      newErrors.headline = 'Professional headline is required';
    } else if (formData.headline.length > 100) {
      newErrors.headline = 'Headline must be 100 characters or less';
    }

    if (!formData.summary.trim()) {
      newErrors.summary = 'Professional summary is required';
    } else if (formData.summary.length > 500) {
      newErrors.summary = 'Summary must be 500 characters or less';
    }

    if (formData.experienceYears < 0) {
      newErrors.experienceYears = 'Experience years cannot be negative';
    }

    if (!formData.currentLocation.trim()) {
      newErrors.currentLocation = 'Current location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;

    try {
      setLoading(true);
      
      // Update profile with name
      await updateProfile(user.id, {
        first_name: formData.firstName,
        last_name: formData.lastName
      });
      
      // Create candidate profile
      await createCandidate(user.id, formData);
      await refreshProfile();
      router.push('/candidate-dashboard');
    } catch (error) {
      console.error('Error creating candidate profile:', error);
      setErrors({ firstName: 'Failed to create profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CandidateSetupData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Set Up Your Professional Profile
          </h1>
          <p className="text-gray-600">
            Tell us about yourself to get matched with the perfect AI marketing opportunities.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Professional Headline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4 inline mr-1" />
              Professional Headline * 
              <span className="text-gray-500 font-normal">({formData.headline.length}/100)</span>
            </label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => handleChange('headline', e.target.value)}
              maxLength={100}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.headline ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., AI Marketing Specialist | Growth Hacker | Data-Driven Marketer"
            />
            {errors.headline && (
              <p className="mt-1 text-sm text-red-600">{errors.headline}</p>
            )}
          </div>

          {/* Professional Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Professional Summary * 
              <span className="text-gray-500 font-normal">({formData.summary.length}/500)</span>
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
              maxLength={500}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.summary ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe your experience, skills, and what makes you a great AI marketing professional..."
            />
            {errors.summary && (
              <p className="mt-1 text-sm text-red-600">{errors.summary}</p>
            )}
          </div>

          {/* Experience and Location */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <select
                value={formData.experienceYears}
                onChange={(e) => handleChange('experienceYears', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value={0}>Less than 1 year</option>
                <option value={1}>1 year</option>
                <option value={2}>2 years</option>
                <option value={3}>3 years</option>
                <option value={4}>4 years</option>
                <option value={5}>5 years</option>
                <option value={6}>6-10 years</option>
                <option value={10}>10+ years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Current Location *
              </label>
              <input
                type="text"
                value={formData.currentLocation}
                onChange={(e) => handleChange('currentLocation', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.currentLocation ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., San Francisco, CA"
              />
              {errors.currentLocation && (
                <p className="mt-1 text-sm text-red-600">{errors.currentLocation}</p>
              )}
            </div>
          </div>

          {/* Relocation Preference */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Are you willing to relocate for the right opportunity?
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="relocation"
                      checked={formData.willingToRelocate === true}
                      onChange={() => handleChange('willingToRelocate', true)}
                      className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <span className="ml-2 text-gray-700">Yes, I&apos;m open to relocating</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="relocation"
                      checked={formData.willingToRelocate === false}
                      onChange={() => handleChange('willingToRelocate', false)}
                      className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <span className="ml-2 text-gray-700">No, I prefer to stay local</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Profile...' : 'Complete Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}