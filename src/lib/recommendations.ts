import { Job, Candidate } from '@/types/database';
import { getPublishedJobs } from './database';
import { getCachedData, cacheKeys } from './cache';

// Simple job recommendation algorithm
export async function getJobRecommendations(candidate: Candidate, limit = 5): Promise<Job[]> {
  return getCachedData(
    cacheKeys.jobRecommendations(candidate.id),
    async () => {
      // Get all published jobs
      const allJobs = await getPublishedJobs(50); // Get more jobs for better matching
      
      // Score jobs based on candidate profile
      const scoredJobs = allJobs.map(job => ({
        job,
        score: calculateJobScore(job, candidate)
      }));

      // Sort by score and return top matches
      return scoredJobs
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.job);
    },
    10 // Cache for 10 minutes
  );
}

function calculateJobScore(job: Job, candidate: Candidate): number {
  let score = 0;

  // Experience level matching
  if (job.experience_level && candidate.experience_years !== null) {
    const experienceMatch = getExperienceMatch(job.experience_level, candidate.experience_years);
    score += experienceMatch * 30; // 30 points for experience match
  }

  // Location matching
  if (job.location && candidate.current_location) {
    const locationMatch = getLocationMatch(job.location, candidate.current_location);
    score += locationMatch * 20; // 20 points for location match
  }

  // Remote work preference
  if (job.remote_allowed) {
    score += 15; // 15 points for remote jobs (generally preferred)
  }

  // Salary matching (if candidate has salary expectations)
  if (job.salary_min && job.salary_max && candidate.expected_salary) {
    const salaryMatch = getSalaryMatch(job.salary_min, job.salary_max, candidate.expected_salary);
    score += salaryMatch * 25; // 25 points for salary match
  }

  // Skills matching (basic keyword matching)
  if (job.skills_required.length > 0 && candidate.summary) {
    const skillsMatch = getSkillsMatch(job.skills_required, candidate.summary);
    score += skillsMatch * 20; // 20 points for skills match
  }

  // Job category relevance (basic AI/marketing keyword matching)
  if (job.category && candidate.headline) {
    const categoryMatch = getCategoryMatch(job.category, candidate.headline);
    score += categoryMatch * 15; // 15 points for category match
  }

  // Recency bonus (newer jobs get slight preference)
  const daysSincePosted = Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const recencyBonus = Math.max(0, 10 - daysSincePosted); // Up to 10 points for recent jobs
  score += recencyBonus;

  return score;
}

function getExperienceMatch(jobLevel: string, candidateYears: number): number {
  const experienceRanges = {
    'Entry': [0, 2],
    'Mid': [2, 5],
    'Senior': [5, 10],
    'Executive': [10, 100]
  };

  const range = experienceRanges[jobLevel as keyof typeof experienceRanges];
  if (!range) return 0;

  const [min, max] = range;
  if (candidateYears >= min && candidateYears <= max) {
    return 1; // Perfect match
  } else if (candidateYears >= min - 1 && candidateYears <= max + 2) {
    return 0.7; // Close match
  } else {
    return 0.3; // Distant match
  }
}

function getLocationMatch(jobLocation: string, candidateLocation: string): number {
  const jobLoc = jobLocation.toLowerCase();
  const candLoc = candidateLocation.toLowerCase();

  if (jobLoc === candLoc) return 1; // Exact match
  
  // Check if they share the same city or state
  const jobParts = jobLoc.split(',').map(part => part.trim());
  const candParts = candLoc.split(',').map(part => part.trim());
  
  for (const jobPart of jobParts) {
    for (const candPart of candParts) {
      if (jobPart === candPart) return 0.8; // Partial match
    }
  }

  return 0.2; // No match
}

function getSalaryMatch(jobMin: number, jobMax: number, expectedSalary: number): number {
  if (expectedSalary >= jobMin && expectedSalary <= jobMax) {
    return 1; // Perfect match
  } else if (expectedSalary >= jobMin * 0.8 && expectedSalary <= jobMax * 1.2) {
    return 0.7; // Close match
  } else {
    return 0.3; // Distant match
  }
}

function getSkillsMatch(jobSkills: string[], candidateSummary: string): number {
  const summary = candidateSummary.toLowerCase();
  let matchCount = 0;

  for (const skill of jobSkills) {
    if (summary.includes(skill.toLowerCase())) {
      matchCount++;
    }
  }

  return jobSkills.length > 0 ? matchCount / jobSkills.length : 0;
}

function getCategoryMatch(jobCategory: string, candidateHeadline: string): number {
  const category = jobCategory.toLowerCase();
  const headline = candidateHeadline.toLowerCase();

  // Extract key terms from category
  const categoryTerms = category.split(' ').filter(term => term.length > 2);
  let matchCount = 0;

  for (const term of categoryTerms) {
    if (headline.includes(term)) {
      matchCount++;
    }
  }

  return categoryTerms.length > 0 ? matchCount / categoryTerms.length : 0;
}

// Get trending job categories
export async function getTrendingCategories(): Promise<{ category: string; count: number }[]> {
  const jobs = await getPublishedJobs(100);
  const categoryCount = new Map<string, number>();

  jobs.forEach(job => {
    if (job.category) {
      categoryCount.set(job.category, (categoryCount.get(job.category) || 0) + 1);
    }
  });

  return Array.from(categoryCount.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// Get salary insights
export async function getSalaryInsights(category?: string): Promise<{
  min: number;
  max: number;
  average: number;
  median: number;
}> {
  const jobs = await getPublishedJobs(100);
  const filteredJobs = category 
    ? jobs.filter(job => job.category === category)
    : jobs;

  const salaries = filteredJobs
    .filter(job => job.salary_min && job.salary_max)
    .map(job => (job.salary_min! + job.salary_max!) / 2);

  if (salaries.length === 0) {
    return { min: 0, max: 0, average: 0, median: 0 };
  }

  salaries.sort((a, b) => a - b);

  return {
    min: Math.min(...salaries),
    max: Math.max(...salaries),
    average: salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length,
    median: salaries[Math.floor(salaries.length / 2)]
  };
}