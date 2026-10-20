"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft } from "lucide-react";
import { HyperBoardLogo } from "@/components/HyperBoardLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

function LoginInner() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const error = params.get("error");

  useEffect(() => {
    if (loading || !user) return;
    router.replace(user.onboarded ? "/board" : "/onboarding");
  }, [user, loading, router]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--bg)] px-6 text-[var(--text-primary)] selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* ══ Ambient Ethereal Glow — Soft & Deep, No Hard Outlines ══ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-transparent blur-[140px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      {/* Top navigation & Theme Toggle */}
      <div className="absolute inset-x-8 top-8 z-20 flex items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>HyperBoard</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* ══ Centered Minimalist Content (Zero borders, pure focus) ══ */}
      <div className="relative z-10 w-full max-w-sm text-center">
        {/* Custom HyperBoard Brand Mark */}
        <div className="mx-auto mb-8 flex justify-center">
          <HyperBoardLogo size={48} withGlow />
        </div>

        {/* Minimal Typography */}
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Open your interactive STEM blackboard
        </p>

        {/* Error notification */}
        {error && (
          <div className="mt-6 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-300">
            {decodeURIComponent(error)}
          </div>
        )}

        {/* Google Authentication Button — Clean, Tactile, Modern */}
        <div className="mt-10">
          <a
            href="/api/auth/google"
            className="group relative flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-zinc-900 shadow-xl shadow-black/40 transition-all duration-200 hover:bg-zinc-100 hover:scale-[1.01] active:scale-[0.99]"
          >
            <GoogleMark />
            <span>Continue with Google</span>
          </a>
        </div>

        {/* Micro-copy footer */}
        <p className="mt-6 text-xs text-zinc-500">
          Free for educators & students · No password needed
        </p>
      </div>

      {/* Bottom Subtle Brand Mark */}
      <div className="absolute bottom-8 text-center text-[11px] text-zinc-600">
        HyperBoard Studio · AI for STEM
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.1 4 9.2 8.5 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.1 39.4 16 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.6 5.6-6.5 7.1l.1.1 6.2 5.2C36.9 39 44 34 44 24c0-1.3-.1-2.5-.4-3.5z"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[#06080F] text-zinc-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </main>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
