"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Library, Loader2, CheckCircle, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  code: string;
  title: string;
  description?: string;
  credits: number;
  studentsEnrolled: number;
}

export default function CourseCatalogPage() {
  const { role, userEmail, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(
    new Set()
  );
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(
    null
  );

  const fetchData = useCallback(async () => {
    if (!userEmail) return;
    setIsDataLoading(true);
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        fetch("/api/courses"),
        fetch(`/api/enrollments?studentId=${userEmail}`),
      ]);

      if (!coursesRes.ok) throw new Error("Failed to fetch courses.");
      if (!enrollmentsRes.ok)
        throw new Error("Failed to fetch your enrollments.");

      const coursesData = await coursesRes.json();
      const enrollmentsData = await enrollmentsRes.json();

      setCourses(coursesData);
      setEnrolledCourseIds(
        new Set(enrollmentsData.map((e: any) => e.courseId))
      );
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsDataLoading(false);
    }
  }, [userEmail, toast]);

  useEffect(() => {
    if (role === "student") {
      fetchData();
    }
  }, [role, fetchData]);

  const handleEnroll = async (courseId: string) => {
    if (!userEmail) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to enroll.",
      });
      return;
    }
    setEnrollingCourseId(courseId);
    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: userEmail, courseId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to enroll in the course.");
      }

      toast({
        title: "Success!",
        description: "You've been enrolled in the course.",
      });
      // Refresh data to show updated enrollment status
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Enrollment Failed",
        description: error.message,
      });
    } finally {
      setEnrollingCourseId(null);
    }
  };

  if (isAuthLoading || isDataLoading) {
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
      <div className="p-4 text-center text-destructive">
        Access Denied. This page is for students only.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Library className="h-7 w-7 text-primary" />
            Course Catalog
          </CardTitle>
          <CardDescription>
            Browse available courses and enroll for the upcoming semester.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-center">Credits</TableHead>
                <TableHead className="text-center">Enrolled</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => {
                const isEnrolled = enrolledCourseIds.has(course.id);
                const isEnrolling = enrollingCourseId === course.id;
                return (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.code}</TableCell>
                    <TableCell>
                      <div className="font-medium">{course.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {course.description}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {course.credits}
                    </TableCell>
                    <TableCell className="text-center">
                      {course.studentsEnrolled}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEnrolled ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          className="text-green-600 cursor-not-allowed"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Enrolled
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleEnroll(course.id)}
                          disabled={isEnrolling}
                        >
                          {isEnrolling ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <PlusCircle className="mr-2 h-4 w-4" />
                          )}
                          Enroll
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
