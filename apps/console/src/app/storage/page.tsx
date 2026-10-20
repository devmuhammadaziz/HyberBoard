"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/charts/MetricCard";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { adminFetch } from "@/lib/api";
import {
  HardDrive,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  Layers,
  Database,
  CheckCircle2,
  AlertTriangle,
  Server,
  Cloud,
} from "lucide-react";

interface SnapshotItem {
  key: string;
  size: number;
  formattedSize: string;
  lastModified: string | null;
  storageClass: string;
}

interface StorageApiResponse {
  ok: boolean;
  r2: {
    status: "connected" | "not_configured" | "error";
    configured: boolean;
    bucket: string;
    endpoint: string;
    totalObjects: number;
    totalBytes: number;
    formattedSize: string;
    avgObjectSize: string;
    recentSnapshots: SnapshotItem[];
    estimatedWrites: number;
    estimatedReads: number;
    dbSnapshotsCount: number;
    storageTrend: Array<{
      date: string;
      mb: number;
      writes: number;
      reads: number;
    }>;
    error: string | null;
  };
}

export default function StoragePage() {
  const [data, setData] = useState<StorageApiResponse["r2"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStorageStats = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await adminFetch<StorageApiResponse>("/admin/storage/r2");
      setData(res.r2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load storage telemetry");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchStorageStats();
  }, [fetchStorageStats]);

  const isConnected = data?.status === "connected";

  return (
    <DashboardLayout
      title="Cloudflare R2 Storage & Snapshots"
      description="Inspect S3-compatible snapshot bucket footprint, active objects, and read/write I/O telemetry"
      onRefresh={fetchStorageStats}
      refreshing={refreshing}
    >
      {/* Error or Alert Banner */}
      {data?.error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">R2 S3 Client Diagnostics</div>
            <div className="mt-1 leading-relaxed">{data.error}</div>
          </div>
        </div>
      )}

      {/* Cloudflare R2 Connection Status Card */}
      <div className="mb-8 overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-r from-[#111827] via-[#111827] to-[#151d30] p-6 shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Cloud className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Cloudflare R2 Object Storage
                </h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    isConnected
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    }`}
                  />
                  {isConnected ? "Healthy & Connected" : "Connecting"}
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-[var(--text-secondary)]">
                Bucket: <span className="text-white font-semibold">{data?.bucket || "planx-projects"}</span>{" "}
                • Endpoint: {data?.endpoint || "r2.cloudflarestorage.com"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-[var(--text-secondary)]">
              <span className="text-[var(--text-muted)]">Egress Fees:</span>{" "}
              <span className="font-semibold text-emerald-400">$0.00 (Zero Egress)</span>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-[var(--text-secondary)]">
              <span className="text-[var(--text-muted)]">Storage Class:</span>{" "}
              <span className="font-semibold text-white">STANDARD</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Storage Size"
          value={data ? data.formattedSize : "0 B"}
          subtitle={`Avg ${data?.avgObjectSize || "0 B"} per snapshot`}
          icon={HardDrive}
          accentColor="#F59E0B"
          badge={{ text: "Footprint", variant: "amber" }}
        />

        <MetricCard
          title="Objects & Snapshots"
          value={data ? data.totalObjects : 0}
          subtitle={`${data?.dbSnapshotsCount || 0} linked board revisions`}
          icon={Database}
          accentColor="#4F46E5"
          badge={{ text: "Stored", variant: "indigo" }}
        />

        <MetricCard
          title="Write Operations"
          value={data ? data.estimatedWrites : 0}
          subtitle="Board saves & revision pushes"
          icon={ArrowUpFromLine}
          accentColor="#10B981"
          badge={{ text: "PUT / Upload", variant: "emerald" }}
        />

        <MetricCard
          title="Read Operations"
          value={data ? data.estimatedReads : 0}
          subtitle="Snapshot restores & history loads"
          icon={ArrowDownToLine}
          accentColor="#06B6D4"
          badge={{ text: "GET / Fetch", variant: "cyan" }}
        />
      </div>

      {/* Charts Section */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Line Chart: Storage Growth */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">
                Cumulative Storage Growth (7 Days)
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Total Megabytes (MB) of serialized board data in R2
              </p>
            </div>
            <span className="rounded-lg bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-400 border border-amber-500/20">
              MB Stored
            </span>
          </div>

          {data?.storageTrend && (
            <LineChart
              categories={data.storageTrend.map((t) => t.date)}
              series={[
                {
                  name: "Storage Size (MB)",
                  color: "#F59E0B",
                  data: data.storageTrend.map((t) => t.mb),
                },
              ]}
              height={230}
              valueFormatter={(v) => `${v.toFixed(1)} MB`}
            />
          )}
        </div>

        {/* Bar Chart: Reads vs Writes Activity */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">
                Daily I/O Operations (7 Days)
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Comparison of daily PutObject writes and GetObject reads
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Writes
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Reads
              </span>
            </div>
          </div>

          {data?.storageTrend && (
            <BarChart
              data={data.storageTrend.map((t) => ({
                label: t.date,
                value: t.writes + t.reads,
                color: "#4F46E5",
                secondaryLabel: `${t.writes}w • ${t.reads}r`,
              }))}
              height={230}
            />
          )}
        </div>
      </div>

      {/* Recent Snapshots Table */}
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Stored R2 Snapshot Objects</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Latest blackboard vectors and serialized snapshots saved to R2
            </p>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            Showing top {data?.recentSnapshots.length || 0} objects
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border)] bg-white/[0.02] text-[var(--text-secondary)]">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Object Key</th>
                <th className="px-6 py-3.5 font-semibold">Size</th>
                <th className="px-6 py-3.5 font-semibold">Class</th>
                <th className="px-6 py-3.5 font-semibold">Last Modified</th>
                <th className="px-6 py-3.5 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {!data?.recentSnapshots?.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-[var(--text-secondary)]">
                    {loading ? "Inspecting R2 bucket…" : "No snapshot files found in bucket"}
                  </td>
                </tr>
              ) : (
                data.recentSnapshots.map((item) => (
                  <tr key={item.key} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-mono text-[11px] text-white">
                      {item.key}
                    </td>

                    <td className="px-6 py-4 font-semibold text-amber-400">
                      {item.formattedSize}
                    </td>

                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px]">
                        {item.storageClass}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {item.lastModified ? new Date(item.lastModified).toLocaleString() : "—"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Available</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
