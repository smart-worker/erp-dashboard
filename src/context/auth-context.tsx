"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

export type UserRole = "student" | "teacher" | null;

interface UserProfile {
  name: string;
  avatar: string | null;
}
interface AuthContextType {
  role: UserRole;
  login: (userRole: UserRole, email: string, userId: string) => void;
  logout: () => void;
  isLoading: boolean;
  userEmail: string | null;
  userId: string | null;
  userName: string;
  avatarUrl: string | null;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("User Name");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem("userRole") as UserRole;
      const storedEmail = localStorage.getItem("userEmail");
      const storedId = localStorage.getItem("userId");
      if (storedRole && storedEmail && storedId) {
        setRole(storedRole);
        setUserEmail(storedEmail);
        setUserId(storedId);
        const storedAvatar = localStorage.getItem(`avatar_${storedEmail}`);
        if (storedAvatar) setAvatarUrl(storedAvatar);
        const storedName = localStorage.getItem(`name_${storedEmail}`);
        if (storedName) setUserName(storedName);
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    (userRole: UserRole, email: string, id: string) => {
      if (userRole && email && id) {
        try {
          localStorage.setItem("userRole", userRole);
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userId", id);
          const storedAvatar = localStorage.getItem(`avatar_${email}`);
          const storedName = localStorage.getItem(`name_${email}`);
          setAvatarUrl(storedAvatar || null);
          setUserName(
            storedName ||
              (userRole === "teacher" ? "Admin User" : "Student User")
          );
        } catch (error) {
          console.error("Failed to access localStorage:", error);
        }
        setRole(userRole);
        setUserEmail(email);
        setUserId(id);
        router.push("/dashboard");
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("userRole");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");
      // Note: We are not removing name/avatar so it can be remembered for next login
    } catch (error) {
      console.error("Failed to access localStorage:", error);
    }
    setRole(null);
    setUserEmail(null);
    setUserId(null);
    setAvatarUrl(null);
    setUserName("User Name");
    router.push("/login");
  }, [router]);

  const updateProfile = useCallback(
    (profile: Partial<UserProfile>) => {
      if (!userEmail) return;
      try {
        if (profile.name) {
          localStorage.setItem(`name_${userEmail}`, profile.name);
          setUserName(profile.name);
        }
        if (profile.avatar) {
          localStorage.setItem(`avatar_${userEmail}`, profile.avatar);
          setAvatarUrl(profile.avatar);
        }
      } catch (error) {
        console.error("Failed to save profile to localStorage:", error);
      }
    },
    [userEmail]
  );

  return (
    <AuthContext.Provider
      value={{
        role,
        login,
        logout,
        isLoading,
        userEmail,
        userId,
        userName,
        avatarUrl,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
