"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/charts/MetricCard";
import { adminFetch } from "@/lib/api";
import {
  Users,
  UserCheck,
  Clock,
  Search,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  onboarded: boolean;
  subjects: Array<"math" | "physics" | "chemistry">;
  institution: string;
  role: string;
  locale: string;
  theme: string;
  boardsCount: number;
  createdAt?: string;
}

interface UsersApiResponse {
  users: UserItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = useCallback(async (pageToLoad = 1) => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams({
        page: String(pageToLoad),
        limit: "15",
      });
      if (search.trim()) params.set("search", search.trim());
      if (subjectFilter) params.set("subject", subjectFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await adminFetch<UsersApiResponse>(`/admin/users?${params.toString()}`);
      setUsers(res.users);
      setPagination(res.pagination);
    } catch {
      // Error handling
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, subjectFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchUsers(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const totalUsers = pagination.total;
  const onboardedCount = users.filter((u) => u.onboarded).length;
  const totalBoardsInView = users.reduce((acc, u) => acc + u.boardsCount, 0);

  return (
    <DashboardLayout
      title="Users Directory"
      description="Manage registered STEM educators, onboarded teachers, and user institutions"
      onRefresh={() => fetchUsers(pagination.page)}
      refreshing={refreshing}
    >
      {/* Top Metric Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Registered"
          value={totalUsers}
          subtitle="System educators"
          icon={Users}
          accentColor="#4F46E5"
        />
        <MetricCard
          title="Onboarded"
          value={onboardedCount}
          subtitle="Profile setup finished"
          icon={UserCheck}
          accentColor="#10B981"
          badge={{ text: "Ready", variant: "emerald" }}
        />
        <MetricCard
          title="Pending"
          value={users.length - onboardedCount}
          subtitle="Awaiting subject setup"
          icon={Clock}
          accentColor="#F59E0B"
          badge={{ text: "Incomplete", variant: "amber" }}
        />
        <MetricCard
          title="Boards In View"
          value={totalBoardsInView}
          subtitle="Interactive desks owned"
          icon={Layers}
          accentColor="#06B6D4"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by teacher name or email address…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[#0B0F19] py-2 pl-10 pr-4 text-xs text-white placeholder-gray-500 transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[#0B0F19] px-3 py-1.5 text-xs text-[var(--text-secondary)]">
              <Filter className="h-3.5 w-3.5 text-indigo-400" />
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="bg-transparent text-white focus:outline-none"
              >
                <option value="" className="bg-[#111827]">All Disciplines</option>
                <option value="math" className="bg-[#111827]">Mathematics</option>
                <option value="physics" className="bg-[#111827]">Physics</option>
                <option value="chemistry" className="bg-[#111827]">Chemistry</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[#0B0F19] px-3 py-1.5 text-xs text-[var(--text-secondary)]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-white focus:outline-none"
              >
                <option value="" className="bg-[#111827]">All Statuses</option>
                <option value="onboarded" className="bg-[#111827]">Onboarded</option>
                <option value="pending" className="bg-[#111827]">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border)] bg-white/[0.02] text-[var(--text-secondary)]">
              <tr>
                <th className="px-6 py-3.5 font-semibold">User</th>
                <th className="px-6 py-3.5 font-semibold">Role & Institution</th>
                <th className="px-6 py-3.5 font-semibold">Subjects</th>
                <th className="px-6 py-3.5 font-semibold">Boards</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-[var(--text-secondary)]">
                    {loading ? "Loading users…" : "No users matched the criteria"}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 font-bold text-xs border border-indigo-500/20">
                          {u.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-[11px] text-[var(--text-secondary)]">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-white capitalize">
                        <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
                        <span>{u.role || "teacher"}</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {u.institution || "Independent"}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {u.subjects?.length ? (
                          u.subjects.map((sub) => {
                            const badgeStyle = {
                              math: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                              physics: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                              chemistry: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                            }[sub] || "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
                            return (
                              <span
                                key={sub}
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${badgeStyle}`}
                              >
                                {sub}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-white">
                      {u.boardsCount}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                          u.onboarded
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {u.onboarded ? "Onboarded" : "Pending"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-6 py-3.5 text-xs text-[var(--text-secondary)]">
          <div>
            Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total users)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchUsers(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1 transition-colors hover:bg-white/5 disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>
            <button
              onClick={() => fetchUsers(pagination.page + 1)}
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
