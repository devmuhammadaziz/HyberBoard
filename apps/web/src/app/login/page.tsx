"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

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
    <main className="relative min-h-screen overflow-hidden bg-[#070B14] text-[#F4F7FB]">
      <div className="landing-atmosphere opacity-70" aria-hidden />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <Link href="/" className="mb-10 text-sm text-[#94A3B8] transition hover:text-white">
          ← Back to HyperBoard
        </Link>

        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
          Sign in
        </h1>
        <p className="mt-3 text-[#94A3B8]">
          Use your Google account to open your STEM classroom desk.
        </p>

        <a
          href="/api/auth/google"
          className="mt-10 inline-flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white px-5 py-3.5 text-sm font-semibold text-[#0F172A] transition hover:bg-[#F8FAFC]"
        >
          <GoogleMark />
          Continue with Google
        </a>

        {error && (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {decodeURIComponent(error)}
          </p>
        )}
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
        <main className="grid min-h-screen place-items-center bg-[#070B14] text-[#94A3B8]">
          Loading…
        </main>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
