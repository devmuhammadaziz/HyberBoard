"use client";

import React from "react";
import { ExternalLink, RefreshCw } from "lucide-react";

interface HeaderProps {
  title: string;
  description?: string;
  onRefresh?: () => void;
  loading?: boolean;
}

export function Header({
  title,
  description,
  onRefresh,
  loading = false,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[#0B0F19]/80 px-8 backdrop-blur-xl">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-white">{title}</h1>
        {description && (
          <p className="text-xs text-[var(--text-secondary)]">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-all hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`}
            />
            <span>Refresh</span>
          </button>
        )}

        <a
          href="http://localhost:4000"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500"
        >
          <span>Open Web App</span>
          <ExternalLink className="h-3.5 w-3.5 opacity-80" />
        </a>
      </div>
    </header>
  );
}
