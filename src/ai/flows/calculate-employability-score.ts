
// src/ai/flows/calculate-employability-score.ts
'use server';

/**
 * @fileOverview AI agent that calculates an employability score based on user profile data,
 * provides feedback on the score's color band, and suggests improvements.
 *
 * - calculateEmployabilityScore - A function that calculates the score and generates feedback.
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
  feedback: z.string().optional().describe('Detailed feedback including color band interpretation and improvement suggestions.'),
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
  prompt: `You are an expert employability assessor. Your task is to calculate an employability score out of 100 based on the provided student profile information and provide detailed feedback.

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

  Color Bands & Meaning:
  - Red (Score 0-19): "Critically Low Employability". This indicates significant foundational gaps across multiple areas. Immediate and broad-based efforts are needed.
  - Yellow (Score 20-50): "Developing Employability". This suggests some strengths are present, but there are notable areas requiring focused improvement to become consistently job-ready.
  - Blue (Score 51-80): "Good Employability". This signifies a strong overall profile with good potential, making the student competitive for many relevant roles. Targeted enhancements can further solidify this.
  - Green (Score 81-100): "Excellent Employability". This represents a highly competitive and well-rounded profile, indicating strong readiness for the job market.

  Based on your assessment and the calculated score:
  1. Determine which color band the student's score falls into (Red, Yellow, Blue, or Green).
  2. In your feedback, you MUST:
     a. Clearly state the color band their score falls into (e.g., "Your employability score places you in the Yellow band.").
     b. Explain what this color band signifies for their current employability status, drawing from the meanings provided above.
     c. Provide 2-3 specific, actionable improvement suggestions. These suggestions should be tailored to help the student improve their score enough to potentially reach the *next* color band. For example, if they are in Yellow, suggest improvements to reach Blue. If they are Green, suggest how to maintain or further distinguish their strong position. Ensure these suggestions are directly related to the input profile data.

  Return only the score as a number and the comprehensive feedback as a single string.
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
        console.error("🔴 calculateEmployabilityScoreFlow: AI did not return an output.");
        console.error("Input that caused no output:", JSON.stringify(input, null, 2));
        throw new Error("AI failed to process employability score. No output received from model. Check server logs.");
    }
    // Ensure score is within bounds, LLMs can sometimes deviate slightly.
    // Zod schema validation should ensure output.score is a number.
    output.score = Math.max(0, Math.min(100, Math.round(output.score)));
    return output;
  }
);

