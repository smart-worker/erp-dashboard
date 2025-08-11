import AppLayout from "@/components/layout/app-layout";
import type { ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context"; // Import AuthProvider

export default function ResourceOptimizationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      {" "}
      {/* Wrap with AuthProvider */}
      <AppLayout>{children}</AppLayout>
    </AuthProvider>
  );
}
