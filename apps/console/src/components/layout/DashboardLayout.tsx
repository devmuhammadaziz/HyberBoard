"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/auth-context";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Loader2 } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function DashboardLayout({
  children,
  title,
  description,
  onRefresh,
  refreshing = false,
}: DashboardLayoutProps) {
  const { user, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-xs text-[var(--text-secondary)] font-medium">
            Verifying Admin Session…
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[var(--text-primary)]">
      <Sidebar />
      <div className="ml-64 flex min-h-screen flex-col">
        <Header
          title={title}
          description={description}
          onRefresh={onRefresh}
          loading={refreshing}
        />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
