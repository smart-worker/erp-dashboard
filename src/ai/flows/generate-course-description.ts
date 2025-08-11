
'use server';
/**
 * @fileOverview AI-powered course description generation.
 *
 * - generateCourseDescription - A function that generates a course description.
 * - GenerateCourseDescriptionInput - The input type for the generateCourseDescription function.
 * - GenerateCourseDescriptionOutput - The return type for the generateCourseDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCourseDescriptionInputSchema = z.object({
  courseTitle: z.string().describe('The title of the course.'),
  courseCode: z.string().describe('The code of the course (e.g., CS101).'),
  keywords: z.string().optional().describe('Optional keywords or themes to focus on for the description.'),
});
export type GenerateCourseDescriptionInput = z.infer<typeof GenerateCourseDescriptionInputSchema>;

const GenerateCourseDescriptionOutputSchema = z.object({
  description: z.string().describe('The AI-generated course description.'),
});
export type GenerateCourseDescriptionOutput = z.infer<typeof GenerateCourseDescriptionOutputSchema>;

export async function generateCourseDescription(
  input: GenerateCourseDescriptionInput
): Promise<GenerateCourseDescriptionOutput> {
  return generateCourseDescriptionFlow(input);
}

const courseDescriptionPrompt = ai.definePrompt({
  name: 'courseDescriptionPrompt',
  input: {schema: GenerateCourseDescriptionInputSchema},
  output: {schema: GenerateCourseDescriptionOutputSchema},
  prompt: `You are an expert curriculum designer assisting a university faculty member.
Your task is to generate a compelling and informative course description for the following college course.

Course Title: "{{{courseTitle}}}"
Course Code: {{{courseCode}}}
{{#if keywords}}
Please incorporate the following keywords or themes into the description: "{{{keywords}}}"
{{/if}}

The description should be approximately 2-4 sentences long, written in an engaging and professional tone suitable for a university course catalog.
It should give prospective students a clear idea of what the course is about and what they will learn.
Avoid overly technical jargon unless essential and explained.
Focus on the key learning outcomes and the value the course offers.

Generate only the course description text.`,
  // Example configuration for safety settings if needed
  // config: {
  //   safetySettings: [
  //     {
  //       category: 'HARM_CATEGORY_HARASSMENT',
  //       threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  //     },
  //   ],
  // },
});

const generateCourseDescriptionFlow = ai.defineFlow(
  {
    name: 'generateCourseDescriptionFlow',
    inputSchema: GenerateCourseDescriptionInputSchema,
    outputSchema: GenerateCourseDescriptionOutputSchema,
  },
  async (input) => {
    const {output} = await courseDescriptionPrompt(input);
    if (!output) {
        throw new Error("The AI failed to generate a description.");
    }
    return output;
  }
);

    