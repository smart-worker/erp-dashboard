// notification-service.ts

// In production, integrate with:
// - Redis Pub/Sub for real-time notifications
// - Email provider via Nodemailer (Mailtrap Sandbox here for dev)
// - A job queue (RabbitMQ, Kafka, SQS/BullMQ) for durability at scale

import 'dotenv/config';
import nodemailer from 'nodemailer';
import type { Student } from './database';
import type { Course } from './database';

// Create a reusable Nodemailer transporter for Mailtrap Sandbox
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  port: Number(process.env.SMTP_PORT || 2525), // try 2525
  secure: false, // for 2525/587
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
  // Optional: shorter connection timeout to fail fast
  connectionTimeout: 10_000, // 10s
  socketTimeout: 20_000,     // 20s
});


// Optional: quick sanity check on startup (can be called from app init)
export async function verifyEmailTransport(): Promise<void> {
  try {
    await transporter.verify();
    console.log('Mailtrap SMTP transport verified and ready.');
  } catch (err) {
    console.error('Mailtrap SMTP verification failed:', err);
  }
}

// Helper function to create a basic email template
const createNewCourseEmailTemplate = (
  studentName: string,
  course: Course & { studentsEnrolled: number }
): { subject: string; text: string; html: string } => {
  const subject = `New Course Available: ${course.title}!`;

  const text = `
Hello ${studentName},

A new course has just been added to the catalog that you might be interested in!

Course Details:
- Title: ${course.title}
- Code: ${course.code}
- Credits: ${course.credits}
- Description: ${course.description || 'No description available.'}

Log in to your CampusPulse account to check it out and enroll today.

Happy learning!

- The CampusPulse Team
`.trim();

  const html = `
  <div style="font-family: Arial, sans-serif; line-height:1.5; color:#111">
    <p>Hello ${studentName},</p>
    <p>A new course has just been added to the catalog that you might be interested in!</p>
    <h3 style="margin-bottom:6px;">Course Details</h3>
    <ul style="margin-top:0;">
      <li><strong>Title:</strong> ${course.title}</li>
      <li><strong>Code:</strong> ${course.code}</li>
      <li><strong>Credits:</strong> ${course.credits}</li>
      <li><strong>Description:</strong> ${course.description || 'No description available.'}</li>
    </ul>
    <p>Log in to your CampusPulse account to check it out and enroll today.</p>
    <p>Happy learning!</p>
    <p>- The CampusPulse Team</p>
  </div>
  `;

  return { subject, text, html };
};

export const notificationService = {
  /**
   * Sends an email to all students about a new course using Mailtrap Sandbox.
   * Minimal implementation for development/testing: sequential sends with basic error handling.
   * @param students A list of all student objects.
   * @param course The new course that was added.
   */
  emailAllStudents: async (
    students: Student[],
    course: Course & { studentsEnrolled: number }
  ): Promise<void> => {
    const from =
      process.env.SMTP_FROM || '"CampusPulse" <no-reply@campuspulse.dev>';

    // Quick validation of required envs
    const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length) {
      console.warn(
        `Warning: Missing SMTP env vars: ${missing.join(
          ', '
        )}. Attempting to send with defaults where applicable.`
      );
    }

    console.log('===================================');
    console.log(' EMAIL NOTIFICATION (Mailtrap Sandbox)');
    console.log('===================================');
    console.log(
      `Preparing to email ${students.length} students about new course: "${course.title}".`
    );

    for (const student of students) {
      if (!student.email) {
        console.warn(`Skipping student with missing email: ${student.name}`);
        continue;
      }

      const { subject, text, html } = createNewCourseEmailTemplate(
        student.name,
        course
      );

      try {
        const info = await transporter.sendMail({
          from,
          to: student.email,
          subject,
          text,
          html,
        });
        // For Mailtrap, this is useful to confirm delivery in the dashboard
        console.log(`✓ Sent to ${student.email} (messageId: ${info.messageId})`);
      } catch (err) {
        console.error(`✗ Failed to send to ${student.email}`, err);
      }
    }

    console.log('=> Dispatched emails via Nodemailer -> Mailtrap Sandbox.');
    console.log('===================================\n');
  },
};
