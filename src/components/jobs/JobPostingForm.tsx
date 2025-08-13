'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createJob } from '@/lib/database';
import { JobPostingData } from '@/types/database';
import { 
  Briefcase, 
  DollarSign, 
  MapPin, 
  Clock, 
  Users, 
  Tag,
  Eye,
  Save,
  Send,
  X
} from 'lucide-react';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance'] as const;
const EXPERIENCE_LEVELS = ['Entry', 'Mid', 'Senior', 'Executive'] as const;
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] as const;
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
  'Marketing Analytics',
  'Other'
];

const COMMON_SKILLS = [
  'AI Tools', 'ChatGPT', 'Google Analytics', 'Facebook Ads', 'Google Ads',
  'HubSpot', 'Salesforce', 'Mailchimp', 'Hootsuite', 'Canva',
  'Adobe Creative Suite', 'Figma', 'WordPress', 'Shopify', 'Python',
  'SQL', 'Tableau', 'Power BI', 'A/B Testing', 'Conversion Optimization',
  'Content Marketing', 'Social Media Marketing', 'Email Marketing',
  'SEO', 'SEM', 'PPC', 'Influencer Marketing', 'Brand Management'
];

export default function JobPostingForm() {
  const [formData, setFormData] = useState<JobPostingData>({
    title: '',
    description: '',
    requirements: '',
    salaryMin: 0,
    salaryMax: 0,
    salaryCurrency: 'USD',
    jobType: 'Full-time',
    location: '',
    remoteAllowed: false,
    experienceLevel: 'Mid',
    category: '',
    skillsRequired: [],
    status: 'Draft'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof JobPostingData, string>>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const { employer } = useAuth();
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof JobPostingData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a job category';
    }

    if (formData.salaryMin && formData.salaryMax && formData.salaryMin >= formData.salaryMax) {
      newErrors.salaryMin = 'Minimum salary must be less than maximum salary';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status: 'Draft' | 'Published') => {
    if (!validateForm() || !employer) return;

    try {
      setLoading(true);
      const jobData = { ...formData, status };
      await createJob(employer.id, jobData);
      router.push('/employer-dashboard');
    } catch (error) {
      console.error('Error creating job:', error);
      setErrors({ title: 'Failed to create job. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof JobPostingData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skillsRequired.includes(skill)) {
      handleChange('skillsRequired', [...formData.skillsRequired, skill]);
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    handleChange('skillsRequired', formData.skillsRequired.filter(skill => skill !== skillToRemove));
  };

  if (showPreview) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl shadow-lg">
          {/* Preview Header */}
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Job Preview</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Job Preview Content */}
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{formData.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{formData.location || 'Remote'}</span>
                  {formData.remoteAllowed && <span className="ml-1">(Remote OK)</span>}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{formData.jobType}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{formData.experienceLevel} Level</span>
                </div>
                {formData.salaryMin && formData.salaryMax && (
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>
                      {formData.salaryCurrency} {formData.salaryMin.toLocaleString()} - {formData.salaryMax.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{formData.description}</p>
                </div>
              </div>

              {formData.requirements && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{formData.requirements}</p>
                  </div>
                </div>
              )}

              {formData.skillsRequired.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.skillsRequired.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Actions */}
          <div className="p-6 border-t bg-gray-50 flex justify-between">
            <button
              onClick={() => setShowPreview(false)}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Edit Job
            </button>
            <div className="flex space-x-4">
              <button
                onClick={() => handleSubmit('Draft')}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5 inline mr-2" />
                Save as Draft
              </button>
              <button
                onClick={() => handleSubmit('Published')}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5 inline mr-2" />
                Publish Job
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Job</h1>
          <p className="text-gray-600">
            Create a compelling job posting to attract the best AI marketing talent.
          </p>
        </div>

        <form className="space-y-8">
          {/* Basic Job Information */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Senior AI Marketing Specialist"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Job Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  {JOB_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Job Type
                </label>
                <select
                  value={formData.jobType}
                  onChange={(e) => handleChange('jobType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {JOB_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={8}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements & Qualifications
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => handleChange('requirements', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="List the required qualifications, experience, and skills..."
              />
            </div>
          </div>

          {/* Location and Remote */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Location & Work Arrangement</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., San Francisco, CA or leave empty for remote-only"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Experience Level
                </label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => handleChange('experienceLevel', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {EXPERIENCE_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.remoteAllowed}
                  onChange={(e) => handleChange('remoteAllowed', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Remote work allowed</span>
              </label>
            </div>
          </div>

          {/* Salary */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              <DollarSign className="w-5 h-5 inline mr-2" />
              Salary Range (Optional)
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={formData.salaryCurrency}
                  onChange={(e) => handleChange('salaryCurrency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {CURRENCIES.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Salary
                </label>
                <input
                  type="number"
                  value={formData.salaryMin || ''}
                  onChange={(e) => handleChange('salaryMin', parseInt(e.target.value) || 0)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.salaryMin ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="50000"
                />
                {errors.salaryMin && (
                  <p className="mt-1 text-sm text-red-600">{errors.salaryMin}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Salary
                </label>
                <input
                  type="number"
                  value={formData.salaryMax || ''}
                  onChange={(e) => handleChange('salaryMax', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="80000"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Required Skills</h3>
            
            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type a skill and press Enter"
                />
                <button
                  type="button"
                  onClick={() => addSkill(skillInput)}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Common Skills */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">Or select from common skills:</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    disabled={formData.skillsRequired.includes(skill)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      formData.skillsRequired.includes(skill)
                        ? 'bg-blue-100 text-blue-800 border-blue-200 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Skills */}
            {formData.skillsRequired.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Selected Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.skillsRequired.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-between pt-8 border-t">
            <button
              type="button"
              onClick={() => router.push('/employer-dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="px-6 py-3 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Eye className="w-5 h-5 inline mr-2" />
                Preview
              </button>
              
              <button
                type="button"
                onClick={() => handleSubmit('Draft')}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5 inline mr-2" />
                Save as Draft
              </button>
              
              <button
                type="button"
                onClick={() => handleSubmit('Published')}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5 inline mr-2" />
                {loading ? 'Publishing...' : 'Publish Job'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}