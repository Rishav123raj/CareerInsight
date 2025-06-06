
// src/ai/flows/generate-career-recommendations.ts
'use server';

/**
 * @fileOverview Provides AI-powered career recommendations based on a student's profile, including learning resource suggestions.
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

const RecommendationItemSchema = z.object({
    action: z.string().describe("A specific, actionable recommendation for the student."),
    suggestedLearningResources: z.array(z.string()).describe("A list of 1-2 suggested online learning resources or course types from well-known platforms (e.g., Coursera, Udemy, edX, freeCodeCamp, official documentation) that directly help implement the 'action'. Be specific about the type of course or resource.")
});

const CareerRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(RecommendationItemSchema)
    .describe('A list of personalized recommendations, each with an action and suggested learning resources.'),
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

  For each personalized recommendation (action), also suggest 1-2 specific types of online learning resources or courses from well-known platforms (e.g., Coursera, Udemy, edX, freeCodeCamp, official documentation, specific technology tutorials) that would directly help the student act on that recommendation.
  For example, if a recommendation is "Improve Python skills for data analysis", suggested resources could be "Python for Everybody on Coursera" or "Data analysis with Python tutorials on Real Python".
  If a recommendation is "Build more complex projects using React", suggested resources could be "Full-Stack Open course (React section)" or "Advanced React patterns on official React documentation".

  Recommendations should be specific and actionable.
  Suggested job roles should align with the student's profile.
  Return the output in the specified JSON format.
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
    if (!output) {
        throw new Error("Failed to get a response from the AI for career recommendations.");
    }
    return output;
  }
);
