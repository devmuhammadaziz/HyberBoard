"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  Zap,
  FlaskConical,
  Sigma,
  Layers,
  PenTool,
  Globe,
  Share2,
  Compass,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { HyperBoardLogo } from "@/components/HyperBoardLogo";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const [activeDemo, setActiveDemo] = useState<"math" | "physics" | "chemistry">("math");

  useEffect(() => {
    if (loading || !user) return;
    router.replace(user.onboarded ? "/board" : "/onboarding");
  }, [user, loading, router]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-root min-h-screen overflow-x-hidden bg-[#05070E] text-[#F4F7FB] selection:bg-indigo-500 selection:text-white">
      {/* ═════════ Minimalist Glass Header (No harsh borders) ═════════ */}
      <header
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        style={{
          background: scrollY > 30 ? "rgba(5, 7, 14, 0.85)" : "transparent",
          backdropFilter: scrollY > 30 ? "blur(24px)" : "none",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10">
          <Link href="/" className="flex items-center gap-3">
            <HyperBoardLogo size={26} />
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-white">
              HyperBoard
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#disciplines" className="transition hover:text-white">Disciplines</a>
            <a href="#demo" className="transition hover:text-white">Classroom Demo</a>
            <a href="#workflow" className="transition hover:text-white">Workflow</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-400 transition hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Start Free
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* ═════════ HERO SECTION (Borderless, breathable, immersive) ═════════ */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
        {/* Soft atmospheric gradient glow (no grid, no boxed borders) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute left-1/2 top-1/4 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/15 blur-[160px]" />
          <div className="absolute right-1/4 top-1/2 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[140px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 text-center sm:px-10">
          {/* Subtle pill tag */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>AI Blackboard for STEM Educators</span>
          </div>

          {/* Main Title */}
          <h1 className="mt-8 font-[family-name:var(--font-display)] text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
            The blackboard that
            <br />
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
              thinks with you.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            Handwrite formulas, sketch vectors, and balance chemical reactions.
            Intelligent STEM tools that appear naturally as you teach.
          </p>

          {/* Actions */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-zinc-950 shadow-2xl transition hover:bg-zinc-200 hover:scale-[1.01]"
            >
              <span>Open Blackboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-6 py-3.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.09] hover:text-white"
            >
              <span>See Demo</span>
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs text-zinc-500">
            <span>Free for educators & students</span>
            <span>•</span>
            <span>1-click Google Sign In</span>
            <span>•</span>
            <span>Auto-saves every 5 seconds</span>
          </div>

          {/* ══ Visual Interactive Blackboard Preview (Borderless card with pure shadow) ══ */}
          <div className="mt-16 w-full max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-[#090D18] p-6 sm:p-8 shadow-2xl shadow-black/80 text-left">
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium text-zinc-400">Classroom Board — Mathematics</span>
                </div>
                <div className="text-xs text-zinc-600 font-mono">LaTeX Ready</div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 pt-4">
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Handwritten Expression</div>
                  <div className="mt-2 text-2xl font-mono text-white">
                    f(x) = x² − 4x + 3
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                      Roots: x = 1, x = 3
                    </span>
                    <span className="rounded-lg bg-indigo-500/10 px-3 py-1 text-xs text-indigo-400">
                      Vertex: (2, −1)
                    </span>
                  </div>
                </div>

                <div className="relative h-32 rounded-2xl bg-black/40 p-3 flex items-center justify-center">
                  <svg className="h-full w-full stroke-indigo-400" viewBox="0 0 320 100" fill="none">
                    <line x1="20" y1="80" x2="300" y2="80" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    <line x1="160" y1="10" x2="160" y2="90" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    <path d="M 40,15 Q 160,110 280,15" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="160" cy="62" r="3.5" fill="#34D399" />
                  </svg>
                  <span className="absolute bottom-2 right-3 text-[10px] text-zinc-600 font-mono">
                    Parabola minimum plotted
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════ FEATURES (Borderless minimal grid) ═════════ */}
      <section id="features" className="relative px-6 py-28 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Core Capabilities
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Engineered specifically for STEM instruction
            </h2>
            <p className="mt-3 text-base text-zinc-400">
              Everything you need during a lecture, completely without toolbars or distractions.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: PenTool,
                title: "Infinite Blackboard",
                desc: "Fluid freehand drawing and infinite pan-and-zoom canvas with full revision history.",
              },
              {
                icon: Sigma,
                title: "Live LaTeX Recognition",
                desc: "Write math naturally with your stylus. HyperBoard converts strokes to publication-grade LaTeX.",
              },
              {
                icon: Zap,
                title: "Physics Simulations",
                desc: "Decompose force vectors, simulate circuits, and trace optical rays dynamically.",
              },
              {
                icon: FlaskConical,
                title: "3D Molecular Geometry",
                desc: "Auto-balance chemistry equations and inspect 3D VSEPR spatial structures in real time.",
              },
              {
                icon: Globe,
                title: "Multilingual Classrooms",
                desc: "Full interface available in English, Kazakh, and Russian.",
              },
              {
                icon: Share2,
                title: "Instant Cloud Snapshots",
                desc: "Auto-saved every 5 seconds. Export lecture notes to share with students instantly.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-white/[0.02] p-8 transition hover:bg-white/[0.04]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-indigo-400">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════ THREE DISCIPLINES ═════════ */}
      <section id="disciplines" className="relative px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
              One board. Three disciplines.
            </h2>
            <p className="mt-3 text-base text-zinc-400">
              Switch subject with one click. Instant access to 30 specialized tools per discipline.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                subject: "Mathematics",
                icon: Sigma,
                color: "text-emerald-400",
                features: [
                  "Handwriting to LaTeX rendering",
                  "Quadratic & polynomial factor steps",
                  "Derivative and integral visual graphs",
                  "3D geometric shapes & unfoldings",
                ],
              },
              {
                subject: "Physics",
                icon: Zap,
                color: "text-cyan-400",
                features: [
                  "Incline plane vector resolution",
                  "Live circuit schematic simulation",
                  "Ray optics & lens refraction",
                  "Planetary orbit and kinematics",
                ],
              },
              {
                subject: "Chemistry",
                icon: FlaskConical,
                color: "text-amber-400",
                features: [
                  "Equation stoichiometric balancing",
                  "3D VSEPR spatial molecular viewer",
                  "Acid-base titration curve plotter",
                  "Lewis electron dot diagrams",
                ],
              },
            ].map((item) => (
              <div
                key={item.subject}
                className="rounded-3xl bg-white/[0.02] p-8 transition hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{item.subject}</h3>
                    <span className="text-xs text-zinc-500">30 AI Features</span>
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {item.features.map((feat) => (
                    <li key={feat} className="text-xs text-zinc-400 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════ CLASSROOM DEMO SHOWCASE ═════════ */}
      <section id="demo" className="relative px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Interactive Demo
            </span>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
              See how it works in class
            </h2>

            {/* Clean Pill Selector */}
            <div className="mt-8 inline-flex rounded-full bg-white/[0.04] p-1">
              <button
                onClick={() => setActiveDemo("math")}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                  activeDemo === "math" ? "bg-white text-zinc-950" : "text-zinc-400 hover:text-white"
                }`}
              >
                Mathematics
              </button>
              <button
                onClick={() => setActiveDemo("physics")}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                  activeDemo === "physics" ? "bg-white text-zinc-950" : "text-zinc-400 hover:text-white"
                }`}
              >
                Physics
              </button>
              <button
                onClick={() => setActiveDemo("chemistry")}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                  activeDemo === "chemistry" ? "bg-white text-zinc-950" : "text-zinc-400 hover:text-white"
                }`}
              >
                Chemistry
              </button>
            </div>
          </div>

          <div className="mt-12 rounded-3xl bg-[#090D18] p-8 sm:p-10 shadow-2xl">
            {activeDemo === "math" && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-zinc-500 uppercase font-semibold">Chalk Input</div>
                  <div className="mt-2 font-mono text-2xl text-emerald-400">
                    2x² − 8x + 6 = 0
                  </div>
                </div>
                <div className="space-y-2 text-sm font-mono text-zinc-300">
                  <div className="text-zinc-500">1. Divide by 2: x² − 4x + 3 = 0</div>
                  <div className="text-zinc-500">2. Factor: (x − 1)(x − 3) = 0</div>
                  <div className="text-white font-semibold">3. Solution: x = 1, x = 3</div>
                </div>
              </div>
            )}

            {activeDemo === "physics" && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-zinc-500 uppercase font-semibold">Inclined Plane Mechanics</div>
                  <div className="mt-2 font-mono text-xl text-cyan-400">
                    θ = 30°, m = 5 kg, μ = 0.15
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono text-zinc-300 sm:grid-cols-4">
                  <div className="rounded-xl bg-white/[0.03] p-3">
                    <span className="text-zinc-500">Parallel:</span> 24.5 N
                  </div>
                  <div className="rounded-xl bg-white/[0.03] p-3">
                    <span className="text-zinc-500">Normal:</span> 42.4 N
                  </div>
                  <div className="rounded-xl bg-white/[0.03] p-3">
                    <span className="text-zinc-500">Friction:</span> 6.4 N
                  </div>
                  <div className="rounded-xl bg-white/[0.03] p-3 text-cyan-300 font-semibold">
                    <span className="text-zinc-500">Accel:</span> 3.62 m/s²
                  </div>
                </div>
              </div>
            )}

            {activeDemo === "chemistry" && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-zinc-500 uppercase font-semibold">Reaction Balancing</div>
                  <div className="mt-2 font-mono text-xl text-amber-400">
                    2 H₂ (g) + O₂ (g) ⟶ 2 H₂O (g)
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs font-mono text-zinc-300 text-center">
                  <div className="rounded-xl bg-white/[0.03] p-3">
                    <div className="text-zinc-500 text-[10px]">Shape</div>
                    <div className="text-white font-semibold">Bent (104.5°)</div>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] p-3">
                    <div className="text-zinc-500 text-[10px]">Hybridization</div>
                    <div className="text-white font-semibold">sp³</div>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] p-3">
                    <div className="text-zinc-500 text-[10px]">Enthalpy</div>
                    <div className="text-amber-300 font-semibold">−483.6 kJ</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═════════ WORKFLOW ═════════ */}
      <section id="workflow" className="relative px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Simplicity at every step
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-3 text-left">
            <div>
              <div className="font-mono text-2xl font-bold text-zinc-600">01</div>
              <h3 className="mt-3 text-base font-semibold text-white">Write naturally</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Use your tablet, pen, or mouse. The blackboard gives you infinite space to teach.
              </p>
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-zinc-600">02</div>
              <h3 className="mt-3 text-base font-semibold text-white">Tap to resolve</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Tap any formula or shape. AI renders LaTeX, plots the curves, or balances the reaction.
              </p>
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-zinc-600">03</div>
              <h3 className="mt-3 text-base font-semibold text-white">Share notes</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Every stroke is auto-saved. Export crisp lecture notes for your students with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════ FINAL MINIMAL CTA ═════════ */}
      <section className="relative px-6 py-32 text-center sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Start teaching with HyperBoard
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            Completely free for educators. Sign in with Google to begin.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              <span>Continue with Google</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═════════ MINIMAL FOOTER ═════════ */}
      <footer className="px-6 py-10 sm:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-zinc-600">
          <span>HyperBoard Studio</span>
          <span>Mathematics · Physics · Chemistry</span>
        </div>
      </footer>
    </div>
  );
}
