'use client';

import { useState } from 'react';
import { CompanyProfile } from '@/types/company';
import { useToast } from '@/hooks/useToast';
import { 
  ShareIcon,
  LinkIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ShareButtonProps {
  company: CompanyProfile;
  className?: string;
}

export function ShareButton({ company, className = '' }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/company/${company.slug}`;
  const shareTitle = `${company.companyName} - Company Profile`;
  const shareText = company.description 
    ? `Check out ${company.companyName}: ${company.description.substring(0, 100)}...`
    : `Check out ${company.companyName} on our job portal!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Link copied to clipboard!', 'success');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to copy link:', error);
      showToast('Failed to copy link', 'error');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setIsOpen(false);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
          showToast('Failed to share', 'error');
        }
      }
    }
  };

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: LinkIcon,
      action: handleCopyLink,
      color: 'text-gray-600 hover:text-gray-800',
    },
    {
      name: 'Twitter',
      icon: () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      action: () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank', 'noopener,noreferrer');
        setIsOpen(false);
      },
      color: 'text-blue-400 hover:text-blue-600',
    },
    {
      name: 'LinkedIn',
      icon: () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      action: () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
        setIsOpen(false);
      },
      color: 'text-blue-600 hover:text-blue-800',
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
            handleNativeShare();
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className={`${className} transition-colors`}
        aria-label="Share company profile"
      >
        <ShareIcon className="w-4 h-4 mr-2" />
        Share
      </button>

      {/* Share Menu */}
      {isOpen && !navigator.share && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                <div className="font-medium">Share this company</div>
                <div className="text-xs text-gray-500 truncate">{company.companyName}</div>
              </div>
              
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.action}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <option.icon className={`w-5 h-5 mr-3 ${option.color}`} />
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}