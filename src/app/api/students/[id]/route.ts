
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/database';

const studentSchema = z.object({
  studentId: z.string().min(5).max(15),
  name: z.string().min(3).max(100),
  email: z.string().email(),
  program: z.string().min(3).max(50),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const student = await db.students.getById(id);
    if (student) {
      return NextResponse.json(student, { status: 200 });
    }
    return NextResponse.json({ message: 'Student not found' }, { status: 404 });
  } catch (error) {
    console.error(`GET /api/students/${params.id} error:`, error);
    return NextResponse.json({ message: 'Failed to fetch student' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await request.json();
    const validation = studentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid student data', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const existingStudent = await db.students.getById(id);
    if (!existingStudent) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    const { studentId, name, email, program } = validation.data;
    
    const allStudents = await db.students.getAll();
    if (allStudents.some(s => s.studentId === studentId && s.id !== id)) {
        return NextResponse.json({ message: `Student ID ${studentId} already exists for another student.` }, { status: 409 });
    }

    const updatedStudent = await db.students.update(id, { studentId, name, email, program });

    return NextResponse.json(updatedStudent, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/students/${id} error:`, error);
    return NextResponse.json({ message: 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const success = await db.students.delete(id);
    if (!success) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Student deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/students/${id} error:`, error);
    return NextResponse.json({ message: 'Failed to delete student' }, { status: 500 });
  }
}
