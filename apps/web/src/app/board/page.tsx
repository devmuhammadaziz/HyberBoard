"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BoardDocument } from "@smart-desk/types";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { BoardShell } from "@/components/board/BoardShell";
import { formatSessionTitle } from "@/lib/session-title";

export default function BoardIndexPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (!user.onboarded) {
      router.replace("/onboarding");
      return;
    }

    void (async () => {
      try {
        const list = await api<{ boards: BoardDocument[] }>("/boards");
        if (list.boards[0]) {
          router.replace(`/board/${list.boards[0].id}`);
          return;
        }
        const created = await api<{ board: BoardDocument }>("/boards", {
          method: "POST",
          body: JSON.stringify({
            title: formatSessionTitle(),
            subject: user.subjects?.[0] || "math",
          }),
        });
        router.replace(`/board/${created.board.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to open board");
      }
    })();
  }, [user, loading, router]);

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center text-red-400">{error}</main>
    );
  }

  return (
    <BoardShell loading>
      <div className="grid h-full place-items-center text-[var(--text-secondary)]">
        Opening board…
      </div>
    </BoardShell>
  );
}
