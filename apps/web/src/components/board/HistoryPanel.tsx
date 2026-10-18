"use client";

import { useCallback, useEffect, useState } from "react";
import type { SessionHistoryEntry } from "@smart-desk/types";
import { Search, History, Pencil, Trash2, Check, X } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { t } from "@/lib/i18n";
import { useRouter, usePathname } from "next/navigation";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import clsx from "clsx";

type Props = {
  /** `sidebar` = list only (used inside BoardShell). `dropdown` keeps the old button menu. */
  variant?: "sidebar" | "dropdown";
  active?: boolean;
  onNavigate?: () => void;
};

export function HistoryPanel({
  variant = "dropdown",
  active,
  onNavigate,
}: Props) {
  const { locale } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<SessionHistoryEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SessionHistoryEntry | null>(null);

  const isSidebar = variant === "sidebar";
  const shouldLoad = isSidebar ? active !== false : open;

  const load = useCallback(async () => {
    const data = await api<{ history: SessionHistoryEntry[] }>(
      `/boards/history/search?q=${encodeURIComponent(q)}`
    );
    setItems(data.history.filter((h) => h.status !== "deleted"));
  }, [q]);

  useEffect(() => {
    if (!shouldLoad) return;
    const timer = setTimeout(() => {
      void load().catch(() => setItems([]));
    }, 200);
    return () => clearTimeout(timer);
  }, [q, shouldLoad, load]);

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

  const list = (
    <div className={clsx("flex flex-col", isSidebar ? "h-full min-h-0" : "")}>
      <div
        className={clsx(
          "mb-2 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-2",
          isSidebar && "shrink-0"
        )}
      >
        <Search className="h-4 w-4 text-[var(--text-secondary)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t(locale, "searchHistory")}
          className="w-full bg-transparent py-2 text-sm outline-none"
        />
      </div>
      <div
        className={clsx(
          "space-y-1 overflow-y-auto",
          isSidebar ? "min-h-0 flex-1" : "max-h-80"
        )}
      >
        {items.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-[var(--text-secondary)]">
            No sessions yet
          </p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="group rounded-xl px-2 py-2 hover:bg-[var(--bg)]"
          >
            {editingId === item.id ? (
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <input
                  autoFocus
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void saveRename(item);
                    if (e.key === "Escape") cancelRename();
                  }}
                  className="min-w-0 flex-1 rounded-lg border border-[var(--brand)] bg-[var(--surface)] px-2 py-1 text-sm outline-none"
                />
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={(e) => void saveRename(item, e)}
                  className="rounded-lg p-1.5 text-[var(--brand)] hover:bg-[color-mix(in_oklab,var(--brand)_12%,transparent)]"
                  title="Save"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={cancelRename}
                  className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface)]"
                  title="Cancel"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                    router.push(`/board/${item.boardId}`);
                  }}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="truncate text-sm font-medium text-[var(--text-primary)]">
                    {item.title}
                  </div>
                  <div className="truncate text-xs text-[var(--text-secondary)]">
                    {item.summary}
                  </div>
                </button>
                <div className="flex shrink-0 items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                  <button
                    type="button"
                    title="Rename"
                    disabled={busyId === item.id}
                    onClick={(e) => startRename(item, e)}
                    className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    disabled={busyId === item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDelete(item);
                    }}
                    className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={clsx(isSidebar ? "flex h-full min-h-0 flex-col" : "relative z-[80]")}>
      {!isSidebar && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
        >
          <History className="h-4 w-4" />
          {t(locale, "history")}
        </button>
      )}

      {isSidebar ? (
        list
      ) : (
        open && (
          <div className="absolute right-0 z-[90] mt-2 w-[22rem] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow)]">
            {list}
          </div>
        )
      )}

      <ConfirmModal
        open={!!pendingDelete}
        title="Delete this session?"
        message={`“${pendingDelete?.title || ""}” will be removed from History.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
