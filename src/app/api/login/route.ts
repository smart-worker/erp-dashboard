
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserRole } from '@/context/auth-context';
import { db } from '@/lib/database';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    let userRole: UserRole = null;
    let userEmail: string | null = null;
    let userId: string | null = null;

    // Check for hardcoded teacher/admin user
    if (email === 'admin@campuspulse.com' && password === 'password') {
      userRole = 'teacher';
      userEmail = email;
      // In a real app, admin would also have a proper user record
      // For this app, we'll assign a mock ID for context consistency
      userId = 'admin001'; 
      return NextResponse.json({ role: userRole, email: userEmail, id: userId }, { status: 200 });
    }

    // If not admin, check if the user is a student in the database
    const student = await db.students.getByEmail(email);
    
    if (student) {
      let isPasswordCorrect = false;
      if (student.password) {
        // User has a hashed password, compare it
        isPasswordCorrect = await bcrypt.compare(password, student.password);
      } else if (password === 'password') {
        // Legacy support for students created before password hashing was added
        isPasswordCorrect = true;
      }

      if (isPasswordCorrect) {
        userRole = 'student';
        userEmail = student.email;
        userId = student.id;
        return NextResponse.json({ role: userRole, email: userEmail, id: userId }, { status: 200 });
      }
    }


    // If no match is found
    return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred. Please try again.' }, { status: 500 });
  }
}
