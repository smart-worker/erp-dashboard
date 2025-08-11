
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/database';
import bcrypt from 'bcrypt';

const studentSchema = z.object({
  studentId: z.string().min(5).max(15),
  name: z.string().min(3).max(100),
  email: z.string().email(),
  program: z.string().min(3).max(50),
});

export async function GET() {
  try {
    const students = await db.students.getAll();
    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error('GET /api/students error:', error);
    return NextResponse.json({ message: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = studentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid student data', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { studentId, name, email, program } = validation.data;

    const allStudents = await db.students.getAll();
    if (allStudents.some(s => s.studentId === studentId)) {
        return NextResponse.json({ message: `Student ID ${studentId} already exists.` }, { status: 409 });
    }

    // Hash the default password
    const defaultPassword = 'password';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newStudent = await db.students.create({ 
        studentId, 
        name, 
        email, 
        program, 
        password: hashedPassword 
    });
    
    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error('POST /api/students error:', error);
    return NextResponse.json({ message: 'Failed to add student' }, { status: 500 });
  }
}
