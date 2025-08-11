'use server';

import { getResourceOptimizationSuggestions } from '@/ai/flows/resource-optimization-suggestions';
import type { ResourceOptimizationInput, ResourceOptimizationOutput } from '@/ai/flows/resource-optimization-suggestions';
import { z } from 'zod';

const ResourceOptimizationInputSchema = z.object({
  currentEnrollment: z.coerce.number().min(1, "Current enrollment must be at least 1."),
  availableBudget: z.coerce.number().min(0, "Available budget cannot be negative."),
  existingResources: z.string().min(10, "Existing resources description is too short."),
  historicalData: z.string().min(10, "Historical data description is too short."),
});

export interface ActionState {
  suggestions?: string;
  justification?: string;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export async function fetchResourceOptimizationSuggestionsAction(
  prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const rawFormData = {
    currentEnrollment: formData.get('currentEnrollment'),
    availableBudget: formData.get('availableBudget'),
    existingResources: formData.get('existingResources'),
    historicalData: formData.get('historicalData'),
  };

  const validatedFields = ResourceOptimizationInputSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: "Invalid input. Please check the fields.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const inputData: ResourceOptimizationInput = validatedFields.data;

  try {
    const result: ResourceOptimizationOutput = await getResourceOptimizationSuggestions(inputData);
    return {
      suggestions: result.suggestions,
      justification: result.justification,
    };
  } catch (error) {
    console.error("Error fetching resource optimization suggestions:", error);
    return { error: "Failed to get suggestions from AI. Please try again later." };
  }
}
