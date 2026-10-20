import React from "react";
import { type LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant?: "indigo" | "emerald" | "cyan" | "amber" | "rose";
  };
  accentColor?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  accentColor = "#4F46E5",
}: MetricCardProps) {
  const badgeClasses = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  }[badge?.variant || "indigo"];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl transition-all duration-200 hover:border-white/15 hover:shadow-2xl">
      {/* Subtle top accent gradient */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-15 blur-2xl transition-opacity group-hover:opacity-25"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-secondary)]">{title}</span>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5"
          style={{ color: accentColor }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <div className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          {value}
        </div>
        {badge && (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClasses}`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-[var(--text-secondary)]">{subtitle}</p>
      )}
    </div>
  );
}
