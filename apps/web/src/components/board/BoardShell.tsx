"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { HistoryPanel } from "./HistoryPanel";
import { api } from "@/lib/api";
import { formatSessionTitle } from "@/lib/session-title";
import type { BoardDocument, Subject } from "@smart-desk/types";
import clsx from "clsx";

export function BoardShell({
  children,
  boardTitle,
  loading,
}: {
  children: React.ReactNode;
  boardTitle?: string;
  loading?: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const createBoard = async (selectedSubject?: Subject) => {
    const data = await api<{ board: BoardDocument }>("/boards", {
      method: "POST",
      body: JSON.stringify({
        title: formatSessionTitle(),
        subject: selectedSubject || user?.subjects?.[0] || "math",
      }),
    });
    setSidebarOpen(false);
    router.push(`/board/${data.board.id}`);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Toggle Studio Hub with Cmd+K or Cmd+O
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "o")) {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
      // Create new board with Cmd+N when Hub is open
      if (sidebarOpen && (e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        void createBoard();
      }
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

      {/* Floating hamburger button — top-left, clean and borderless, NO logo */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        title="Menu (⌘K)"
        aria-label="Open menu"
        className={clsx(
          "absolute left-4 top-4 z-[70] grid h-11 w-11 place-items-center rounded-2xl bg-[var(--surface)]/90 text-[var(--text-primary)] shadow-lg shadow-black/10 backdrop-blur-2xl transition hover:bg-[var(--surface)] active:scale-95",
          sidebarOpen && "pointer-events-none opacity-0"
        )}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Next-Gen Studio Workspace Command Hub */}
      <HistoryPanel
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCreateBoard={(subject) => void createBoard(subject)}
        boardTitle={boardTitle}
      />
    </div>
  );
}
