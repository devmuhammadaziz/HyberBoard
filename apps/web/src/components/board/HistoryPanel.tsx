"use client";

import { useCallback, useEffect, useState } from "react";
import type { SessionHistoryEntry, Subject } from "@smart-desk/types";
import {
  Search,
  Pencil,
  Trash2,
  Check,
  X,
  Plus,
  Moon,
  Sun,
  LogOut,
  ArrowRight,
  Sparkles,
  User,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { t } from "@/lib/i18n";
import { useRouter, usePathname } from "next/navigation";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { HyperBoardLogo } from "@/components/HyperBoardLogo";
import { toggleThemeWithTransition } from "@/lib/theme";
import clsx from "clsx";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreateBoard: (subject?: Subject) => void;
  boardTitle?: string;
};

export function HistoryPanel({
  isOpen,
  onClose,
  onCreateBoard,
  boardTitle,
}: Props) {
  const { user, locale, theme, setTheme, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState("");
  const [items, setItems] = useState<SessionHistoryEntry[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | Subject>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SessionHistoryEntry | null>(null);
  const [avatarBroken, setAvatarBroken] = useState(false);

  const showPhoto = Boolean(user?.avatarUrl) && !avatarBroken;

  const load = useCallback(async () => {
    try {
      const data = await api<{ history: SessionHistoryEntry[] }>(
        `/boards/history/search?q=${encodeURIComponent(q)}`
      );
      setItems(data.history.filter((h) => h.status !== "deleted"));
    } catch {
      setItems([]);
    }
  }, [q]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      void load();
    }, 150);
    return () => clearTimeout(timer);
  }, [q, isOpen, load]);

  const startRename = (item: SessionHistoryEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(item.id);
    setDraftTitle(item.title);
  };

  const cancelRename = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(null);
    setDraftTitle("");
  };

  const saveRename = async (item: SessionHistoryEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const title = draftTitle.trim();
    if (!title || title === item.title) {
      cancelRename();
      return;
    }
    setBusyId(item.id);
    try {
      const data = await api<{ history: SessionHistoryEntry }>(
        `/boards/history/${item.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ title }),
        }
      );
      setItems((prev) =>
        prev.map((row) => (row.id === item.id ? data.history : row))
      );
      setEditingId(null);
      setDraftTitle("");
      if (pathname === `/board/${item.boardId}`) {
        window.location.reload();
      }
    } catch {
      // keep draft open on failure
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    const item = pendingDelete;
    if (!item) return;
    setBusyId(item.id);
    try {
      await api(`/boards/history/${item.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((row) => row.id !== item.id));
      setPendingDelete(null);
      if (pathname === `/board/${item.boardId}`) {
        router.push("/board");
      }
    } catch {
      // ignore
    } finally {
      setBusyId(null);
    }
  };

  // Filter items by subject
  const filteredItems = items.filter((item) => {
    if (activeFilter === "all") return true;
    return item.subject === activeFilter;
  });

  const allCount = items.length;
  const mathCount = items.filter((i) => i.subject === "math").length;
  const physicsCount = items.filter((i) => i.subject === "physics").length;
  const chemistryCount = items.filter((i) => i.subject === "chemistry").length;

  return (
    <>
      {/* Frosted Scrim Backdrop */}
      <div
        role="presentation"
        onClick={onClose}
        className={clsx(
          "fixed inset-0 z-[80] bg-black/60 backdrop-blur-md transition-opacity duration-200",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Floating Modern Studio Workspace Command Hub — Always Centered */}
      <div
        className={clsx(
          "fixed inset-0 z-[90] grid place-items-center p-4 sm:p-6 transition-all duration-200",
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div
          role="dialog"
          aria-label="Studio Workspace Hub"
          className="relative m-auto flex h-[34rem] max-h-[86vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-black/10 dark:border-white/10 bg-[var(--surface)]/95 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ═══════════════════════════════════════════════════════════════════
              LEFT NAVIGATION RAIL: Branding, New Board, Filters, Profile
             ═══════════════════════════════════════════════════════════════════ */}
          <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-black/5 bg-[var(--bg)]/50 p-5 dark:border-white/5">
            <div className="flex flex-col gap-5">
              {/* Branding Header */}
              <div className="flex items-center gap-3">
                <HyperBoardLogo size={30} withGlow />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                      HyperBoard
                    </span>
                    <span className="rounded-full bg-[var(--brand)]/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--brand)]">
                      Studio
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Workspace Hub
                  </p>
                </div>
              </div>

              {/* Primary Action: + New Blackboard */}
              <button
                type="button"
                onClick={() => onCreateBoard(activeFilter === "all" ? undefined : activeFilter)}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.98]"
              >
                <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                <span>{t(locale, "newBoard")}</span>
              </button>

              {/* Workspace Navigation / Subject Filters */}
              <div className="flex flex-col gap-1">
                <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Categories
                </div>

                {/* All Boards */}
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className={clsx(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition",
                    activeFilter === "all"
                      ? "bg-[var(--brand)] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>All Blackboards</span>
                  </div>
                  <span
                    className={clsx(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                      activeFilter === "all"
                        ? "bg-white/20 text-white"
                        : "bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]"
                    )}
                  >
                    {allCount}
                  </span>
                </button>

                {/* Math */}
                <button
                  type="button"
                  onClick={() => setActiveFilter("math")}
                  className={clsx(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition",
                    activeFilter === "math"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Mathematics</span>
                  </div>
                  <span
                    className={clsx(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                      activeFilter === "math"
                        ? "bg-white/20 text-white"
                        : "bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]"
                    )}
                  >
                    {mathCount}
                  </span>
                </button>

                {/* Physics */}
                <button
                  type="button"
                  onClick={() => setActiveFilter("physics")}
                  className={clsx(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition",
                    activeFilter === "physics"
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-500" />
                    <span>Physics</span>
                  </div>
                  <span
                    className={clsx(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                      activeFilter === "physics"
                        ? "bg-white/20 text-white"
                        : "bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]"
                    )}
                  >
                    {physicsCount}
                  </span>
                </button>

                {/* Chemistry */}
                <button
                  type="button"
                  onClick={() => setActiveFilter("chemistry")}
                  className={clsx(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition",
                    activeFilter === "chemistry"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Chemistry</span>
                  </div>
                  <span
                    className={clsx(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                      activeFilter === "chemistry"
                        ? "bg-white/20 text-white"
                        : "bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]"
                    )}
                  >
                    {chemistryCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Bottom Profile, Theme Toggle, & Logout */}
            <div className="flex flex-col gap-3 pt-4 border-t border-black/5 dark:border-white/5">
              {/* User Identity */}
              <div className="flex items-center gap-2.5">
                {showPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user!.avatarUrl!}
                    alt={user?.name || "User"}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-[var(--brand)]/30"
                    onError={() => setAvatarBroken(true)}
                  />
                ) : (
                  <div
                    className="grid h-8 w-8 place-items-center rounded-full bg-[var(--brand)] text-xs font-bold text-white shadow-sm"
                    title={user?.name || "User"}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
                    {user?.name || "Educator"}
                  </p>
                  <p className="truncate text-[10px] text-[var(--text-secondary)]">
                    {user?.email || "smartdesk@workspace"}
                  </p>
                </div>
              </div>

              {/* Theme & Logout Controls */}
              <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-[var(--surface)] p-1">
                <button
                  type="button"
                  onClick={(e) => {
                    void toggleThemeWithTransition(e, undefined, (newTheme) => {
                      void setTheme(newTheme);
                    });
                  }}
                  className="inline-flex h-7 items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg)] hover:text-[var(--text-primary)]"
                >
                  {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  <span>{theme === "dark" ? "Light" : "Dark"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className="inline-flex h-7 items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{t(locale, "logout")}</span>
                </button>
              </div>
            </div>
          </aside>

          {/* ═══════════════════════════════════════════════════════════════════
              RIGHT MAIN PANE: Search, Category Banner, Grid of Boards
             ═══════════════════════════════════════════════════════════════════ */}
          <main className="flex flex-1 flex-col p-6 min-w-0">
            {/* Top Search & Close Controls */}
            <div className="flex items-center gap-3 pb-4">
              <div className="flex flex-1 items-center gap-2.5 rounded-2xl bg-[var(--bg)]/80 px-3.5 py-2.5 text-xs text-[var(--text-primary)] transition focus-within:ring-2 focus-within:ring-[var(--brand)]/30">
                <Search className="h-4 w-4 text-[var(--text-secondary)] shrink-0" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search past blackboards by name, topic, or equations..."
                  className="w-full bg-transparent text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/70 outline-none"
                  autoFocus
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => setQ("")}
                    className="grid h-5 w-5 place-items-center rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Studio Hub"
                className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--bg)]/80 text-[var(--text-secondary)] transition hover:bg-[var(--bg)] hover:text-[var(--text-primary)] hover:scale-105 active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Sub-header */}
            <div className="flex items-center justify-between pb-3 pt-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  {activeFilter === "all" ? "All Blackboards" : `${activeFilter.toUpperCase()} SESSIONS`}
                </h2>
                <span className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                  {filteredItems.length} {filteredItems.length === 1 ? "session" : "sessions"}
                </span>
              </div>
              {boardTitle && (
                <span className="text-[11px] text-[var(--text-secondary)] truncate max-w-xs">
                  Active: <strong className="font-semibold text-[var(--text-primary)]">{boardTitle}</strong>
                </span>
              )}
            </div>

            {/* Grid / List of Board Cards */}
            <div
              className={clsx(
                "flex-1 overflow-y-auto p-1 min-h-0 content-start",
                filteredItems.length > 1
                  ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                  : "flex flex-col gap-4"
              )}
            >
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--text-secondary)]">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--bg)] text-[var(--text-secondary)]/50 mb-3">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">No blackboards found</p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]/70 max-w-xs">
                    {q ? `No sessions matching "${q}"` : "Create your first blackboard to start working"}
                  </p>
                  <button
                    type="button"
                    onClick={() => onCreateBoard(activeFilter === "all" ? undefined : activeFilter)}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand)] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t(locale, "newBoard")}</span>
                  </button>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isCurrent = pathname === `/board/${item.boardId}`;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onClose();
                        router.push(`/board/${item.boardId}`);
                      }}
                      className={clsx(
                        "group relative flex flex-col justify-between rounded-2xl p-5 transition-all duration-200 cursor-pointer min-h-[145px]",
                        isCurrent
                          ? "bg-gradient-to-br from-[var(--surface)] to-[color-mix(in_oklab,var(--brand)_10%,var(--surface))] border-2 border-[var(--brand)] shadow-lg shadow-indigo-500/10"
                          : "bg-[var(--bg)]/70 hover:bg-[var(--bg)] hover:shadow-md hover:scale-[1.01] border border-black/5 dark:border-white/5"
                      )}
                    >
                      {/* Card Top: Badges + Action buttons */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={clsx(
                              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                              item.subject === "math"
                                ? "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400"
                                : item.subject === "physics"
                                ? "bg-cyan-500/15 text-cyan-500 dark:text-cyan-400"
                                : "bg-amber-500/15 text-amber-500 dark:text-amber-400"
                            )}
                          >
                            <span
                              className={clsx(
                                "h-1.5 w-1.5 rounded-full",
                                item.subject === "math"
                                  ? "bg-emerald-500"
                                  : item.subject === "physics"
                                  ? "bg-cyan-500"
                                  : "bg-amber-500"
                              )}
                            />
                            {item.subject}
                          </span>

                          {isCurrent && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-500 dark:text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active Now
                            </span>
                          )}
                        </div>

                        {/* Card Actions: Rename & Delete */}
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            title="Rename session"
                            onClick={(e) => startRename(item, e)}
                            className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text-secondary)] opacity-60 transition hover:bg-[var(--surface)] hover:text-[var(--text-primary)] hover:opacity-100"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete session"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingDelete(item);
                            }}
                            className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text-secondary)] opacity-60 transition hover:bg-red-500/15 hover:text-red-400 hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Card Body: Title & Clean Object Count */}
                      <div className="my-3.5">
                        {editingId === item.id ? (
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              autoFocus
                              value={draftTitle}
                              onChange={(e) => setDraftTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") void saveRename(item);
                                if (e.key === "Escape") cancelRename();
                              }}
                              className="min-w-0 flex-1 rounded-xl bg-[var(--surface)] px-3 py-1.5 text-sm font-semibold text-[var(--text-primary)] outline-none ring-2 ring-[var(--brand)]"
                            />
                            <button
                              type="button"
                              disabled={busyId === item.id}
                              onClick={(e) => void saveRename(item, e)}
                              className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--brand)] text-white hover:opacity-90"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelRename}
                              className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface)]"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <h3 className="truncate text-base font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--brand)]">
                              {item.title}
                            </h3>
                            <p className="mt-1 text-xs text-[var(--text-secondary)]">
                              {item.elementCount !== undefined
                                ? `${item.elementCount} ${item.elementCount === 1 ? "drawing element" : "drawing elements"} · Autosaved`
                                : "Autosaved workspace"}
                            </p>
                          </>
                        )}
                      </div>

                      {/* Card Footer: Timestamp & Open Link */}
                      <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-3 text-xs text-[var(--text-secondary)] dark:border-white/10">
                        <span className="font-medium">
                          {item.updatedAt
                            ? new Date(item.updatedAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Recent session"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--brand)]">
                          <span>Open</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Keyboard Shortcut Hints */}
            <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3 mt-3 text-[11px] text-[var(--text-secondary)]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-[var(--bg)] px-1.5 py-0.5 text-[10px] font-mono">ESC</kbd>
                  <span>to close</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-[var(--bg)] px-1.5 py-0.5 text-[10px] font-mono">⌘N</kbd>
                  <span>new board</span>
                </span>
              </div>
              <span className="text-[10px] opacity-70">
                Click any blackboard card to switch workspace
              </span>
            </div>
          </main>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!pendingDelete}
        title="Delete this blackboard?"
        message={`“${pendingDelete?.title || ""}” will be removed permanently from your workspace.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
