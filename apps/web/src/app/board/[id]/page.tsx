"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { BoardDocument } from "@smart-desk/types";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { BoardCanvas } from "@/components/board/BoardCanvas";
import { BoardShell } from "@/components/board/BoardShell";

export default function BoardPage() {
  const params = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [board, setBoard] = useState<BoardDocument | null>(null);
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

    void api<{ board: BoardDocument }>(`/boards/${params.id}`)
      .then((data) => setBoard(data.board))
      .catch((err) => setError(err instanceof Error ? err.message : "Not found"));
  }, [params.id, user, loading, router]);

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center text-red-400">{error}</main>
    );
  }

  if (!board) {
    return (
      <BoardShell loading>
        <div className="grid h-full place-items-center text-[var(--text-secondary)]">
          Loading board…
        </div>
      </BoardShell>
    );
  }

  return (
    <BoardShell boardTitle={board.title}>
      <BoardCanvas board={board} onBoardChange={setBoard} />
    </BoardShell>
  );
}
