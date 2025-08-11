"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookCopy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnrolledCourse {
  id: string; // This is the enrollment ID
  course: {
    code: string;
    title: string;
    credits: number;
    description?: string;
  };
  enrollmentDate: string;
}

export default function MyCoursesPage() {
  const { role, userEmail, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const fetchEnrolledCourses = useCallback(async () => {
    if (!userEmail) return;
    setIsDataLoading(true);
    try {
      const response = await fetch(`/api/enrollments?studentId=${userEmail}`);
      if (!response.ok) {
        throw new Error("Failed to fetch enrolled courses.");
      }
      const data = await response.json();
      setEnrolledCourses(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not load your courses.",
      });
    } finally {
      setIsDataLoading(false);
    }
  }, [userEmail, toast]);

  useEffect(() => {
    if (!isAuthLoading && role === "student") {
      fetchEnrolledCourses();
    }
  }, [role, isAuthLoading, fetchEnrolledCourses]);

  if (isAuthLoading || (role === "student" && isDataLoading)) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role !== "student") {
    if (typeof window !== "undefined") {
      router.push("/dashboard");
    }
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-destructive">
          Access Denied. This page is for students only.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BookCopy className="h-7 w-7 text-primary" />
            My Enrolled Courses
          </CardTitle>
          <CardDescription>
            Here is a list of courses you are currently enrolled in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enrolledCourses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead className="text-center">Credits</TableHead>
                  <TableHead>Enrolled On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrolledCourses.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">
                      {enrollment.course.code}
                    </TableCell>
                    <TableCell>{enrollment.course.title}</TableCell>
                    <TableCell className="text-center">
                      {enrollment.course.credits}
                    </TableCell>
                    <TableCell>
                      {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-10 text-center text-muted-foreground">
              You are not currently enrolled in any courses. Visit the Course
              Catalog to enroll.
            </p>
          )}
        </CardContent>
        {enrolledCourses.length > 0 && (
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Showing {enrolledCourses.length}{" "}
              {enrolledCourses.length === 1 ? "course" : "courses"}.
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
