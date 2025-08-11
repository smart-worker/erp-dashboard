
'use server';

import { generateCourseDescription } from '@/ai/flows/generate-course-description';
import type { GenerateCourseDescriptionInput } from '@/ai/flows/generate-course-description';
import { z } from 'zod';

const GenerateDescriptionSchema = z.object({
  courseTitle: z.string().min(1, "Course title is required."),
  courseCode: z.string().min(1, "Course code is required."),
  keywords: z.string().optional(),
});

export interface GenerateDescriptionActionState {
  description?: string;
  error?: string;
  fieldErrors?: Partial<Record<keyof GenerateCourseDescriptionInput, string[]>>;
}

export async function generateDescriptionAction(
  prevState: GenerateDescriptionActionState | undefined, // prevState is not strictly used here but good for useActionState pattern
  formData: FormData
): Promise<GenerateDescriptionActionState> {
  
  const rawFormData = {
    courseTitle: formData.get('courseTitle') as string,
    courseCode: formData.get('courseCode') as string,
    keywords: formData.get('keywords') as string | undefined,
  };

  const validation = GenerateDescriptionSchema.safeParse(rawFormData);

  if (!validation.success) {
    return {
      error: "Invalid input for AI description generation.",
      fieldErrors: validation.error.flatten().fieldErrors as any, // Cast for simplicity
    };
  }
  
  const inputData: GenerateCourseDescriptionInput = {
      courseTitle: validation.data.courseTitle,
      courseCode: validation.data.courseCode,
      keywords: validation.data.keywords || undefined, // Ensure it's undefined if empty
  };

  try {
    const result = await generateCourseDescription(inputData);
    return { description: result.description };
  } catch (error: any) {
    console.error("Error generating course description with AI:", error);
    return { error: error.message || "Failed to generate description from AI. Please try again." };
  }
}

    