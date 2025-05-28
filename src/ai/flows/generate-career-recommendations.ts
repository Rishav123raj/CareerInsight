// src/ai/flows/generate-career-recommendations.ts
'use server';

/**
 * @fileOverview Provides AI-powered career recommendations based on a student's profile.
 *
 * - generateCareerRecommendations - A function that generates personalized career suggestions.
 * - CareerRecommendationsInput - The input type for the generateCareerRecommendations function.
 * - CareerRecommendationsOutput - The return type for the generateCareerRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CareerRecommendationsInputSchema = z.object({
  academicPerformance: z
    .string()
    .describe('Summary of academic performance, including CGPA and subject strengths.'),
  codingSkills: z
    .string()
    .describe('Summary of coding skills, including languages, frameworks, and projects.'),
  extracurricularActivities: z
    .string()
    .describe('Summary of extracurricular activities, including certifications, events, and roles.'),
});
export type CareerRecommendationsInput = z.infer<typeof CareerRecommendationsInputSchema>;

const CareerRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('A list of personalized recommendations to enhance employability.'),
  suggestedRoles: z
    .array(z.string())
    .describe('A list of potential job roles based on the user profile.'),
});
export type CareerRecommendationsOutput = z.infer<typeof CareerRecommendationsOutputSchema>;

export async function generateCareerRecommendations(
  input: CareerRecommendationsInput
): Promise<CareerRecommendationsOutput> {
  return generateCareerRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'careerRecommendationsPrompt',
  input: {schema: CareerRecommendationsInputSchema},
  output: {schema: CareerRecommendationsOutputSchema},
  prompt: `You are a career advisor specializing in helping students improve their employability.

  Based on the following information about the student, provide personalized recommendations and suggest potential job roles.

  Academic Performance: {{{academicPerformance}}}
  Coding Skills: {{{codingSkills}}}
  Extracurricular Activities: {{{extracurricularActivities}}}

  Recommendations should be specific and actionable.
  Suggested job roles should align with the student's profile.
  `,
});

const generateCareerRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateCareerRecommendationsFlow',
    inputSchema: CareerRecommendationsInputSchema,
    outputSchema: CareerRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
