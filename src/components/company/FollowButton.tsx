'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface FollowButtonProps {
  companyId: string;
  companySlug: string;
  initialIsFollowing: boolean;
  initialFollowerCount: number;
  onFollowChange?: () => void;
  className?: string;
}

export function FollowButton({
  companyId,
  companySlug,
  initialIsFollowing,
  initialFollowerCount,
  onFollowChange,
  className = '',
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleFollowToggle = async () => {
    if (!user) {
      showToast('Please sign in to follow companies', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/companies/${companySlug}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update follow status');
      }

      const data = await response.json();
      
      if (data.success) {
        // Optimistic update
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
        
        showToast(
          data.isFollowing 
            ? 'You are now following this company!' 
            : 'You have unfollowed this company',
          'success'
        );
        
        onFollowChange?.();
      } else {
        throw new Error(data.error || 'Failed to update follow status');
      }
    } catch (error) {
      console.error('Follow error:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to update follow status',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={`
        ${className}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${isFollowing 
          ? 'bg-red-600 hover:bg-red-700 border-red-600' 
          : 'bg-blue-600 hover:bg-blue-700 border-blue-600'
        }
        transition-all duration-200 flex items-center space-x-2
      `}
      aria-label={isFollowing ? 'Unfollow company' : 'Follow company'}
    >
      {isFollowing ? (
        <HeartSolidIcon className="w-4 h-4" />
      ) : (
        <HeartIcon className="w-4 h-4" />
      )}
      
      <span>
        {isLoading 
          ? 'Loading...' 
          : isFollowing 
            ? 'Following' 
            : 'Follow'
        }
      </span>
      
      {followerCount > 0 && (
        <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
          {followerCount}
        </span>
      )}
    </button>
  );
}