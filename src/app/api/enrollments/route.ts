
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/database';

const enrollmentSchema = z.object({
  studentId: z.string().email("Invalid student identifier."),
  courseId: z.string().min(1, "Course ID is required."),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');

  if (!studentId) {
    return NextResponse.json({ message: 'Student ID is required' }, { status: 400 });
  }

  try {
    const enrollments = await db.enrollments.getByStudentId(studentId);
    const courses = await db.courses.getAll();
    
    const populatedEnrollments = enrollments.map(enrollment => {
      const course = courses.find(c => c.id === enrollment.courseId);
      return {
        ...enrollment,
        course: course ? { code: course.code, title: course.title, credits: course.credits, description: course.description } : null
      }
    }).filter(e => e.course !== null); // Filter out any enrollments where the course was not found

    return NextResponse.json(populatedEnrollments, { status: 200 });
  } catch (error) {
    console.error('GET /api/enrollments error:', error);
    return NextResponse.json({ message: 'Failed to fetch enrollments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = enrollmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid enrollment data', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { studentId, courseId } = validation.data;
    
    const student = await db.students.getByEmail(studentId);
    if (!student) {
        return NextResponse.json({ message: `Student not found.` }, { status: 404 });
    }
    
    const course = await db.courses.getById(courseId);
    if (!course) {
        return NextResponse.json({ message: `Course not found.` }, { status: 404 });
    }

    const newEnrollment = await db.enrollments.create({ studentId, courseId });
    
    return NextResponse.json(newEnrollment, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/enrollments error:', error);
    // Handle specific error for already enrolled
    if (error.message.includes("already enrolled")) {
        return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to create enrollment' }, { status: 500 });
  }
}
