import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as a common modern font
import "./globals.css";
// import { Toaster } from "@/component÷s/ui/toaster";
// import { TailwindIndicator } from "@/components/dev/tailwind-indicator"; // Optional: for dev mode

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Changed from geist to inter for broader appeal
});

export const metadata: Metadata = {
  title: "CampusPulse - College ERP",
  description: "Advanced ERP dashboard for college operations by CampusPulse.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
        {/* <Toaster /> */}
        {/* <TailwindIndicator /> Optional dev tool */}
      </body>
    </html>
  );
}
