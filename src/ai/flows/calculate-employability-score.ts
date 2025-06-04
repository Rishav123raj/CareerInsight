// src/ai/flows/calculate-employability-score.ts
'use server';

/**
 * @fileOverview AI agent that calculates an employability score based on user profile data.
 *
 * - calculateEmployabilityScore - A function that calculates the score.
 * - CalculateEmployabilityScoreInput - The input type for the function.
 * - CalculateEmployabilityScoreOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateEmployabilityScoreInputSchema = z.object({
  academicPerformance: z
    .string()
    .describe('Summary of academic performance, including CGPA, major, strengths, and weaknesses.'),
  technicalAndProgrammingSkills: z
    .string()
    .describe('Summary of technical skills, including programming languages, frameworks, key projects, and other relevant skills.'),
  professionalNetworking: z
    .string()
    .describe('Information about professional networking, such as a LinkedIn profile URL or description of networking activities. If a URL is provided, its presence can be considered a positive factor.'),
  problemSolvingSkills: z
    .string()
    .describe('Summary of problem-solving skills demonstrated through platforms like GitHub (activity, repositories) and LeetCode/other coding platforms (number of problems solved, contest performance).'),
  extracurricularActivities: z
    .string()
    .describe('Summary of extracurricular activities, with an emphasis on hackathons, certifications, events participated in, and leadership roles.'),
});
export type CalculateEmployabilityScoreInput = z.infer<typeof CalculateEmployabilityScoreInputSchema>;

const CalculateEmployabilityScoreOutputSchema = z.object({
  score: z.number().min(0).max(100).describe('The calculated employability score, out of 100.'),
  feedback: z.string().optional().describe('Brief feedback or rationale for the score.'),
});
export type CalculateEmployabilityScoreOutput = z.infer<typeof CalculateEmployabilityScoreOutputSchema>;

export async function calculateEmployabilityScore(
  input: CalculateEmployabilityScoreInput
): Promise<CalculateEmployabilityScoreOutput> {
  return calculateEmployabilityScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateEmployabilityScorePrompt',
  input: {schema: CalculateEmployabilityScoreInputSchema},
  output: {schema: CalculateEmployabilityScoreOutputSchema},
  prompt: `You are an expert employability assessor. Your task is to calculate an employability score out of 100 based on the provided student profile information.

  Evaluate the following aspects of the student's profile and assign a weighted score. The final score should be a single number between 0 and 100.

  Profile Information:
  1.  Academic Performance: {{{academicPerformance}}}
  2.  Technical and Programming Skills: {{{technicalAndProgrammingSkills}}}
  3.  Professional Networking (e.g., LinkedIn presence): {{{professionalNetworking}}}
  4.  Problem Solving Skills (e.g., GitHub, LeetCode contributions): {{{problemSolvingSkills}}}
  5.  Extracurricular Activities (e.g., Hackathons, Certifications): {{{extracurricularActivities}}}

  Scoring Weights:
  - Academic Performance: 25%
  - Technical and Programming Skills: 30%
  - Professional Networking: 15% (Consider the presence of a LinkedIn profile or description of activities. A good LinkedIn profile with connections and activity is better than just a URL.)
  - Problem Solving Skills (GitHub & LeetCode combined): 20% (Evaluate based on described activity, number of projects/problems, etc.)
  - Extracurricular Activities (Hackathons & Certifications): 10%

  Based on your assessment of these categories and their respective weights, calculate a final employability score.
  Provide a brief, one-sentence feedback explaining the score if possible.
  Return only the score as a number and the optional feedback.
  `,
});

const calculateEmployabilityScoreFlow = ai.defineFlow(
  {
    name: 'calculateEmployabilityScoreFlow',
    inputSchema: CalculateEmployabilityScoreInputSchema,
    outputSchema: CalculateEmployabilityScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("Failed to get a response from the AI for employability score calculation.");
    }
    // Ensure score is within bounds, LLMs can sometimes deviate slightly.
    output.score = Math.max(0, Math.min(100, Math.round(output.score)));
    return output;
  }
);
