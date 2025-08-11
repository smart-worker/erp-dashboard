
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/database';

const courseSchema = z.object({
  code: z.string().min(3, { message: 'Course code must be at least 3 characters.' }).max(10),
  title: z.string().min(5, { message: 'Course title must be at least 5 characters.' }).max(100),
  description: z.string().min(10, "Description must be at least 10 characters.").max(500, "Description cannot exceed 500 characters.").optional().or(z.literal('')),
  credits: z.coerce.number().min(1, { message: 'Credits must be at least 1.' }).max(10),
});

export async function GET() {
  try {
    const courses = await db.courses.getAll();
    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error('GET /api/courses error:', error);
    return NextResponse.json({ message: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = courseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid course data', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { code, title, description, credits } = validation.data;
    
    const allCourses = await db.courses.getAll();
    if (allCourses.some(c => c.code.toLowerCase() === code.toLowerCase())) {
        return NextResponse.json({ message: `Course code ${code} already exists.` }, { status: 409 });
    }

    const newCourse = await db.courses.create({ code: code.toUpperCase(), title, description: description || undefined, credits });
    
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error('POST /api/courses error:', error);
    return NextResponse.json({ message: 'Failed to add course' }, { status: 500 });
  }
}
