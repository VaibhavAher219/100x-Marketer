'use client';

import { useState } from 'react';
import { CompanyProfileWithDetails } from '@/types/company';
import { CompanyHeader } from './CompanyHeader';
import { CompanyInfo } from './CompanyInfo';
import { CompanyCulture } from './CompanyCulture';
import { CompanyJobs } from './CompanyJobs';
import { CompanyLocations } from './CompanyLocations';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import LoadingScreen from '@/components/shared/LoadingScreen';

interface CompanyProfilePageProps {
  company: CompanyProfileWithDetails;
  currentUserId?: string;
}

export function CompanyProfilePage({ company, currentUserId }: CompanyProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'culture' | 'locations'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'jobs', label: 'Jobs', count: company.jobCount },
    { id: 'culture', label: 'Culture', count: company.testimonials.length },
    { id: 'locations', label: 'Locations', count: company.locations.length },
  ] as const;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Company Header */}
        <CompanyHeader 
          company={company} 
          currentUserId={currentUserId}
          onFollowChange={() => setIsLoading(true)}
        />

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8" aria-label="Company sections">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  {tab.label}
                  {tab.count !== null && tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <CompanyInfo company={company} />
              {company.testimonials.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    What Our Team Says
                  </h2>
                  <CompanyCulture 
                    company={company} 
                    showTestimonials={true}
                    showCulture={false}
                  />
                </div>
              )}
              {company.jobCount > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Open Positions ({company.jobCount})
                  </h2>
                  <CompanyJobs 
                    companyId={company.id} 
                    companySlug={company.slug}
                    limit={3}
                    showViewAll={true}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Open Positions at {company.companyName}
                </h1>
                <p className="mt-2 text-gray-600">
                  {company.jobCount} open position{company.jobCount !== 1 ? 's' : ''} available
                </p>
              </div>
              <CompanyJobs 
                companyId={company.id} 
                companySlug={company.slug}
                showFilters={true}
              />
            </div>
          )}

          {activeTab === 'culture' && (
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Culture & Values
                </h1>
                <p className="mt-2 text-gray-600">
                  Learn about our mission, values, and what makes {company.companyName} special
                </p>
              </div>
              <CompanyCulture 
                company={company} 
                showTestimonials={true}
                showCulture={true}
              />
            </div>
          )}

          {activeTab === 'locations' && (
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Our Locations
                </h1>
                <p className="mt-2 text-gray-600">
                  Find us in {company.locations.length} location{company.locations.length !== 1 ? 's' : ''} worldwide
                </p>
              </div>
              <CompanyLocations locations={company.locations} />
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}