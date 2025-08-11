
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const course = await db.courses.getById(id);
    if (course) {
      return NextResponse.json(course, { status: 200 });
    }
    return NextResponse.json({ message: 'Course not found' }, { status: 404 });
  } catch (error) {
    console.error(`GET /api/courses/${params.id} error:`, error);
    return NextResponse.json({ message: 'Failed to fetch course' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await request.json();
    const validation = courseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid course data', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { code, title, description, credits } = validation.data;
    
    const allCourses = await db.courses.getAll();
    if (allCourses.some(c => c.code.toLowerCase() === code.toLowerCase() && c.id !== id)) {
        return NextResponse.json({ message: `Course code ${code} already exists for another course.` }, { status: 409 });
    }

    const updatedCourse = await db.courses.update(id, { code: code.toUpperCase(), title, description: description || undefined, credits });
    
    if (!updatedCourse) {
      return NextResponse.json({ message: 'Failed to update course in database or course not found.' }, { status: 500 });
    }

    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/courses/${id} error:`, error);
    return NextResponse.json({ message: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const success = await db.courses.delete(id);
    if (!success) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Course deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/courses/${id} error:`, error);
    return NextResponse.json({ message: 'Failed to delete course' }, { status: 500 });
  }
}
