"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusCircle,
  Edit,
  Trash2,
  BookOpen,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateDescriptionAction } from "./actions";

interface Course {
  id: string;
  code: string;
  title: string;
  description?: string;
  credits: number;
  studentsEnrolled: number;
}

const courseSchema = z.object({
  code: z
    .string()
    .min(3, { message: "Course code must be at least 3 characters." })
    .max(10),
  title: z
    .string()
    .min(5, { message: "Course title must be at least 5 characters." })
    .max(100),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(500, "Description cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),
  credits: z.coerce
    .number()
    .min(1, { message: "Credits must be at least 1." })
    .max(10),
});

type CourseFormData = z.infer<typeof courseSchema>;

export default function CourseManagementPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const { role, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isAddOrEditCourseDialogOpen, setIsAddOrEditCourseDialogOpen] =
    useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [aiKeywords, setAiKeywords] = useState("");
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
  });

  const fetchCourses = async () => {
    setIsDataLoading(true);
    try {
      const response = await fetch("/api/courses");
      if (!response.ok) throw new Error("Failed to fetch courses");
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load courses.",
      });
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openAddCourseDialog = () => {
    setEditingCourse(null);
    reset({ code: "", title: "", description: "", credits: 1 });
    setAiKeywords("");
    setIsAddOrEditCourseDialogOpen(true);
  };

  const openEditCourseDialog = (course: Course) => {
    setEditingCourse(course);
    setValue("code", course.code);
    setValue("title", course.title);
    setValue("description", course.description || "");
    setValue("credits", course.credits);
    setAiKeywords("");
    setIsAddOrEditCourseDialogOpen(true);
  };

  const handleAddOrEditCourseSubmit: SubmitHandler<CourseFormData> = async (
    data
  ) => {
    setIsSubmittingForm(true);
    const url = editingCourse
      ? `/api/courses/${editingCourse.id}`
      : "/api/courses";
    const method = editingCourse ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to ${editingCourse ? "update" : "add"} course`
        );
      }

      const resultCourse: Course = await response.json();

      if (!resultCourse) {
        throw new Error("API did not return the updated course.");
      }

      if (editingCourse) {
        toast({
          title: "Course Updated!",
          description: `${resultCourse.title} has been updated.`,
        });
      } else {
        toast({
          title: "Course Added!",
          description: `${resultCourse.title} has been added.`,
        });
      }

      // Refetch all courses to ensure the UI is in sync with the database
      await fetchCourses();

      reset();
      setIsAddOrEditCourseDialogOpen(false);
      setEditingCourse(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const openDeleteDialog = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    setIsSubmittingForm(true);

    try {
      const response = await fetch(`/api/courses/${courseToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete course");
      }
      setCourses((prevCourses) =>
        prevCourses.filter((course) => course.id !== courseToDelete.id)
      );
      toast({
        title: "Course Deleted!",
        description: `${courseToDelete.title} has been removed.`,
        variant: "destructive",
      });
      setCourseToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleGenerateDescription = async () => {
    const currentTitle = getValues("title");
    const currentCode = getValues("code");

    if (!currentTitle) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description:
          "Please enter a Course Title before generating a description.",
      });
      return;
    }
    if (!currentCode) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description:
          "Please enter a Course Code before generating a description.",
      });
      return;
    }

    setIsGeneratingDescription(true);
    const formData = new FormData();
    formData.append("courseTitle", currentTitle);
    formData.append("courseCode", currentCode);
    formData.append("keywords", aiKeywords);

    try {
      const result = await generateDescriptionAction(undefined, formData);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "AI Error",
          description: result.error,
        });
      } else if (result.description) {
        setValue("description", result.description);
        toast({
          title: "Description Generated!",
          description: "AI has populated the description field.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate description.",
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  if (isAuthLoading || isDataLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <BookOpen className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role !== "teacher") {
    if (typeof window !== "undefined") {
      router.push("/dashboard");
    }
    return (
      <div className="p-4 text-center text-destructive">
        Access Denied. You must be a teacher to view this page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-primary" />
              Course Management
            </CardTitle>
            <CardDescription>
              Oversee, add, and manage academic courses offered.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={openAddCourseDialog}
            disabled={isSubmittingForm}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Course
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Title</TableHead>
                <TableHead className="text-center">Credits</TableHead>
                <TableHead className="text-center">Enrolled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.code}</TableCell>
                  <TableCell>{course.title}</TableCell>
                  <TableCell className="text-center">
                    {course.credits}
                  </TableCell>
                  <TableCell className="text-center">
                    {course.studentsEnrolled}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditCourseDialog(course)}
                      className="h-8 w-8"
                      disabled={isSubmittingForm}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit Course</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => openDeleteDialog(course)}
                      className="h-8 w-8"
                      disabled={isSubmittingForm}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete Course</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {courses.length === 0 && (
            <p className="py-10 text-center text-muted-foreground">
              No courses found. Click &quot;Add New Course&quot; to get started.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Showing {courses.length}{" "}
            {courses.length === 1 ? "course" : "courses"}.
          </p>
        </CardFooter>
      </Card>

      {/* Add/Edit Course Dialog */}
      <Dialog
        open={isAddOrEditCourseDialogOpen}
        onOpenChange={(isOpen) => {
          if (isSubmittingForm && isOpen) return;
          setIsAddOrEditCourseDialogOpen(isOpen);
          if (!isOpen) {
            setEditingCourse(null);
            reset();
            setAiKeywords("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? "Edit Course" : "Add New Course"}
            </DialogTitle>
            <DialogDescription>
              {editingCourse
                ? "Update the course details below."
                : "Fill in the details below to add a new course. Click save when you're done."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(handleAddOrEditCourseSubmit)}
            className="grid gap-4 py-4"
          >
            <div className="space-y-1">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                {...register("code")}
                className={errors.code ? "border-destructive" : ""}
                disabled={isSubmittingForm}
              />
              {errors.code && (
                <p className="text-xs text-destructive mt-1">
                  {errors.code.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register("title")}
                className={errors.title ? "border-destructive" : ""}
                disabled={isSubmittingForm}
              />
              {errors.title && (
                <p className="text-xs text-destructive mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                className={errors.description ? "border-destructive" : ""}
                disabled={isSubmittingForm || isGeneratingDescription}
                rows={3}
              />
              {errors.description && (
                <p className="text-xs text-destructive mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2 rounded-md border border-dashed p-3">
              <Label
                htmlFor="aiKeywords"
                className="text-sm text-muted-foreground"
              >
                Keywords for AI Description (Optional)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="aiKeywords"
                  placeholder="e.g., beginner, programming, web"
                  value={aiKeywords}
                  onChange={(e) => setAiKeywords(e.target.value)}
                  disabled={isGeneratingDescription || isSubmittingForm}
                  className="flex-grow"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateDescription}
                  disabled={isGeneratingDescription || isSubmittingForm}
                  className="whitespace-nowrap"
                >
                  {isGeneratingDescription ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate with AI
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                type="number"
                {...register("credits")}
                className={errors.credits ? "border-destructive" : ""}
                disabled={isSubmittingForm}
              />
              {errors.credits && (
                <p className="text-xs text-destructive mt-1">
                  {errors.credits.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setEditingCourse(null);
                    setIsAddOrEditCourseDialogOpen(false);
                    setAiKeywords("");
                  }}
                  disabled={isSubmittingForm}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmittingForm}>
                {isSubmittingForm && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingCourse ? "Save Changes" : "Save Course"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Course Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(isOpen) => {
          if (isSubmittingForm && isOpen) return;
          setIsDeleteDialogOpen(isOpen);
          if (!isOpen) setCourseToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              course
              <span className="font-semibold">
                {" "}
                {courseToDelete?.title}
              </span>{" "}
              and unenroll all students.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setCourseToDelete(null)}
              disabled={isSubmittingForm}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCourse}
              disabled={isSubmittingForm}
            >
              {isSubmittingForm && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
