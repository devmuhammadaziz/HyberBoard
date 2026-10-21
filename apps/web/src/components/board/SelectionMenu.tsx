"use client";

import { useMemo, useState } from "react";
import type {
  AiFeatureId,
  AiResponse,
  PlotData,
  Subject,
} from "@smart-desk/types";
import {
  Sparkles,
  Copy,
  Trash2,
  Loader2,
  Minus,
  Equal,
  LineChart,
  ListOrdered,
  Code2,
  TrendingUp,
  Target,
  ArrowRightToLine,
  Grid3x3,
  Compass,
  MoveUpRight,
  AlertTriangle,
  Box,
  Split,
  Orbit,
  Zap,
  Cpu,
  Eye,
  BarChart2,
  Activity,
  Layers,
  Scale,
  FlaskConical,
  Droplet,
  PieChart,
  Table2,
  RotateCw,
  Atom,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { tryLocalSolve } from "@/lib/math-solve";
import { parsePlotFromText, plotDataFromApi } from "@/lib/plot-from-text";
import clsx from "clsx";

type Props = {
  subject: Subject;
  screenX: number;
  screenYTop: number;
  screenYBottom: number;
  selectionText: string;
  boardId?: string;
  boardTitle?: string;
  color: string;
  onColorChange: (c: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDashToggle: () => void;
  onSolveAnswer: (answer: string) => void;
  onPlot: (plot: PlotData) => void;
  onResult: (result: AiResponse) => void;
  captureImage: () => Promise<string | null>;
};

const COLORS = ["#4F46E5", "#F9FAFB", "#10B981", "#06B6D4", "#F59E0B", "#EF4444", "#0F172A"];

interface TopAiFeature {
  id: AiFeatureId;
  shortName: string;
  name: string;
  summary: string;
  icon: React.ReactNode;
}

const TOP_10_FEATURES: Record<Subject, TopAiFeature[]> = {
  math: [
    {
      id: "math.step-solver",
      shortName: "Step Solver",
      name: "Step-by-Step Solver",
      summary: "Solve with verified intermediate steps and explanations",
      icon: <ListOrdered className="h-3.5 w-3.5" />,
    },
    {
      id: "math.handwriting-latex",
      shortName: "LaTeX",
      name: "Handwriting to LaTeX",
      summary: "Convert handwritten ink into publication-ready LaTeX",
      icon: <Code2 className="h-3.5 w-3.5" />,
    },
    {
      id: "math.derivative-integral",
      shortName: "Deriv / Int",
      name: "Derivative & Integral",
      summary: "Differentiate, integrate, and shade bounded area",
      icon: <TrendingUp className="h-3.5 w-3.5" />,
    },
    {
      id: "math.polynomial-roots",
      shortName: "Find Roots",
      name: "Polynomial Roots",
      summary: "Locate real/complex roots and vertex intersections",
      icon: <Target className="h-3.5 w-3.5" />,
    },
    {
      id: "math.limit-asymptote",
      shortName: "Limits",
      name: "Limits & Asymptotes",
      summary: "Evaluate one-sided limits and vertical asymptotes",
      icon: <ArrowRightToLine className="h-3.5 w-3.5" />,
    },
    {
      id: "math.matrix-ops",
      shortName: "Matrix Ops",
      name: "Matrix Operations",
      summary: "Determinant, inverse, eigenvalues, and RREF",
      icon: <Grid3x3 className="h-3.5 w-3.5" />,
    },
    {
      id: "math.unit-circle",
      shortName: "Unit Circle",
      name: "Unit Circle Trig",
      summary: "Map angles onto the unit circle (cos θ, sin θ)",
      icon: <Compass className="h-3.5 w-3.5" />,
    },
    {
      id: "math.vector-visualizer",
      shortName: "Vector Plot",
      name: "Vector Visualizer",
      summary: "Plot 2D/3D vectors with magnitude and direction",
      icon: <MoveUpRight className="h-3.5 w-3.5" />,
    },
    {
      id: "math.error-highlighter",
      shortName: "Check Error",
      name: "Error Highlighter",
      summary: "Scan multi-line work for sign and arithmetic errors",
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
    },
    {
      id: "math.geometric-net-3d",
      shortName: "3D Net",
      name: "3D Geometric Net",
      summary: "Fold 2D shape net into an interactive 3D solid",
      icon: <Box className="h-3.5 w-3.5" />,
    },
  ],
  physics: [
    {
      id: "physics.free-body",
      shortName: "Auto FBD",
      name: "Free-Body Diagram",
      summary: "Auto-construct labeled force vectors (Normal, Gravity, Friction)",
      icon: <Layers className="h-3.5 w-3.5" />,
    },
    {
      id: "physics.force-decomposition",
      shortName: "Decompose F",
      name: "Force Decomposition",
      summary: "Resolve force vectors into orthogonal Fx and Fy components",
      icon: <Split className="h-3.5 w-3.5" />,
    },
    {
      id: "physics.trajectory",
      shortName: "Trajectory",
      name: "Trajectory Predictor",
      summary: "Simulate projectile path, range, apex, and flight time",
      icon: <Orbit className="h-3.5 w-3.5" />,
    },
    {
      id: "physics.collision",
      shortName: "Collision",
      name: "Collision Simulator",
      summary: "Elastic and inelastic momentum and kinetic energy outcomes",
      icon: <Activity className="h-3.5 w-3.5" />,
    },
    {
      id: "physics.circuit-sim",
      shortName: "Circuit Sim",
      name: "Circuit Simulator",
      summary: "Solve resistor/capacitor branch currents and voltage drops",
      icon: <Cpu className="h-3.5 w-3.5" />,
    },
    {
      id: "physics.ray-optics",
      shortName: "Ray Optics",
      name: "Ray Optics & Lenses",
      summary: "Trace focal and central rays through concave/convex lenses",
      icon: <Eye className="h-3.5 w-3.5" />,
    },
    {
      id: "physics.energy-bars",
      shortName: "Energy Bars",
      name: "Energy Conservation",
      summary: "Live bar charts of Kinetic (KE) vs Potential (PE) energy",
      icon: <BarChart2 className="h-3.5 w-3.5" />,
    },
    {
      id: "physics.pendulum",
      shortName: "Pendulum",
      name: "Pendulum & SHM",
      summary: "Simulate harmonic oscillation period T = 2π√(L/g)",
      icon: <RotateCw className="h-3.5 w-3.5" />,
    },
    {
      id: "physics.coulomb-field",
      shortName: "E-Field",
      name: "Coulomb E-Field",
      summary: "Map electric field lines and equipotential surfaces",
      icon: <Zap className="h-3.5 w-3.5" />,
    },
    {
      id: "physics.doppler",
      shortName: "Doppler",
      name: "Doppler Wave Shift",
      summary: "Calculate observed wave frequency shifts for moving sources",
      icon: <Activity className="h-3.5 w-3.5" />,
    },
  ],
  chemistry: [
    {
      id: "chemistry.equation-balancer",
      shortName: "Balance Eq",
      name: "Equation Balancer",
      summary: "Balance chemical reactions with mass and charge conservation",
      icon: <Scale className="h-3.5 w-3.5" />,
    },
    {
      id: "chemistry.stoichiometry",
      shortName: "Stoich",
      name: "Stoichiometry & Yield",
      summary: "Calculate limiting reagents, theoretical yield, and excess moles",
      icon: <FlaskConical className="h-3.5 w-3.5" />,
    },
    {
      id: "chemistry.molecule-3d",
      shortName: "3D Molecule",
      name: "3D Molecular Geometry",
      summary: "Render interactive 3D VSEPR ball-and-stick models",
      icon: <Box className="h-3.5 w-3.5" />,
    },
    {
      id: "chemistry.lewis-structure",
      shortName: "Lewis Dots",
      name: "Lewis Dot Structure",
      summary: "Generate Lewis structures with lone pairs and formal charges",
      icon: <Droplet className="h-3.5 w-3.5" />,
    },
    {
      id: "chemistry.molarity",
      shortName: "Molarity",
      name: "Molarity & Dilutions",
      summary: "Solve solution concentration and C1V1 = C2V2 dilution recipes",
      icon: <Droplet className="h-3.5 w-3.5" />,
    },
    {
      id: "chemistry.redox",
      shortName: "Redox Split",
      name: "Redox Half-Reactions",
      summary: "Split redox reactions into oxidation and reduction half-cells",
      icon: <Zap className="h-3.5 w-3.5" />,
    },
    {
      id: "chemistry.vsepr-angles",
      shortName: "VSEPR Angles",
      name: "VSEPR Bond Angles",
      summary: "Measure electron domain geometry and compressed bond angles",
      icon: <PieChart className="h-3.5 w-3.5" />,
    },
    {
      id: "chemistry.titration",
      shortName: "Titration",
      name: "Titration Curve",
      summary: "Chart pH curve, buffer capacity, and equivalence points",
      icon: <TrendingUp className="h-3.5 w-3.5" />,
    },
    {
      id: "chemistry.hybridization",
      shortName: "Hybridization",
      name: "Orbital Hybridization",
      summary: "Determine sp, sp2, sp3 orbital states and count sigma/pi bonds",
      icon: <Atom className="h-3.5 w-3.5" />,
    },
    {
      id: "chemistry.periodic-table",
      shortName: "Element Info",
      name: "Periodic Properties",
      summary: "Retrieve valence electrons, electronegativity, and oxidation states",
      icon: <Table2 className="h-3.5 w-3.5" />,
    },
  ],
};

export function SelectionMenu({
  subject,
  screenX,
  screenYTop,
  screenYBottom,
  selectionText,
  boardId,
  boardTitle,
  color,
  onColorChange,
  onDuplicate,
  onDelete,
  onDashToggle,
  onSolveAnswer,
  onPlot,
  onResult,
  captureImage,
}: Props) {
  const { locale } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const top10 = useMemo(
    () => TOP_10_FEATURES[subject] || TOP_10_FEATURES.math,
    [subject]
  );

  const plot = async () => {
    setBusy("plot");
    setError(null);
    try {
      const local = parsePlotFromText(selectionText);
      if (local) {
        onPlot(local);
        return;
      }

      const imageBase64 = await captureImage();
      if (!selectionText.trim() && !imageBase64) {
        setError("Select an equation, points, or vector first");
        return;
      }

      const data = await api<{
        result: {
          mode?: "2d" | "3d";
          title?: string;
          rawLatex?: string;
          normalizedExpression?: string | null;
          expression?: string | null;
          variable?: "x" | "y";
          functionType?: string;
          suggestedDomain?: [number, number] | null;
          points?: Array<{ x: number; y: number; label?: string }>;
          vectors?: Array<{
            x: number;
            y: number;
            label?: string;
            from?: { x: number; y: number };
          }>;
        };
      }>("/ai/plot", {
        method: "POST",
        body: JSON.stringify({
          text: selectionText || undefined,
          imageBase64: imageBase64 || undefined,
          subject,
          locale,
        }),
      });

      const parsed = plotDataFromApi(data.result as never);
      if (!parsed) {
        setError("Could not build a graph from that selection");
        return;
      }
      onPlot(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Plot failed");
    } finally {
      setBusy(null);
    }
  };

  const solve = async () => {
    setBusy("solve");
    setError(null);
    try {
      const local = tryLocalSolve(selectionText);
      if (local) {
        onSolveAnswer(local);
        return;
      }

      const imageBase64 = await captureImage();
      const data = await api<{
        result: { answer: string; expression?: string | null; latex?: string | null };
      }>("/ai/solve", {
        method: "POST",
        body: JSON.stringify({
          text: selectionText || undefined,
          imageBase64: imageBase64 || undefined,
          subject,
          locale,
        }),
      });
      onSolveAnswer(data.result.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Solve failed");
    } finally {
      setBusy(null);
    }
  };

  const run = async (featureId: AiFeatureId) => {
    const value = selectionText.trim();
    let imageBase64: string | null = null;
    if (!value) {
      imageBase64 = await captureImage();
    }

    if (!value && !imageBase64) {
      setError("Please select an equation, drawing, or formula first");
      return;
    }

    setBusy(featureId);
    setError(null);
    try {
      const data = await api<{ result: AiResponse }>("/ai/run", {
        method: "POST",
        body: JSON.stringify({
          featureId,
          subject,
          input: value || "Analyze the selected mathematical expression on the board.",
          locale,
          selection: { elementIds: [], text: value || undefined },
          boardContext: { boardId, title: boardTitle },
        }),
      });
      onResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════════
          TOP BAR: Colors, Stroke Dash, Copy, Delete, Solve, Graph
          Positioned directly above the top edge of the selection
         ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="pointer-events-auto absolute z-50 transition-all duration-150"
        style={{
          left: screenX,
          top: Math.max(16, screenYTop - 12),
          transform: "translate(-50%, -100%)",
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5 rounded-full border border-black/10 bg-[var(--surface)]/95 px-3 py-1.5 shadow-xl shadow-black/20 backdrop-blur-2xl dark:border-white/10">
          {/* Color Swatches */}
          <div className="flex items-center gap-1.5 pr-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onColorChange(c)}
                className={clsx(
                  "h-4 w-4 rounded-full transition hover:scale-115 active:scale-90",
                  c === "#F9FAFB" && "border border-neutral-300 dark:border-white/30",
                  color === c && "ring-2 ring-[var(--brand)] ring-offset-1 ring-offset-[var(--surface)] scale-110 shadow-sm"
                )}
                style={{ background: c }}
                title={`Color: ${c}`}
              />
            ))}
          </div>

          <div className="h-4 w-px bg-current/10" />

          {/* Stroke Dash Toggle */}
          <button
            type="button"
            title="Toggle stroke style (Solid / Dashed)"
            onClick={onDashToggle}
            className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text-secondary)] transition hover:bg-[var(--bg)] hover:text-[var(--text-primary)] active:scale-95"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          {/* Duplicate Action */}
          <button
            type="button"
            title="Duplicate selected (⌘D)"
            onClick={onDuplicate}
            className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text-secondary)] transition hover:bg-[var(--bg)] hover:text-[var(--text-primary)] active:scale-95"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>

          {/* Delete Action */}
          <button
            type="button"
            title="Delete selected (Backspace / Delete)"
            onClick={onDelete}
            className="grid h-7 w-7 place-items-center rounded-lg text-red-400 transition hover:bg-red-500/15 hover:text-red-500 active:scale-95"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-current/10" />

          {/* Solve Button */}
          <button
            type="button"
            title="Solve expression"
            disabled={!!busy}
            onClick={() => void solve()}
            className="inline-flex h-7 items-center gap-1.5 rounded-full bg-emerald-500 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600 active:scale-95 disabled:opacity-60"
          >
            {busy === "solve" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Equal className="h-3.5 w-3.5" />
            )}
            <span>Solve</span>
          </button>

          {/* Graph Button */}
          <button
            type="button"
            title="Plot 2D / 3D graph"
            disabled={!!busy}
            onClick={() => void plot()}
            className="inline-flex h-7 items-center gap-1.5 rounded-full bg-sky-500 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-600 active:scale-95 disabled:opacity-60"
          >
            {busy === "plot" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LineChart className="h-3.5 w-3.5" />
            )}
            <span>Graph</span>
          </button>
        </div>

        {error && (
          <p className="mt-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-center text-[11px] text-red-300 backdrop-blur-md">
            {error}
          </p>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          BOTTOM BAR: 10 Essential AI Features in 1 Line
          Positioned directly below the bottom edge of the selection
         ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="pointer-events-auto absolute z-50 transition-all duration-150"
        style={{
          left: screenX,
          top: Math.max(screenYTop + 52, screenYBottom + 12),
          transform: "translate(-50%, 0)",
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex max-w-[min(94vw,880px)] items-center gap-1 overflow-x-auto no-scrollbar rounded-full border border-black/10 bg-[var(--surface)]/95 px-2.5 py-1.5 shadow-xl shadow-black/20 backdrop-blur-2xl dark:border-white/10">
          {/* AI Subject Badge */}
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--brand)]/15 px-2.5 py-1 text-[11px] font-bold text-[var(--brand)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="uppercase tracking-wider">{subject} AI</span>
          </div>

          <div className="mx-1 h-4 w-px bg-current/10 shrink-0" />

          {/* 10 AI Feature Buttons in 1 Line */}
          <div className="flex items-center gap-1">
            {top10.map((feat) => {
              const isExecuting = busy === feat.id;
              return (
                <button
                  key={feat.id}
                  type="button"
                  disabled={!!busy}
                  title={`${feat.name}: ${feat.summary}`}
                  onClick={() => void run(feat.id)}
                  className={clsx(
                    "group flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition select-none",
                    isExecuting
                      ? "bg-[var(--brand)] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text-primary)] active:scale-95 disabled:opacity-50"
                  )}
                >
                  {isExecuting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span className="text-[var(--text-secondary)] transition-colors group-hover:text-[var(--brand)]">
                      {feat.icon}
                    </span>
                  )}
                  <span>{feat.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
