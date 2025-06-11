
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
export type LearningResource = z.infer<typeof LearningResourceSchema>;


const RecommendationItemSchema = z.object({
    action: z.string().describe("A specific, actionable recommendation for the student."),
    suggestedResources: z.array(LearningResourceSchema).min(1).max(3).describe("A list of 1-3 suggested learning resources (courses, books/PDFs, YouTube videos/channels) that directly help implement the 'action'. Provide valid URLs where possible. For books/PDFs, prioritize open-access materials or well-known titles and indicate where to find them if a direct URL isn't available.")
});
export type RecommendationItem = z.infer<typeof RecommendationItemSchema>;

const CareerRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(RecommendationItemSchema)
    .describe('A list of personalized recommendations, each with an action and a list of structured suggested learning resources.'),
  suggestedRoles: z
    .array(z.string())
    .optional() 
    .describe('A list of 2-5 potential job roles based on the user profile. Strive to identify roles even if it requires some extrapolation from the provided data.'),
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
  prompt: `You are an expert career advisor specializing in helping students improve their employability by providing actionable advice, resource suggestions, and potential career directions.

  Based on the following information about the student:
  Academic Performance: {{{academicPerformance}}}
  Coding Skills: {{{codingSkills}}}
  Extracurricular Activities: {{{extracurricularActivities}}}

  You MUST provide output in the specified JSON format adhering to the output schema. This includes two main properties: 'recommendations' and 'suggestedRoles'.

  1. 'recommendations':
     - Provide a list of personalized recommendations (actions). Each recommendation should be specific and actionable.
     - For EACH recommendation (action), suggest 1-3 diverse learning resources to help the student act on that recommendation. These resources should be structured as follows:
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

  2. 'suggestedRoles':
     - Based on the ENTIRETY of the student's profile (Academic Performance, Coding Skills, Extracurricular Activities), generate a list of 2-5 potential job roles that would be a good fit or a developmental step for the student.
     - Consider both direct matches to their current skills and roles they could aspire to with focused effort.
     - Even if the profile is somewhat limited, try to extrapolate and suggest roles they might be interested in or could work towards.
     - If, after careful consideration, absolutely no roles seem appropriate or can be reasonably inferred, you may provide an empty list for 'suggestedRoles'. However, you should always attempt to populate this list if possible.

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
        // It's crucial to return a structure that matches the schema, even if it's "empty" or default.
        // This helps prevent downstream errors if the AI fails to return anything.
        return { recommendations: [], suggestedRoles: [] };
    }
    // Ensure that even if the AI omits suggestedRoles, we provide an empty array to match the optional schema on the client-side.
    if (output.suggestedRoles === undefined) {
        output.suggestedRoles = [];
    }
    return output;
  }
);

