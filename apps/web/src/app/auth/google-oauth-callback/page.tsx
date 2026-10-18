"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("token");
    const next = params.get("next") || "/board";
    if (!token) {
      setError("Missing session token");
      return;
    }

    setToken(token);
    void refreshUser()
      .then(() => router.replace(next))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Session failed");
      });
  }, [params, refreshUser, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] px-6 text-center">
      {error ? (
        <div>
          <p className="text-red-400">{error}</p>
          <a href="/login" className="mt-4 inline-block text-[var(--brand)]">
            Back to login
          </a>
        </div>
      ) : (
        <p className="text-[var(--text-secondary)]">Finishing Google sign-in…</p>
      )}
    </main>
  );
}

export default function GoogleOAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center text-[var(--text-secondary)]">
          Finishing Google sign-in…
        </main>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
