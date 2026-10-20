"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/charts/MetricCard";
import { BarChart } from "@/components/charts/BarChart";
import { adminFetch } from "@/lib/api";
import {
  Layers,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sigma,
  Zap,
  FlaskConical,
} from "lucide-react";

interface BoardItem {
  id: string;
  title: string;
  subject: "math" | "physics" | "chemistry";
  elementCount: number;
  creator: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface BoardsApiResponse {
  boards: BoardItem[];
  analytics: {
    total: number;
    bySubject: Array<{
      subject: "math" | "physics" | "chemistry";
      count: number;
      avgElements: number;
    }>;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function BoardsPage() {
  const [boards, setBoards] = useState<BoardItem[]>([]);
  const [analytics, setAnalytics] = useState<BoardsApiResponse["analytics"] | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBoards = useCallback(async (pageToLoad = 1) => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams({
        page: String(pageToLoad),
        limit: "15",
      });
      if (search.trim()) params.set("search", search.trim());
      if (subjectFilter) params.set("subject", subjectFilter);

      const res = await adminFetch<BoardsApiResponse>(`/admin/boards?${params.toString()}`);
      setBoards(res.boards);
      setAnalytics(res.analytics);
      setPagination(res.pagination);
    } catch {
      // Error handling
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, subjectFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchBoards(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchBoards]);

  const mathCount = analytics?.bySubject.find((s) => s.subject === "math")?.count || 0;
  const physCount = analytics?.bySubject.find((s) => s.subject === "physics")?.count || 0;
  const chemCount = analytics?.bySubject.find((s) => s.subject === "chemistry")?.count || 0;

  return (
    <DashboardLayout
      title="Boards & Activity Analytics"
      description="Inspect interactive classrooms, canvas element density, and live teacher sessions"
      onRefresh={() => fetchBoards(pagination.page)}
      refreshing={refreshing}
    >
      {/* Metric Cards Row */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Boards"
          value={pagination.total}
          subtitle="All created workspaces"
          icon={Layers}
          accentColor="#4F46E5"
        />

        <MetricCard
          title="Mathematics"
          value={mathCount}
          subtitle="Calculus, equations & 3D geometry"
          icon={Sigma}
          accentColor="#10B981"
          badge={{ text: "Active", variant: "emerald" }}
        />

        <MetricCard
          title="Physics"
          value={physCount}
          subtitle="Mechanics, ray tracing & circuits"
          icon={Zap}
          accentColor="#06B6D4"
          badge={{ text: "Active", variant: "cyan" }}
        />

        <MetricCard
          title="Chemistry"
          value={chemCount}
          subtitle="Reactions, VSEPR & periodic trends"
          icon={FlaskConical}
          accentColor="#F59E0B"
          badge={{ text: "Active", variant: "amber" }}
        />
      </div>

      {/* Analytics Chart & Breakdown */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">
              Subject Distribution & Elements Density
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Total interactive desks deployed across core STEM disciplines
            </p>
          </div>

          <BarChart
            data={[
              {
                label: "Mathematics",
                value: mathCount,
                color: "#10B981",
                secondaryLabel: `${mathCount} boards`,
              },
              {
                label: "Physics",
                value: physCount,
                color: "#06B6D4",
                secondaryLabel: `${physCount} boards`,
              },
              {
                label: "Chemistry",
                value: chemCount,
                color: "#F59E0B",
                secondaryLabel: `${chemCount} boards`,
              },
            ]}
            height={220}
          />
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
          <div>
            <h3 className="text-base font-semibold text-white">Board Health</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Real-time canvas element load metrics
            </p>

            <div className="mt-6 space-y-4">
              {analytics?.bySubject.map((s) => (
                <div key={s.subject} className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold capitalize text-white">
                    <span>{s.subject}</span>
                    <span className="text-indigo-400">avg {s.avgElements} elem</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (s.avgElements / 30) * 100)}%`,
                        backgroundColor:
                          s.subject === "math"
                            ? "#10B981"
                            : s.subject === "physics"
                            ? "#06B6D4"
                            : "#F59E0B",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/5 bg-gradient-to-r from-indigo-500/10 to-transparent p-3 text-[11px] text-[var(--text-secondary)]">
            Auto-saves trigger every 5 seconds on canvas strokes.
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Filter by board title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[#0B0F19] py-2 pl-10 pr-4 text-xs text-white placeholder-gray-500 transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[#0B0F19] px-3 py-1.5 text-xs text-[var(--text-secondary)]">
            <Filter className="h-3.5 w-3.5 text-indigo-400" />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none"
            >
              <option value="" className="bg-[#111827]">All Subjects</option>
              <option value="math" className="bg-[#111827]">Mathematics</option>
              <option value="physics" className="bg-[#111827]">Physics</option>
              <option value="chemistry" className="bg-[#111827]">Chemistry</option>
            </select>
          </div>
        </div>
      </div>

      {/* Boards Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border)] bg-white/[0.02] text-[var(--text-secondary)]">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Board Title</th>
                <th className="px-6 py-3.5 font-semibold">Subject</th>
                <th className="px-6 py-3.5 font-semibold">Canvas Objects</th>
                <th className="px-6 py-3.5 font-semibold">Educator</th>
                <th className="px-6 py-3.5 font-semibold">Last Updated</th>
                <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {boards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-[var(--text-secondary)]">
                    {loading ? "Loading boards…" : "No boards found matching criteria"}
                  </td>
                </tr>
              ) : (
                boards.map((b) => {
                  const subjectColor = {
                    math: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    physics: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                    chemistry: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                  }[b.subject] || "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";

                  return (
                    <tr key={b.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{b.title}</div>
                        <div className="font-mono text-[10px] text-[var(--text-muted)]">
                          ID: {b.id}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${subjectColor}`}
                        >
                          {b.subject}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-white">{b.elementCount}</span>{" "}
                        <span className="text-[var(--text-muted)]">strokes/nodes</span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{b.creator.name}</div>
                        <div className="text-[11px] text-[var(--text-secondary)]">
                          {b.creator.email}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-[var(--text-secondary)]">
                        {b.updatedAt ? new Date(b.updatedAt).toLocaleString() : "Recent"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <a
                          href={`http://localhost:4000/board/${b.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-indigo-400 transition-colors hover:bg-indigo-500/10"
                        >
                          <span>Open</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-6 py-3.5 text-xs text-[var(--text-secondary)]">
          <div>
            Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total boards)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchBoards(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1 transition-colors hover:bg-white/5 disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>
            <button
              onClick={() => fetchBoards(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1 transition-colors hover:bg-white/5 disabled:opacity-30"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
