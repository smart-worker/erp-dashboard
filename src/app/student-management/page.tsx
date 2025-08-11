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
import { PlusCircle, Edit, Trash2, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Student {
  id: string; // Internal ID
  studentId: string; // Displayed Student ID
  name: string;
  email: string;
  program: string;
}

const studentSchema = z.object({
  studentId: z
    .string()
    .min(5, { message: "Student ID must be at least 5 characters." })
    .max(15),
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters." })
    .max(100),
  email: z.string().email({ message: "Invalid email address." }),
  program: z
    .string()
    .min(3, { message: "Program name must be at least 3 characters." })
    .max(50),
});

type StudentFormData = z.infer<typeof studentSchema>;

export default function StudentManagementPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const { role, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isAddOrEditStudentDialogOpen, setIsAddOrEditStudentDialogOpen] =
    useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  useEffect(() => {
    async function fetchStudents() {
      try {
        const response = await fetch("/api/students");
        if (!response.ok) throw new Error("Failed to fetch students");
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load students.",
        });
      } finally {
        setIsDataLoading(false);
      }
    }
    fetchStudents();
  }, [toast]);

  const openAddStudentDialog = () => {
    setEditingStudent(null);
    reset({ studentId: "", name: "", email: "", program: "" });
    setIsAddOrEditStudentDialogOpen(true);
  };

  const openEditStudentDialog = (student: Student) => {
    setEditingStudent(student);
    setValue("studentId", student.studentId);
    setValue("name", student.name);
    setValue("email", student.email);
    setValue("program", student.program);
    setIsAddOrEditStudentDialogOpen(true);
  };

  const handleAddOrEditStudentSubmit: SubmitHandler<StudentFormData> = async (
    data
  ) => {
    setIsSubmittingForm(true);
    const url = editingStudent
      ? `/api/students/${editingStudent.id}`
      : "/api/students";
    const method = editingStudent ? "PUT" : "POST";

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
            `Failed to ${editingStudent ? "update" : "add"} student`
        );
      }

      const resultStudent: Student = await response.json();

      if (editingStudent) {
        setStudents((prevStudents) =>
          prevStudents.map((s) =>
            s.id === editingStudent.id ? resultStudent : s
          )
        );
        toast({
          title: "Student Updated!",
          description: `${resultStudent.name} has been updated.`,
        });
      } else {
        setStudents((prevStudents) => [resultStudent, ...prevStudents]);
        toast({
          title: "Student Added!",
          description: `${resultStudent.name} has been added.`,
        });
      }
      reset();
      setIsAddOrEditStudentDialogOpen(false);
      setEditingStudent(null);
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

  const openDeleteDialog = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsSubmittingForm(true);

    try {
      const response = await fetch(`/api/students/${studentToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete student");
      }
      setStudents((prevStudents) =>
        prevStudents.filter((student) => student.id !== studentToDelete.id)
      );
      toast({
        title: "Student Deleted!",
        description: `${studentToDelete.name} has been removed.`,
        variant: "destructive",
      });
      setStudentToDelete(null);
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

  if (isAuthLoading || isDataLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Users className="h-8 w-8 animate-spin text-primary" />
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
              <Users className="h-7 w-7 text-primary" />
              Student Management
            </CardTitle>
            <CardDescription>
              View, add, edit, and manage student records.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={openAddStudentDialog}
            disabled={isSubmittingForm}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Student
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Program</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.studentId}
                  </TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.program}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditStudentDialog(student)}
                      className="h-8 w-8"
                      disabled={isSubmittingForm}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit Student</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => openDeleteDialog(student)}
                      className="h-8 w-8"
                      disabled={isSubmittingForm}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete Student</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {students.length === 0 && (
            <p className="py-10 text-center text-muted-foreground">
              No students found. Click &quot;Add New Student&quot; to get
              started.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Showing {students.length}{" "}
            {students.length === 1 ? "student" : "students"}.
          </p>
        </CardFooter>
      </Card>

      {/* Add/Edit Student Dialog */}
      <Dialog
        open={isAddOrEditStudentDialogOpen}
        onOpenChange={(isOpen) => {
          if (isSubmittingForm && isOpen) return;
          setIsAddOrEditStudentDialogOpen(isOpen);
          if (!isOpen) setEditingStudent(null);
        }}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? "Edit Student" : "Add New Student"}
            </DialogTitle>
            <DialogDescription>
              {editingStudent
                ? "Update the student details below."
                : "Fill in the details below to add a new student."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(handleAddOrEditStudentSubmit)}
            className="grid gap-4 py-4"
          >
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="studentId" className="text-right">
                ID
              </Label>
              <div className="col-span-3">
                <Input
                  id="studentId"
                  {...register("studentId")}
                  className={errors.studentId ? "border-destructive" : ""}
                  disabled={isSubmittingForm}
                />
                {errors.studentId && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.studentId.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  {...register("name")}
                  className={errors.name ? "border-destructive" : ""}
                  disabled={isSubmittingForm}
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <div className="col-span-3">
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                  disabled={isSubmittingForm}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program" className="text-right">
                Program
              </Label>
              <div className="col-span-3">
                <Input
                  id="program"
                  {...register("program")}
                  className={errors.program ? "border-destructive" : ""}
                  disabled={isSubmittingForm}
                />
                {errors.program && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.program.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setEditingStudent(null);
                    setIsAddOrEditStudentDialogOpen(false);
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
                {editingStudent ? "Save Changes" : "Add Student"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Student Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(isOpen) => {
          if (isSubmittingForm && isOpen) return;
          setIsDeleteDialogOpen(isOpen);
          if (!isOpen) setStudentToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              student record for
              <span className="font-semibold"> {studentToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setStudentToDelete(null)}
              disabled={isSubmittingForm}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStudent}
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
