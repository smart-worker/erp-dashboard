// Resource optimization flow to provide suggestions for resource allocation.

'use server';

/**
 * @fileOverview AI-powered resource optimization suggestions for college administrators.
 *
 * - getResourceOptimizationSuggestions - A function that retrieves suggestions for optimizing resource allocation.
 * - ResourceOptimizationInput - The input type for the getResourceOptimizationSuggestions function.
 * - ResourceOptimizationOutput - The return type for the getResourceOptimizationSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResourceOptimizationInputSchema = z.object({
  currentEnrollment: z
    .number()
    .describe('The current number of enrolled students.'),
  availableBudget: z.number().describe('The total available budget for the college.'),
  existingResources: z
    .string()
    .describe(
      'A description of the existing resources, including faculty, classrooms, and equipment.'
    ),
  historicalData: z
    .string()
    .describe(
      'Historical data on resource utilization and student outcomes over the past few years.'
    ),
});
export type ResourceOptimizationInput = z.infer<typeof ResourceOptimizationInputSchema>;

const ResourceOptimizationOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'A list of specific, actionable suggestions for optimizing resource allocation, including potential cost savings and efficiency improvements.'
    ),
  justification: z
    .string()
    .describe(
      'A detailed explanation of the rationale behind each suggestion, based on the provided data and analysis.'
    ),
});
export type ResourceOptimizationOutput = z.infer<typeof ResourceOptimizationOutputSchema>;

export async function getResourceOptimizationSuggestions(
  input: ResourceOptimizationInput
): Promise<ResourceOptimizationOutput> {
  return resourceOptimizationFlow(input);
}

const resourceOptimizationPrompt = ai.definePrompt({
  name: 'resourceOptimizationPrompt',
  input: {schema: ResourceOptimizationInputSchema},
  output: {schema: ResourceOptimizationOutputSchema},
  prompt: `You are an expert in resource optimization for higher education institutions.

  Based on the information provided, generate a list of suggestions for optimizing resource allocation within the college. Provide a justification for each suggestion, explaining how it will improve efficiency and reduce costs.

  Current Enrollment: {{{currentEnrollment}}}
  Available Budget: {{{availableBudget}}}
  Existing Resources: {{{existingResources}}}
  Historical Data: {{{historicalData}}}

  Suggestions and Justifications:
  `,
});

const resourceOptimizationFlow = ai.defineFlow(
  {
    name: 'resourceOptimizationFlow',
    inputSchema: ResourceOptimizationInputSchema,
    outputSchema: ResourceOptimizationOutputSchema,
  },
  async input => {
    const {output} = await resourceOptimizationPrompt(input);
    return output!;
  }
);
