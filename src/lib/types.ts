export interface AcademicData {
  cgpa: string;
  major: string;
  academicStrengths: string;
  academicWeaknesses: string;
}

export interface CodingData {
  githubUsername: string;
  codingPlatformUsername: string; // e.g., LeetCode, Codeforces
  programmingLanguages: string; // Comma-separated
  keyProjects: string; // Textarea for project descriptions
  codingPlatformStats: string; // e.g., "LeetCode: 200 problems solved (50 Hard)"
}

export interface ExtracurricularData {
  certifications: string; // Textarea
  eventsParticipated: string; // Textarea
  hackathonExperience: string; // Textarea
  leadershipRoles: string; // Textarea
}

// This is the structure for the form
export interface ProfileFormData {
  academic: AcademicData;
  coding: CodingData;
  extracurricular: ExtracurricularData;
  skills: string; // Comma-separated list of technical and soft skills
}

// For AI results
export interface CareerRecommendation {
  recommendations: string[];
  suggestedRoles: string[];
}

export interface CareerPathway {
  suggestedRoles: string[];
  suggestedPathways: string[];
}
