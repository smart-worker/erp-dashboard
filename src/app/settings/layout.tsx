import AppLayout from "@/components/layout/app-layout";
import type { ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppLayout>{children}</AppLayout>
    </AuthProvider>
  );
}
