
// src/ai/flows/suggest-career-pathways.ts
'use server';

/**
 * @fileOverview AI agent that suggests career pathways based on user profile data and performance.
 *
 * - suggestCareerPathways - A function that suggests career pathways.
 * - SuggestCareerPathwaysInput - The input type for the suggestCareerPathways function.
 * - SuggestCareerPathwaysOutput - The return type for the suggestCareerPathways function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCareerPathwaysInputSchema = z.object({
  academicPerformance: z
    .string()
    .describe('Summary of the student\'s academic performance, including CGPA and subject-wise strengths and weaknesses.'),
  codingStats: z
    .string()
    .describe('Summary of the student\'s coding statistics from platforms like LeetCode and GitHub, including languages used and contributions.'),
  extracurricularActivities: z
    .string()
    .describe('Summary of the student\'s extracurricular activities, including certifications, events, hackathons, and leadership roles.'),
  skills: z
    .string()
    .describe('List of skills.'),
});
export type SuggestCareerPathwaysInput = z.infer<typeof SuggestCareerPathwaysInputSchema>;

const SuggestCareerPathwaysOutputSchema = z.object({
  suggestedRoles: z
    .array(z.string())
    .describe('List of suggested job roles based on the user\'s profile data and performance.'),
  suggestedPathways: z
    .array(z.string())
    .describe('List of suggested career pathways, including resources and roadmaps.'),
});
export type SuggestCareerPathwaysOutput = z.infer<typeof SuggestCareerPathwaysOutputSchema>;

export async function suggestCareerPathways(input: SuggestCareerPathwaysInput): Promise<SuggestCareerPathwaysOutput> {
  return suggestCareerPathwaysFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCareerPathwaysPrompt',
  input: {schema: SuggestCareerPathwaysInputSchema},
  output: {schema: SuggestCareerPathwaysOutputSchema},
  prompt: `You are a career counselor specializing in helping students identify potential career paths.

Based on the student's academic performance, coding stats, extracurricular activities and skills, suggest potential job roles and career pathways.

Academic Performance: {{{academicPerformance}}}
Coding Stats: {{{codingStats}}}
Extracurricular Activities: {{{extracurricularActivities}}}
Skills: {{{skills}}}

Consider the following:
- The student's strengths and weaknesses.
- The student's interests.
- The current job market.

Respond with a list of suggested job roles and career pathways in JSON format.
`,
});

const suggestCareerPathwaysFlow = ai.defineFlow(
  {
    name: 'suggestCareerPathwaysFlow',
    inputSchema: SuggestCareerPathwaysInputSchema,
    outputSchema: SuggestCareerPathwaysOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      console.error("suggestCareerPathwaysFlow: AI did not return an output for the given input:", input);
      throw new Error("AI failed to suggest career pathways. No output received from model.");
    }
    return output;
  }
);
