
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

const LearningResourceSchema = z.object({
  type: z.enum(["course", "book/pdf", "youtube_video/channel"]).describe("The type of resource."),
  title: z.string().describe("The title or name of the resource (e.g., course name, book title, video/channel name)."),
  url: z.string().optional().describe("A URL to the resource. Ensure URLs are functional and directly relevant. For books/PDFs, this may not always be a direct link but a source. For YouTube, link to the video or channel."),
  description: z.string().optional().describe("A brief description, or a hint on where to find it (e.g., 'Official documentation', 'Search on Project Gutenberg', 'Available on university open courseware'). This is especially useful if a direct URL is not specific or for broader book suggestions.")
});

const RecommendationItemSchema = z.object({
    action: z.string().describe("A specific, actionable recommendation for the student."),
    suggestedResources: z.array(LearningResourceSchema).min(1).max(3).describe("A list of 1-3 suggested learning resources (courses, books/PDFs, YouTube videos/channels) that directly help implement the 'action'. Provide valid URLs where possible. For books/PDFs, prioritize open-access materials or well-known titles and indicate where to find them if a direct URL isn't available.")
});

const CareerRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(RecommendationItemSchema)
    .describe('A list of personalized recommendations, each with an action and a list of structured suggested learning resources.'),
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
  prompt: `You are an expert career advisor specializing in helping students improve their employability by providing actionable advice and resource suggestions.

  Based on the following information about the student:
  Academic Performance: {{{academicPerformance}}}
  Coding Skills: {{{codingSkills}}}
  Extracurricular Activities: {{{extracurricularActivities}}}

  You need to provide:
  1. A list of personalized recommendations (actions). Each recommendation should be specific and actionable.
  2. For EACH recommendation (action), suggest 1-3 diverse learning resources to help the student act on that recommendation. These resources should be structured as follows:
     - 'type': Must be one of "course", "book/pdf", or "youtube_video/channel".
     - 'title': The specific name of the course, book, PDF, YouTube video, or YouTube channel.
     - 'url': (Optional but highly encouraged) A *valid and direct URL* to the resource.
        - For courses: Link to the main page of the course on platforms like Coursera, Udemy, edX, freeCodeCamp, official documentation, university pages, etc.
        - For books/PDFs: If it's an open-access PDF or a public domain book (e.g., from Project Gutenberg, an academic archive), provide the direct URL. If it's a commercially available book, you might omit the URL or link to a general information page (not a direct purchase link from a specific retailer).
        - For YouTube: Link directly to the specific video or the main page of the channel.
        - Strive to find URLs that are likely to be stable and directly useful.
     - 'description': (Optional) A brief note. For example, "Official [Technology] Documentation", "Classic text on algorithms, available on Project Gutenberg", "This YouTube channel offers excellent tutorials on..." or "Search [Book Title] on your preferred bookstore or library."

  Examples of good resource suggestions:
  - For a recommendation "Improve Python skills for data analysis":
    - type: "course", title: "Python for Everybody Specialization", url: "https://www.coursera.org/specializations/python", description: "Comprehensive Python course on Coursera."
    - type: "book/pdf", title: "Python for Data Analysis by Wes McKinney", description: "Industry-standard book, search on O'Reilly or Amazon."
    - type: "youtube_video/channel", title: "freeCodeCamp.org channel - Data Analysis with Python playlist", url: "https://www.youtube.com/playlist?list=PLWKjhJtqVAbnqBxcdjVGgT3uVR10bzTEB"
  - For a recommendation "Build more complex projects using React":
    - type: "course", title: "Full-Stack Open - Part 2: Communicating with server", url: "https://fullstackopen.com/en/part2/communicating_with_server", description: "Covers React interactions with backends."
    - type: "book/pdf", title: "React Official Documentation - Thinking in React", url: "https://react.dev/learn/thinking-in-react", description: "Essential reading from the official React docs."

  3. A list of suggested job roles that align with the student's profile.

  Return the output strictly in the specified JSON format matching the output schema. Ensure all provided URLs are as valid and direct as possible. Prioritize quality and relevance of resources.
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
        console.error("🔴 generateCareerRecommendationsFlow: AI did not return an output.");
        console.error("Input that caused no output:", JSON.stringify(input, null, 2));
        throw new Error("AI failed to generate career recommendations. No output received from model. Check server logs.");
    }
    // Zod schema validation will still parse the 'url' as a string.
    // If strict URL format validation is needed *after* AI response, it could be done here manually.
    return output;
  }
);

