'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CompanyProfileWithDetails } from '@/types/company';
import { FollowButton } from './FollowButton';
import { ShareButton } from './ShareButton';
import { 
  MapPinIcon, 
  GlobeAltIcon, 
  BuildingOfficeIcon,
  UsersIcon 
} from '@heroicons/react/24/outline';

interface CompanyHeaderProps {
  company: CompanyProfileWithDetails;
  currentUserId?: string;
  onFollowChange?: () => void;
}

export function CompanyHeader({ company, currentUserId, onFollowChange }: CompanyHeaderProps) {
  const [imageError, setImageError] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  const headquarters = company.locations.find(loc => loc.isHeadquarters);
  const primaryLocation = headquarters || company.locations[0];

  return (
    <div className="relative">
      {/* Banner Image */}
      <div className="h-64 sm:h-80 lg:h-96 relative overflow-hidden">
        {company.bannerUrl && !bannerError ? (
          <Image
            src={company.bannerUrl}
            alt={`${company.companyName} banner`}
            fill
            className="object-cover"
            onError={() => setBannerError(true)}
            priority
          />
        ) : (
          <div 
            className="w-full h-full"
            style={{
              background: company.brandColor 
                ? `linear-gradient(135deg, ${company.brandColor}20, ${company.brandColor}40)`
                : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)'
            }}
          />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </div>

      {/* Company Info Overlay */}
      <div className="relative -mt-32 sm:-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 relative rounded-lg overflow-hidden bg-gray-100 border-2 border-white shadow-sm">
                  {company.logoUrl && !imageError ? (
                    <Image
                      src={company.logoUrl}
                      alt={`${company.companyName} logo`}
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Company Details */}
              <div className="flex-grow min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-grow">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                      {company.companyName}
                    </h1>
                    
                    {/* Company Meta Info */}
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      {company.industry && (
                        <span className="flex items-center">
                          <BuildingOfficeIcon className="w-4 h-4 mr-1" />
                          {company.industry}
                        </span>
                      )}
                      
                      {company.companySize && (
                        <span className="flex items-center">
                          <UsersIcon className="w-4 h-4 mr-1" />
                          {company.companySize} employees
                        </span>
                      )}
                      
                      {primaryLocation && (
                        <span className="flex items-center">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          {primaryLocation.city}, {primaryLocation.country}
                        </span>
                      )}
                      
                      {company.websiteUrl && (
                        <Link
                          href={company.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <GlobeAltIcon className="w-4 h-4 mr-1" />
                          Website
                        </Link>
                      )}
                    </div>

                    {/* Company Description */}
                    {company.description && (
                      <p className="mt-3 text-gray-700 line-clamp-2 sm:line-clamp-3">
                        {company.description}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 mt-4 sm:mt-0 sm:ml-6">
                    <ShareButton 
                      company={company}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    />
                    
                    {currentUserId && (
                      <FollowButton
                        companyId={company.id}
                        companySlug={company.slug}
                        initialIsFollowing={company.isFollowing || false}
                        initialFollowerCount={company.followerCount}
                        onFollowChange={onFollowChange}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900">{company.followerCount}</span>
                    <span className="ml-1 text-gray-600">
                      follower{company.followerCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900">{company.jobCount}</span>
                    <span className="ml-1 text-gray-600">
                      open position{company.jobCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {company.locations.length > 0 && (
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-900">{company.locations.length}</span>
                      <span className="ml-1 text-gray-600">
                        location{company.locations.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-4">
                  {company.jobCount > 0 && (
                    <Link
                      href={`/company/${company.slug}#jobs`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      View all jobs →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}