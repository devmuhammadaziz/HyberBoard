"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/charts/MetricCard";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { adminFetch } from "@/lib/api";
import {
  Users,
  Layers,
  Activity,
  HardDrive,
  Clock,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  users: number;
  onboardedUsers: number;
  pendingUsers: number;
  boards: number;
  sessions: number;
  subjectBreakdown: {
    math: number;
    physics: number;
    chemistry: number;
  };
  timeline: Array<{
    date: string;
    users: number;
    boards: number;
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    onboarded: boolean;
    subjects: string[];
    role: string;
    createdAt?: string;
  }>;
  recentBoards: Array<{
    id: string;
    title: string;
    subject: "math" | "physics" | "chemistry";
    elementCount: number;
    creatorName: string;
    creatorEmail: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
}

interface R2Overview {
  r2: {
    formattedSize: string;
    totalObjects: number;
    status: string;
  };
}

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [r2Data, setR2Data] = useState<R2Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const [statsRes, r2Res] = await Promise.all([
        adminFetch<DashboardStats>("/admin/stats"),
        adminFetch<R2Overview>("/admin/storage/r2").catch(() => null),
      ]);
      setStats(statsRes);
      if (r2Res) setR2Data(r2Res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const onboardedRate = stats && stats.users > 0
    ? Math.round((stats.onboardedUsers / stats.users) * 100)
    : 100;

  return (
    <DashboardLayout
      title="System Telemetry & Overview"
      description="Live platform analytics, user signups, blackboard activity, and storage state"
      onRefresh={fetchData}
      refreshing={refreshing}
    >
      {error && (
        <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={stats ? stats.users : "—"}
          subtitle={`${stats?.onboardedUsers ?? 0} onboarded teachers`}
          icon={Users}
          accentColor="#4F46E5"
          badge={{
            text: `${onboardedRate}% Complete`,
            variant: "indigo",
          }}
        />

        <MetricCard
          title="Active Boards"
          value={stats ? stats.boards : "—"}
          subtitle="Across STEM curricula"
          icon={Layers}
          accentColor="#10B981"
          badge={{
            text: "Live Sync",
            variant: "emerald",
          }}
        />

        <MetricCard
          title="Session Histories"
          value={stats ? stats.sessions : "—"}
          subtitle="Saved board revisions"
          icon={Activity}
          accentColor="#06B6D4"
          badge={{
            text: "Auto-Saved",
            variant: "cyan",
          }}
        />

        <MetricCard
          title="Cloudflare R2"
          value={r2Data ? r2Data.r2.formattedSize : "Active"}
          subtitle={
            r2Data ? `${r2Data.r2.totalObjects} snapshots stored` : "Checking storage…"
          }
          icon={HardDrive}
          accentColor="#F59E0B"
          badge={{
            text: r2Data?.r2.status === "connected" ? "Connected" : "Configured",
            variant: "amber",
          }}
        />
      </div>

      {/* Charts Section */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Line Chart: 14-day Activity Trend */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Platform Growth & Activity (14 Days)
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Daily telemetry of newly registered users and newly created boards
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1 text-xs text-[var(--text-secondary)] border border-white/5">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <span>Realtime</span>
            </div>
          </div>

          {stats?.timeline && (
            <LineChart
              categories={stats.timeline.map((t) => t.date)}
              series={[
                {
                  name: "New Boards",
                  color: "#4F46E5",
                  data: stats.timeline.map((t) => t.boards),
                },
                {
                  name: "New Users",
                  color: "#10B981",
                  data: stats.timeline.map((t) => t.users),
                },
              ]}
              height={260}
            />
          )}
        </div>

        {/* Bar Chart: Subject Breakdown */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-white">Subject Distribution</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Board creation by academic discipline
            </p>
          </div>

          {stats?.subjectBreakdown && (
            <BarChart
              data={[
                {
                  label: "Math",
                  value: stats.subjectBreakdown.math,
                  color: "#10B981",
                  secondaryLabel: "Calculus & Alg",
                },
                {
                  label: "Physics",
                  value: stats.subjectBreakdown.physics,
                  color: "#06B6D4",
                  secondaryLabel: "Mechanics & Optics",
                },
                {
                  label: "Chemistry",
                  value: stats.subjectBreakdown.chemistry,
                  color: "#F59E0B",
                  secondaryLabel: "Molecules & Rxns",
                },
              ]}
              height={260}
            />
          )}
        </div>
      </div>

      {/* Split Details Section */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Recent Users List */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Users</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Latest educators joining the workspace
              </p>
            </div>
            <Link
              href="/users"
              className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {!stats?.recentUsers?.length ? (
              <div className="p-8 text-center text-xs text-[var(--text-secondary)]">
                No users registered yet
              </div>
            ) : (
              stats.recentUsers.slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center justify-between px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 font-bold text-xs border border-indigo-500/20">
                      {u.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{u.name}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{u.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        u.onboarded
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {u.onboarded ? "Onboarded" : "Pending"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Boards List */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Boards</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Latest blackboards created by teachers
              </p>
            </div>
            <Link
              href="/boards"
              className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {!stats?.recentBoards?.length ? (
              <div className="p-8 text-center text-xs text-[var(--text-secondary)]">
                No active boards found
              </div>
            ) : (
              stats.recentBoards.slice(0, 5).map((b) => {
                const subjectColor = {
                  math: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                  physics: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
                  chemistry: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                }[b.subject] || "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";

                return (
                  <div key={b.id} className="flex items-center justify-between px-6 py-3.5">
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">
                          {b.title}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.2 text-[10px] font-semibold uppercase ${subjectColor}`}
                        >
                          {b.subject}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        by {b.creatorName} ({b.creatorEmail})
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-xs font-semibold text-white">
                        {b.elementCount} elements
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : "Recent"}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
