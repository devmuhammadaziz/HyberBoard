"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    router.replace(user.onboarded ? "/board" : "/onboarding");
  }, [user, loading, router]);

  return (
    <div className="landing-root min-h-screen overflow-x-hidden bg-[#070B14] text-[#F4F7FB]">
      {/* Hero — one composition */}
      <section className="relative min-h-screen">
        <div className="landing-atmosphere" aria-hidden />
        <div className="landing-chalk-grid" aria-hidden />

        <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
          <div className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
            HyperBoard<span className="text-[#818CF8]"> Studio</span>
          </div>
          <Link
            href="/login"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/35 hover:text-white"
          >
            Sign in
          </Link>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center px-6 pb-20 pt-8 sm:px-10">
          <p className="landing-rise mb-5 text-xs uppercase tracking-[0.35em] text-[#94A3B8]">
            For STEM classrooms
          </p>
          <h1 className="landing-rise landing-rise-delay-1 max-w-4xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
            HyperBoard
            <span className="block text-[#A5B4FC]">Studio</span>
          </h1>
          <p className="landing-rise landing-rise-delay-2 mt-6 max-w-lg text-lg text-[#94A3B8] sm:text-xl">
            The AI blackboard that turns math, physics, and chemistry into living lessons.
          </p>
          <div className="landing-rise landing-rise-delay-3 mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[#4F46E5] px-7 py-3.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Open the desk
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#subjects"
              className="text-sm text-[#94A3B8] underline-offset-4 transition hover:text-white hover:underline"
            >
              See subjects
            </a>
          </div>
        </div>

        <div className="landing-orbit pointer-events-none absolute inset-x-0 bottom-0 h-[42vh]" aria-hidden>
          <div className="landing-board-plane" />
        </div>
      </section>

      <section id="subjects" className="relative border-t border-white/10 px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
            One board. Three sciences.
          </h2>
          <p className="mt-3 max-w-xl text-[#94A3B8]">
            Contextual AI tools appear only when you need them — never a wall of buttons.
          </p>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              { name: "Mathematics", accent: "#10B981", line: "LaTeX, proofs, graphs, and step solvers." },
              { name: "Physics", accent: "#06B6D4", line: "Forces, trajectories, circuits, and fields." },
              { name: "Chemistry", accent: "#F59E0B", line: "Equations, molecules, yields, and titration." },
            ].map((item) => (
              <div key={item.name} className="border-l-2 pl-5" style={{ borderColor: item.accent }}>
                <h3 className="text-xl font-medium" style={{ color: item.accent }}>
                  {item.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">{item.line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-28 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#111827] to-[#0B0F19] px-8 py-12 sm:flex-row sm:items-center sm:px-12">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
              Ready for your next lecture?
            </h2>
            <p className="mt-2 text-[#94A3B8]">Sign in with Google and land straight on your board.</p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#0B0F19] transition hover:bg-[#E2E8F0]"
          >
            Go to login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
