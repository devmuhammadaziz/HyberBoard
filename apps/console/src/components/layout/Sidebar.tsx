"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Layers,
  HardDrive,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAdminAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  {
    name: "Overview",
    href: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Users Directory",
    href: "/users",
    icon: Users,
    badge: null,
  },
  {
    name: "Boards Analytics",
    href: "/boards",
    icon: Layers,
    badge: null,
  },
  {
    name: "Cloudflare R2",
    href: "/storage",
    icon: HardDrive,
    badge: "Live",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[var(--border)] bg-[#0c101a]/95 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white">
                HyperBoard
              </span>
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-400">
                Ops
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API Connected
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 space-y-1.5 px-3 py-6">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
          Management
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive
                      ? "text-indigo-400"
                      : "text-[var(--text-muted)] group-hover:text-white"
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Quick Ops Info Banner */}
      <div className="mx-3 mb-4 rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-3.5 text-xs">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold">
          <ShieldCheck className="h-4 w-4" />
          <span>Security Hardened</span>
        </div>
        <p className="mt-1 text-[11px] text-[var(--text-secondary)] leading-relaxed">
          Rate limit active • Timing-safe auth • HttpOnly sessions
        </p>
      </div>

      {/* User Footer & Logout */}
      <div className="border-t border-[var(--border)] p-3">
        <div className="flex items-center justify-between rounded-xl bg-white/5 p-2.5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs border border-indigo-500/30">
              {user?.username?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="truncate">
              <div className="truncate text-xs font-semibold text-white">
                {user?.username || "Admin"}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium">
                {user?.role === "admin" ? "Super Admin" : "Operator"}
              </div>
            </div>
          </div>

          <button
            onClick={() => void logout()}
            title="Log out"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-rose-500/15 hover:text-rose-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
