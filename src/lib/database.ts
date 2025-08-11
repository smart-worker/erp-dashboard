
// src/lib/database.ts
import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

// Define the structure of our database entities
interface Course {
  id: string; // This will be the string representation of MongoDB's _id
  code: string;
  title: string;
  description?: string;
  credits: number;
}

interface Student {
  id: string; // String representation of _id
  studentId: string;
  name: string;
  email: string;
  program: string;
  password?: string; // Storing the hashed password
}

interface Enrollment {
  id: string; // String representation of _id
  studentId: string; // Using email as the student identifier
  courseId: string;
  enrollmentDate: string;
}

// Helper to get the database instance
async function getDb(dbName: string | undefined) {
  if (!dbName) {
    throw new Error(`Database name is not defined. Check your .env file.`);
  }
  console.log(`[DB] Attempting to connect to database: ${dbName}`);
  const client = await clientPromise;
  return client.db(dbName);
}

// Helper to convert MongoDB document to our application's object format
const fromMongo = (doc: any) => {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toHexString(), ...rest };
};


export const db = {
  // Course methods
  courses: {
    getAll: async (): Promise<(Course & { studentsEnrolled: number })[]> => {
      try {
        const db = await getDb(process.env.MONGODB_DB_NAME_COURSES);
        const coursesCollection = db.collection('courses');
        
        const aggregationPipeline = [
          {
            $lookup: {
              from: 'enrollments',
              let: { courseId: "$_id" },
              pipeline: [
                { $match: { $expr: { $eq: ["$courseId", "$$courseId"] } } }
              ],
              as: 'enrollmentData'
            }
          },
          {
            $addFields: {
              studentsEnrolled: { $size: '$enrollmentData' },
              id: { $toString: '$_id' }
            }
          },
          {
            $project: {
              _id: 0,
              enrollmentData: 0,
            }
          }
        ];

        console.log("[DB] Fetching all courses with enrollment count...");
        const courses = await coursesCollection.aggregate(aggregationPipeline).toArray();
        console.log(`[DB] Found ${courses.length} courses.`);
        return courses as (Course & { studentsEnrolled: number })[];
      } catch (error) {
        console.error("[DB-ERROR] Failed to get all courses:", error);
        throw error;
      }
    },
    getById: async (id: string): Promise<(Course & { studentsEnrolled: number }) | undefined> => {
        try {
            if (!ObjectId.isValid(id)) return undefined;
            const db = await getDb(process.env.MONGODB_DB_NAME_COURSES);
            const coursesCollection = db.collection('courses');

            const aggregationPipeline = [
              { $match: { _id: new ObjectId(id) } },
              {
                $lookup: {
                  from: 'enrollments',
                   let: { courseId: "$_id" },
                   pipeline: [
                     { $match: { $expr: { $eq: ["$courseId", "$$courseId"] } } }
                   ],
                  as: 'enrollmentData'
                }
              },
              {
                $addFields: {
                  studentsEnrolled: { $size: '$enrollmentData' },
                  id: { $toString: '$_id' }
                }
              },
              {
                $project: {
                  _id: 0,
                  enrollmentData: 0
                }
              }
            ];
            
            console.log(`[DB] Fetching course by ID: ${id}`);
            const results = await coursesCollection.aggregate(aggregationPipeline).toArray();
            
            if (results.length === 0) {
              console.log(`[DB] Course with ID ${id} not found.`);
              return undefined;
            }
            
            console.log(`[DB] Found course:`, results[0].title);
            return results[0] as (Course & { studentsEnrolled: number });

        } catch (e) {
            console.error(`[DB-ERROR] Failed to get course by ID ${id}:`, e);
            return undefined;
        }
    },
    create: async (newCourseData: Omit<Course, 'id'>): Promise<Course & { studentsEnrolled: number }> => {
      try {
        const db = await getDb(process.env.MONGODB_DB_NAME_COURSES);
        console.log(`[DB] Creating new course: ${newCourseData.title}`);
        const result = await db.collection('courses').insertOne(newCourseData);
        const newCourse = { ...newCourseData, id: result.insertedId.toHexString() };
        console.log(`[DB] Course created with ID: ${newCourse.id}`);
        // Newly created course has no students
        return { ...newCourse, studentsEnrolled: 0 };
      } catch (error) {
        console.error('[DB-ERROR] Failed to create course:', error);
        throw error;
      }
    },
    update: async (id: string, updatedCourseData: Omit<Course, 'id'>): Promise<(Course & { studentsEnrolled: number }) | null> => {
      try {
        if (!ObjectId.isValid(id)) return null;
        const db = await getDb(process.env.MONGODB_DB_NAME_COURSES);
        console.log(`[DB] Updating course ID: ${id}`);
        
        const result = await db.collection('courses').findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updatedCourseData },
          { returnDocument: 'after' } // IMPORTANT: This ensures the NEW document is returned
        );
        
        if (!result) {
          console.log(`[DB] Update failed: Course ID ${id} not found.`);
          return null;
        }
        
        console.log(`[DB] Course ${id} updated successfully, returning new document.`);
        // The result now contains the updated document, we just need to get the enrollment count for it.
        const updatedCourseWithEnrollment = await db.courses.getById(id);
        
        return updatedCourseWithEnrollment || null;

      } catch (e) {
        console.error(`[DB-ERROR] Failed to update course ${id}:`, e);
        return null;
      }
    },
    delete: async (id: string): Promise<boolean> => {
       try {
        if (!ObjectId.isValid(id)) return false;
        const db = await getDb(process.env.MONGODB_DB_NAME_COURSES);
        const coursesCollection = db.collection('courses');
        const enrollmentsCollection = db.collection('enrollments');
        
        console.log(`[DB] Deleting enrollments for course ID: ${id}`);
        await enrollmentsCollection.deleteMany({ courseId: new ObjectId(id) });
        console.log(`[DB] Deleting course ID: ${id}`);
        const courseDeleteResult = await coursesCollection.deleteOne({ _id: new ObjectId(id) });
        
        const success = courseDeleteResult.deletedCount > 0;
        console.log(`[DB] Course ${id} deletion status: ${success}`);
        return success;
      } catch(e) {
        console.error(`[DB-ERROR] Failed to delete course ${id}:`, e);
        return false;
      }
    },
  },

  // Student methods
  students: {
    getAll: async (): Promise<Student[]> => {
      try {
        const db = await getDb(process.env.MONGODB_DB_NAME_STUDENTS);
        console.log("[DB] Fetching all students...");
        const students = await db.collection('students').find({}).project({ password: 0 }).toArray(); // Exclude password
        console.log(`[DB] Found ${students.length} students.`);
        return students.map(s => fromMongo(s) as Student);
      } catch (error) {
        console.error("[DB-ERROR] Failed to get all students:", error);
        throw error;
      }
    },
    getById: async (id: string): Promise<Student | undefined> => {
      try {
        if (!ObjectId.isValid(id)) return undefined;
        const db = await getDb(process.env.MONGODB_DB_NAME_STUDENTS);
        console.log(`[DB] Fetching student by ID: ${id}`);
        const student = await db.collection('students').findOne({ _id: new ObjectId(id) });
        if (!student) {
          console.log(`[DB] Student with ID ${id} not found.`);
          return undefined;
        }
        console.log(`[DB] Found student: ${student.name}`);
        return fromMongo(student) as Student | undefined;
      } catch (e) {
        console.error(`[DB-ERROR] Failed to get student by ID ${id}:`, e);
        return undefined;
      }
    },
    getByEmail: async (email: string): Promise<Student | undefined> => {
      try {
        const db = await getDb(process.env.MONGODB_DB_NAME_STUDENTS);
        console.log(`[DB] Fetching student by email: ${email}`);
        const student = await db.collection('students').findOne({ email: email });
         if (!student) {
          console.log(`[DB] Student with email ${email} not found.`);
          return undefined;
        }
        console.log(`[DB] Found student: ${student.name}`);
        return fromMongo(student) as Student | undefined;
      } catch (error) {
        console.error(`[DB-ERROR] Failed to get student by email ${email}:`, error);
        throw error;
      }
    },
    create: async (newStudentData: Omit<Student, 'id'>): Promise<Student> => {
      try {
        const db = await getDb(process.env.MONGODB_DB_NAME_STUDENTS);
        console.log(`[DB] Creating new student: ${newStudentData.name}`);
        const result = await db.collection('students').insertOne(newStudentData);
        const newStudent = { ...newStudentData, id: result.insertedId.toHexString() };
        console.log(`[DB] Student created with ID: ${newStudent.id}`);
        const { password, ...rest } = newStudent;
        return rest as Student;
      } catch (error) {
        console.error('[DB-ERROR] Failed to create student:', error);
        throw error;
      }
    },
    update: async (id: string, updatedStudentData: Omit<Student, 'id' | 'password'>): Promise<Student | null> => {
      try {
        if (!ObjectId.isValid(id)) return null;
        const db = await getDb(process.env.MONGODB_DB_NAME_STUDENTS);
        console.log(`[DB] Updating student ID: ${id}`);
        const result = await db.collection('students').updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedStudentData }
        );
        if (result.matchedCount === 0) {
          console.log(`[DB] Update failed: Student ID ${id} not found.`);
          return null;
        }
        console.log(`[DB] Student ${id} updated successfully.`);
        const updatedStudent = await db.students.getById(id);
        if (!updatedStudent) return null;
        const { password, ...rest } = updatedStudent;
        return rest as Student;
      } catch(e) {
        console.error(`[DB-ERROR] Failed to update student ${id}:`, e);
        return null;
      }
    },
     updatePassword: async (id: string, newPasswordHash: string): Promise<boolean> => {
      try {
        if (!ObjectId.isValid(id)) return false;
        const db = await getDb(process.env.MONGODB_DB_NAME_STUDENTS);
        console.log(`[DB] Updating password for student ID: ${id}`);
        const result = await db.collection('students').updateOne(
          { _id: new ObjectId(id) },
          { $set: { password: newPasswordHash } }
        );
        return result.modifiedCount > 0;
      } catch (e) {
        console.error(`[DB-ERROR] Failed to update password for student ${id}:`, e);
        return false;
      }
    },
    delete: async (id: string): Promise<boolean> => {
      try {
        if (!ObjectId.isValid(id)) return false;
        const db = await getDb(process.env.MONGODB_DB_NAME_STUDENTS);
        console.log(`[DB] Deleting student ID: ${id}`);
        const result = await db.collection('students').deleteOne({ _id: new ObjectId(id) });
        const success = result.deletedCount > 0;
        console.log(`[DB] Student ${id} deletion status: ${success}`);
        return success;
      } catch(e) {
        console.error(`[DB-ERROR] Failed to delete student ${id}:`, e);
        return false;
      }
    },
  },

  // Enrollment methods
  enrollments: {
    getByStudentId: async (studentId: string): Promise<Enrollment[]> => {
      try {
        const db = await getDb(process.env.MONGODB_DB_NAME_COURSES);
        console.log(`[DB] Fetching enrollments for student ID (email): ${studentId}`);
        const enrollments = await db.collection('enrollments').find({ studentId: studentId }).toArray();
        console.log(`[DB] Found ${enrollments.length} enrollments for student ${studentId}.`);
        return enrollments.map(e => fromMongo(e) as Enrollment);
      } catch (error) {
        console.error(`[DB-ERROR] Failed to get enrollments for student ${studentId}:`, error);
        throw error;
      }
    },
    create: async (enrollmentData: { studentId: string; courseId: string }): Promise<Enrollment> => {
      try {
        if (!ObjectId.isValid(enrollmentData.courseId)) {
          throw new Error("Invalid Course ID format.");
        }
        const db = await getDb(process.env.MONGODB_DB_NAME_COURSES);
        const collection = db.collection('enrollments');
        
        const existing = await collection.findOne({ studentId: enrollmentData.studentId, courseId: new ObjectId(enrollmentData.courseId) });
        if (existing) {
          throw new Error("Student is already enrolled in this course.");
        }

        const newEnrollmentDoc = {
          studentId: enrollmentData.studentId,
          courseId: new ObjectId(enrollmentData.courseId), // Storing courseId as ObjectId
          enrollmentDate: new Date().toISOString(),
        };
        
        console.log(`[DB] Creating new enrollment for student ${enrollmentData.studentId} in course ${enrollmentData.courseId}`);
        const result = await collection.insertOne(newEnrollmentDoc);

        const createdDoc = fromMongo({_id: result.insertedId, ...newEnrollmentDoc});
        console.log(`[DB] Enrollment created with ID: ${createdDoc.id}`);
        return createdDoc as Enrollment;
      } catch (error) {
        console.error('[DB-ERROR] Failed to create enrollment:', error);
        throw error;
      }
    },
  },
};
