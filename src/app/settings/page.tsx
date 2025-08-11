"use client";

import { useState, useRef, type ChangeEvent, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Bell,
  Palette,
  Shield,
  Briefcase,
  KeyRound,
  Edit3,
  UploadCloud,
  Settings,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const passwordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, { message: "Current password is required." }),
  newPassword: z
    .string()
    .min(6, { message: "New password must be at least 6 characters." }),
});
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const {
    role,
    userEmail,
    userId,
    isLoading,
    avatarUrl,
    updateProfile,
    userName,
  } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for editing, initialized from context
  const [displayName, setDisplayName] = useState(userName);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Mock states for other settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [makeProfilePublic, setMakeProfilePublic] = useState(false);
  const [weeklySummaries, setWeeklySummaries] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Effect to sync local state if context changes (e.g., user logs in/out)
  useEffect(() => {
    setDisplayName(userName);
  }, [userName]);

  const handleSaveChanges = () => {
    setIsSaving(true);
    // Update the profile with the local state values
    updateProfile({ name: displayName, avatar: imagePreview || avatarUrl });

    toast({
      title: "Profile Saved!",
      description: "Your new profile information has been saved.",
    });

    // Clear the preview after saving
    setImagePreview(null);
    setIsSaving(false);
  };

  const onPasswordChangeSubmit: SubmitHandler<PasswordFormData> = async (
    data
  ) => {
    setIsChangingPassword(true);
    try {
      const response = await fetch(`/api/students/${userId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to change password.");
      }

      toast({
        title: "Password Changed!",
        description: "Your password has been updated successfully.",
      });
      setIsPasswordDialogOpen(false);
      resetPasswordForm();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      // 1MB limit
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Please select an image smaller than 1MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      // Set the preview URL, do not save yet
      setImagePreview(reader.result as string);
    };
    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "There was an error reading the file.",
      });
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <KeyRound className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Settings className="h-7 w-7 text-primary" />
            Account Settings
          </CardTitle>
          <CardDescription>
            Manage your account settings, profile information, and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="profile">
                <User className="mr-2 h-4 w-4 inline-block" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="mr-2 h-4 w-4 inline-block" />
                Notifications
              </TabsTrigger>
              {role === "student" && (
                <TabsTrigger value="student">
                  <Shield className="mr-2 h-4 w-4 inline-block" />
                  Student
                </TabsTrigger>
              )}
              {role === "teacher" && (
                <TabsTrigger value="teacher">
                  <Briefcase className="mr-2 h-4 w-4 inline-block" />
                  Teacher
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal details. Click "Save Profile" to apply
                    changes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={
                          imagePreview ||
                          avatarUrl ||
                          `https://placehold.co/100x100.png`
                        }
                        alt="User Avatar"
                      />
                      <AvatarFallback>
                        {userName
                          ? userName.substring(0, 2).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/png, image/jpeg, image/gif"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSaving}
                      >
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Choose Photo...
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, GIF or PNG. 1MB max.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userEmail || ""}
                      disabled
                    />
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Password</h3>
                    <Dialog
                      open={isPasswordDialogOpen}
                      onOpenChange={setIsPasswordDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <KeyRound className="mr-2 h-4 w-4" /> Change Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Your Password</DialogTitle>
                          <DialogDescription>
                            Enter your current password and a new password
                            below.
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          onSubmit={handlePasswordSubmit(
                            onPasswordChangeSubmit
                          )}
                          className="space-y-4"
                        >
                          <div className="space-y-1">
                            <Label htmlFor="currentPassword">
                              Current Password
                            </Label>
                            <Input
                              id="currentPassword"
                              type="password"
                              {...registerPassword("currentPassword")}
                              disabled={isChangingPassword}
                            />
                            {passwordErrors.currentPassword && (
                              <p className="text-xs text-destructive mt-1">
                                {passwordErrors.currentPassword.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              {...registerPassword("newPassword")}
                              disabled={isChangingPassword}
                            />
                            {passwordErrors.newPassword && (
                              <p className="text-xs text-destructive mt-1">
                                {passwordErrors.newPassword.message}
                              </p>
                            )}
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={isChangingPassword}
                              >
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button type="submit" disabled={isChangingPassword}>
                              {isChangingPassword && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Save New Password
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <p className="text-xs text-muted-foreground mt-1">
                      Update your account password.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Edit3 className="mr-2 h-4 w-4" />
                    )}
                    Save Profile
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you receive notifications from CampusPulse.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <Label
                        htmlFor="emailNotifications"
                        className="font-medium"
                      >
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive important updates and alerts via email.
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <Label
                        htmlFor="pushNotifications"
                        className="font-medium"
                      >
                        Push Notifications (Mobile App)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Get real-time alerts on your mobile device (coming
                        soon).
                      </p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                      disabled
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveChanges}>
                    <Bell className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {role === "student" && (
              <TabsContent value="student">
                <Card>
                  <CardHeader>
                    <CardTitle>Student-Specific Settings</CardTitle>
                    <CardDescription>
                      Manage settings relevant to your student experience.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label
                          htmlFor="makeProfilePublic"
                          className="font-medium"
                        >
                          Public Profile
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow other students and faculty to view your basic
                          profile.
                        </p>
                      </div>
                      <Switch
                        id="makeProfilePublic"
                        checked={makeProfilePublic}
                        onCheckedChange={setMakeProfilePublic}
                      />
                    </div>
                    <div className="rounded-lg border p-4">
                      <Label className="font-medium">Linked Accounts</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Connect external accounts (e.g., Google Drive,
                        LinkedIn).
                      </p>
                      <Button variant="outline" disabled>
                        Link Google Drive
                      </Button>
                      <Button variant="outline" className="ml-2" disabled>
                        Link LinkedIn
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveChanges}>
                      <Shield className="mr-2 h-4 w-4" />
                      Save Student Settings
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            )}

            {role === "teacher" && (
              <TabsContent value="teacher">
                <Card>
                  <CardHeader>
                    <CardTitle>Teacher-Specific Settings</CardTitle>
                    <CardDescription>
                      Customize settings related to your teaching
                      responsibilities.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label
                          htmlFor="weeklySummaries"
                          className="font-medium"
                        >
                          Weekly Progress Summaries
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email summaries of student progress in your
                          courses.
                        </p>
                      </div>
                      <Switch
                        id="weeklySummaries"
                        checked={weeklySummaries}
                        onCheckedChange={setWeeklySummaries}
                      />
                    </div>
                    <div className="rounded-lg border p-4">
                      <Label
                        htmlFor="defaultGradingScale"
                        className="font-medium"
                      >
                        Default Grading Scale
                      </Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Set your preferred default grading scale for new
                        courses.
                      </p>
                      <select
                        id="defaultGradingScale"
                        className="w-full p-2 border rounded-md bg-background text-sm"
                        disabled
                      >
                        <option>Standard (A-F)</option>
                        <option>Pass/Fail</option>
                        <option>Percentage</option>
                      </select>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto mt-1"
                        disabled
                      >
                        Customize Scales
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveChanges}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      Save Teacher Settings
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
