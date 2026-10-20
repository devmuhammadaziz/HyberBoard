import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "HyperBoard Ops Console",
  description: "Enterprise administration & analytics dashboard for HyperBoard Studio",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
