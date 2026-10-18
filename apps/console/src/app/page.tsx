"use client";

import { useEffect, useState } from "react";

type Stats = {
  users: number;
  boards: number;
  sessions: number;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    onboarded: boolean;
    subjects: string[];
    createdAt?: string;
  }>;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const ADMIN_KEY =
  process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || "hyperboard-admin-dev-key";

export default function ConsolePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch(`${API}/admin/stats`, {
      headers: { "x-admin-key": ADMIN_KEY },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setStats(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error"));
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">HyperBoard Console</h1>
      <p className="mt-2 text-[var(--text-secondary)]">
        Lightweight ops view for users, boards, and sessions.
      </p>

      {error && <p className="mt-6 text-red-400">{error}</p>}

      {stats && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Users", stats.users],
              ["Boards", stats.boards],
              ["Sessions", stats.sessions],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <div className="text-sm text-[var(--text-secondary)]">{label}</div>
                <div className="mt-2 text-3xl font-semibold">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-5 py-3 text-sm text-[var(--text-secondary)]">
              Recent users
            </div>
            <div className="divide-y divide-[var(--border)]">
              {stats.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <div>{u.name}</div>
                    <div className="text-[var(--text-secondary)]">{u.email}</div>
                  </div>
                  <div className="text-right text-[var(--text-secondary)]">
                    <div>{u.onboarded ? "Onboarded" : "Pending"}</div>
                    <div>{(u.subjects || []).join(", ") || "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
