
export interface AcademicData {
  cgpa: string;
  major: string;
  academicStrengths: string;
  academicWeaknesses: string;
}

export interface CodingData {
  githubUsername?: string; // Made optional to align with form
  codingPlatformUsername?: string; // Made optional to align with form
  programmingLanguages: string; // Comma-separated
  keyProjects: string; // Textarea for project descriptions
  codingPlatformStats?: string; // e.g., "LeetCode: 200 problems solved (50 Hard)"
}

export interface ExtracurricularData {
  certifications?: string; // Textarea
  eventsParticipated?: string; // Textarea
  hackathonExperience?: string; // Textarea
  leadershipRoles?: string; // Textarea
}

// This is the structure for the form
export interface ProfileFormData {
  academic: AcademicData;
  coding: CodingData;
  extracurricular: ExtracurricularData;
  skills: string; // Comma-separated list of technical and soft skills
  linkedinProfile?: string; // Optional LinkedIn Profile URL
}

// For AI results
export type ResourceType = "course" | "book/pdf" | "youtube_video/channel";

export interface LearningResource {
  type: ResourceType;
  title: string;
  url?: string; // Optional, as not all books/PDFs will have a direct general URL
  description?: string; // e.g., "Search on Project Gutenberg", "Official Documentation"
}

export interface RecommendationItem {
  action: string; // The actual recommendation
  suggestedResources: LearningResource[]; // Updated from string[]
}

export interface CareerRecommendation {
  recommendations: RecommendationItem[];
  suggestedRoles: string[];
}

export interface CareerPathway {
  suggestedRoles: string[];
  suggestedPathways: string[];
}

export interface EmployabilityScore {
  score: number; // Score out of 100
  feedback?: string; // Optional brief feedback on the score
}

// For Analytics Graphs
export interface CommitHistoryData {
  month: string;
  commits: number;
}

export interface GitHubAnalyticsData {
  commitHistory: CommitHistoryData[];
  repoCount: number;
  // Could add more fields like languages, stars, etc. in a real implementation
}

export interface LeetCodeDifficultyData {
  level: 'Easy' | 'Medium' | 'Hard';
  solved: number;
}

export interface LeetCodeDailyActivityData {
  date: string; // e.g., 'YYYY-MM-DD'
  solved: number;
}

export interface LeetCodeAnalyticsData {
  totalSolved: number;
  solvedByDifficulty: LeetCodeDifficultyData[];
  dailyActivity: LeetCodeDailyActivityData[];
}
