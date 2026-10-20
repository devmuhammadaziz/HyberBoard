"use client";

import { useEffect, useState } from "react";
import {
  Moon,
  Sun,
  LogOut,
  Plus,
  User,
  Menu,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { t } from "@/lib/i18n";
import { HistoryPanel } from "./HistoryPanel";
import { api } from "@/lib/api";
import { formatSessionTitle } from "@/lib/session-title";
import type { BoardDocument } from "@smart-desk/types";
import clsx from "clsx";
import { toggleThemeWithTransition } from "@/lib/theme";

export function BoardShell({
  children,
  boardTitle,
  loading,
}: {
  children: React.ReactNode;
  boardTitle?: string;
  loading?: boolean;
}) {
  const { user, locale, theme, setTheme, logout } = useAuth();
  const router = useRouter();
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const showPhoto = Boolean(user?.avatarUrl) && !avatarBroken;

  const createBoard = async () => {
    const data = await api<{ board: BoardDocument }>("/boards", {
      method: "POST",
      body: JSON.stringify({
        title: formatSessionTitle(),
        subject: user?.subjects?.[0] || "math",
      }),
    });
    setSidebarOpen(false);
    router.push(`/board/${data.board.id}`);
  };

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  return (
    <div className="relative h-screen overflow-hidden bg-[var(--bg)]">
      <div className={`absolute inset-0 ${loading ? "opacity-70" : ""}`}>
        {children}
      </div>

      {/* Floating hamburger — canvas stays full-bleed */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
        className={clsx(
          "absolute left-4 top-4 z-[70] grid h-11 w-11 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 text-[var(--text-primary)] shadow-[var(--shadow)] backdrop-blur-xl transition hover:bg-[var(--surface)]",
          sidebarOpen && "pointer-events-none opacity-0"
        )}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Scrim */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setSidebarOpen(false)}
        className={clsx(
          "absolute inset-0 z-[80] bg-black/45 transition-opacity",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* Sidebar */}
      <aside
        className={clsx(
          "absolute left-0 top-0 z-[90] flex h-full w-[min(20.5rem,88vw)] flex-col border-r border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] transition-transform duration-300 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-4">
          <div className="min-w-0">
            <div className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
              {t(locale, "brand")}
            </div>
            {boardTitle && (
              <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
                {boardTitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2 border-b border-[var(--border)] px-3 py-3">
          <button
            type="button"
            onClick={() => void createBoard()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-3 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {t(locale, "newBoard")}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={(e) => {
                void toggleThemeWithTransition(e, undefined, (newTheme) => {
                  void setTheme(newTheme);
                });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg)] transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg)]"
            >
              <LogOut className="h-4 w-4" />
              {t(locale, "logout")}
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden px-3 py-3">
          <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            {t(locale, "history")}
          </p>
          <HistoryPanel
            variant="sidebar"
            active={sidebarOpen}
            onNavigate={() => setSidebarOpen(false)}
          />
        </div>

        <div className="mt-auto flex items-center gap-3 border-t border-[var(--border)] px-4 py-3">
          {showPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user!.avatarUrl!}
              alt={user?.name || "User"}
              className="h-9 w-9 rounded-full border border-[var(--border)] object-cover"
              onError={() => setAvatarBroken(true)}
            />
          ) : (
            <div
              className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)]"
              title={user?.name || "User"}
            >
              <User className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
              {user?.name || "Signed in"}
            </p>
            <p className="truncate text-xs text-[var(--text-secondary)]">
              {user?.email || ""}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
