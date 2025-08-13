'use client';

import { CompanyProfileWithDetails } from '@/types/company';
import { 
  BuildingOfficeIcon,
  UsersIcon,
  GlobeAltIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface CompanyInfoProps {
  company: CompanyProfileWithDetails;
}

export function CompanyInfo({ company }: CompanyInfoProps) {
  const infoItems = [
    {
      icon: BuildingOfficeIcon,
      label: 'Industry',
      value: company.industry,
    },
    {
      icon: UsersIcon,
      label: 'Company Size',
      value: company.companySize ? `${company.companySize} employees` : null,
    },
    {
      icon: GlobeAltIcon,
      label: 'Website',
      value: company.websiteUrl,
      isLink: true,
    },
    {
      icon: CalendarIcon,
      label: 'Founded',
      value: company.createdAt ? new Date(company.createdAt).getFullYear().toString() : null,
    },
  ].filter(item => item.value);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">About {company.companyName}</h2>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Company Description */}
        {company.description && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {company.description}
            </p>
          </div>
        )}

        {/* Company Details Grid */}
        {infoItems.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Company Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {infoItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <item.icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.label}</div>
                    {item.isLink && item.value ? (
                      <a
                        href={item.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors truncate block"
                      >
                        {item.value.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <div className="text-sm text-gray-600">{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mission Statement */}
        {company.mission && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {company.mission}
            </p>
          </div>
        )}

        {/* Company Values */}
        {company.values && company.values.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Our Values</h3>
            <div className="flex flex-wrap gap-2">
              {company.values.map((value, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  <TagIcon className="w-3 h-3 mr-1" />
                  {value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Culture Description */}
        {company.cultureDescription && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Company Culture</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {company.cultureDescription}
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{company.followerCount}</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{company.jobCount}</div>
              <div className="text-sm text-gray-600">Open Jobs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{company.locations.length}</div>
              <div className="text-sm text-gray-600">Locations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}