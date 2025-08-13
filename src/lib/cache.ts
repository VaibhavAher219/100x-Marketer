// Simple in-memory cache for client-side data caching
class DataCache {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

  set(key: string, data: unknown, ttlMinutes = 5) {
    const ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Invalidate cache entries that match a pattern
  invalidatePattern(pattern: string) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

export const dataCache = new DataCache();

// Cache key generators
export const cacheKeys = {
  profile: (userId: string) => `profile:${userId}`,
  employer: (profileId: string) => `employer:${profileId}`,
  candidate: (profileId: string) => `candidate:${profileId}`,
  employerStats: (employerId: string) => `employer-stats:${employerId}`,
  candidateStats: (candidateId: string) => `candidate-stats:${candidateId}`,
  employerJobs: (employerId: string) => `employer-jobs:${employerId}`,
  publishedJobs: (limit?: number) => `published-jobs:${limit || 'all'}`,
  jobRecommendations: (candidateId: string) => `job-recommendations:${candidateId}`
};

// Cached data fetching functions
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMinutes = 5
): Promise<T> {
  // Try to get from cache first
  const cached = dataCache.get(key);
  if (cached) {
    return cached as T; // Cast to T as it's already known to be T
  }

  // Fetch fresh data
  const data = await fetcher();
  
  // Cache the result
  dataCache.set(key, data, ttlMinutes);
  
  return data;
}

// Optimistic updates
export function updateCachedData<T>(key: string, updater: (current: T | null) => T) {
  const current = dataCache.get(key);
  const updated = updater(current as T); // Cast to T as it's already known to be T
  dataCache.set(key, updated);
  return updated;
}

// Cache invalidation helpers
export function invalidateUserCache(userId: string) {
  dataCache.invalidatePattern(`^(profile|employer|candidate):${userId}`);
}

export function invalidateJobsCache() {
  dataCache.invalidatePattern('^(published-jobs|employer-jobs|job-recommendations)');
}

export function invalidateStatsCache(userId: string) {
  dataCache.invalidatePattern(`^(employer-stats|candidate-stats):.*${userId}`);
}