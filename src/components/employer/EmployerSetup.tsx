'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createEmployer } from '@/lib/database';
import { EmployerSetupData } from '@/types/database';
import { Building2, Globe, Mail, MapPin, Users, Briefcase } from 'lucide-react';

const COMPANY_TYPES = ['Startup', 'SME', 'Enterprise', 'Agency', 'Non-profit'] as const;
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'] as const;
const INDUSTRIES = [
  'Technology',
  'Marketing & Advertising',
  'E-commerce',
  'SaaS',
  'Healthcare',
  'Finance',
  'Education',
  'Media & Entertainment',
  'Retail',
  'Manufacturing',
  'Other'
];

export default function EmployerSetup() {
  const [formData, setFormData] = useState<EmployerSetupData>({
    companyName: '',
    companyType: 'Startup',
    companyEmail: '',
    companyWebsite: '',
    industry: '',
    companySize: '1-10',
    companyDescription: '',
    address: '',
    city: '',
    state: '',
    country: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<EmployerSetupData>>({});
  const { user, refreshProfile } = useAuth();
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: Partial<EmployerSetupData> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.companyEmail.trim()) {
      newErrors.companyEmail = 'Company email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
      newErrors.companyEmail = 'Please enter a valid email address';
    }

    if (formData.companyWebsite && !/^https?:\/\/.+/.test(formData.companyWebsite)) {
      newErrors.companyWebsite = 'Please enter a valid URL (starting with http:// or https://)';
    }

    if (!formData.industry) {
      newErrors.industry = 'Please select an industry';
    }

    if (!formData.companyDescription.trim()) {
      newErrors.companyDescription = 'Company description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;

    try {
      setLoading(true);
      await createEmployer(user.id, formData);
      await refreshProfile();
      router.push('/employer-dashboard');
    } catch (error) {
      console.error('Error creating employer profile:', error);
      setErrors({ companyName: 'Failed to create company profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof EmployerSetupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Set Up Your Company Profile
          </h1>
          <p className="text-gray-600">
            Tell us about your company to start attracting top AI marketing talent.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Company Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.companyName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your company name"
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Type
              </label>
              <select
                value={formData.companyType}
                onChange={(e) => handleChange('companyType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {COMPANY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Company Email *
              </label>
              <input
                type="email"
                value={formData.companyEmail}
                onChange={(e) => handleChange('companyEmail', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.companyEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="company@example.com"
              />
              {errors.companyEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.companyEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Company Website
              </label>
              <input
                type="url"
                value={formData.companyWebsite}
                onChange={(e) => handleChange('companyWebsite', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.companyWebsite ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://www.company.com"
              />
              {errors.companyWebsite && (
                <p className="mt-1 text-sm text-red-600">{errors.companyWebsite}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Industry *
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.industry ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select an industry</option>
                {INDUSTRIES.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              {errors.industry && (
                <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Company Size
              </label>
              <select
                value={formData.companySize}
                onChange={(e) => handleChange('companySize', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {COMPANY_SIZES.map(size => (
                  <option key={size} value={size}>{size} employees</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Description *
            </label>
            <textarea
              value={formData.companyDescription}
              onChange={(e) => handleChange('companyDescription', e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.companyDescription ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Tell us about your company, mission, and what makes it a great place to work..."
            />
            {errors.companyDescription && (
              <p className="mt-1 text-sm text-red-600">{errors.companyDescription}</p>
            )}
          </div>

          {/* Address Information */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Company Address
            </h3>
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Street address"
                />
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City"
                />
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="State/Province"
                />
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Profile...' : 'Complete Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}