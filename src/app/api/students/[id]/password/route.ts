
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/database';
import bcrypt from 'bcrypt';

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await request.json();
    const validation = passwordChangeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { currentPassword, newPassword } = validation.data;
    
    let isPasswordCorrect = false;

    // The logic handles both students and the admin user case.
    if (id === 'admin001') {
        // Handle hardcoded admin user
        if (currentPassword === 'password') {
            return NextResponse.json({ message: "Password for the default admin user cannot be changed." }, { status: 403 });
        } else {
           return NextResponse.json({ message: 'Incorrect current password for admin.' }, { status: 401 });
        }
    } else {
        // Handle student user from DB
        const student = await db.students.getById(id);
        if (!student) {
            return NextResponse.json({ message: 'Student not found.' }, { status: 404 });
        }
        
        if (student.password) {
            isPasswordCorrect = await bcrypt.compare(currentPassword, student.password);
        } else if (currentPassword === 'password') {
            // Legacy support for students without a hashed password
            isPasswordCorrect = true;
        }

        if (!isPasswordCorrect) {
            return NextResponse.json({ message: 'Incorrect current password.' }, { status: 401 });
        }
        
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        
        const success = await db.students.updatePassword(id, hashedNewPassword);

        if (!success) {
            return NextResponse.json({ message: 'Failed to update password.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
    }
  } catch (error) {
    console.error(`PUT /api/students/${id}/password error:`, error);
    return NextResponse.json({ message: 'Failed to update password' }, { status: 500 });
  }
}
