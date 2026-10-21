"use client";

import React, { useState } from "react";
import {
  X,
  Keyboard,
  Sparkles,
  Calculator,
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
} from "lucide-react";
import type { Subject } from "@smart-desk/types";
import clsx from "clsx";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
  subject?: Subject;
}

interface FeatureGuideItem {
  id: string;
  name: string;
  badge: string;
  icon: React.ReactNode;
  summary: string;
  howToUse: string;
  example: string;
}

export const AI_FEATURES_GUIDE: Record<Subject, FeatureGuideItem[]> = {
  math: [
    {
      id: "math.step-solver",
      name: "Step-by-Step Solver",
      badge: "Steps & Explanation",
      icon: <ListOrdered className="h-4 w-4" />,
      summary: "Breaks down algebraic, trigonometric, or calculus equations into detailed intermediate steps.",
      howToUse: "Select an equation on the canvas and click Step Solver. Generates full step-by-step verification.",
      example: "2x² - 8x + 6 = 0  →  Roots x=1, x=3",
    },
    {
      id: "math.handwriting-latex",
      name: "Handwriting → LaTeX",
      badge: "LaTeX OCR",
      icon: <Code2 className="h-4 w-4" />,
      summary: "Transcribes messy handwriting or ink into publication-ready LaTeX syntax and crisp math.",
      howToUse: "Select handwritten notes or ink equations and click LaTeX to convert into an editable formula.",
      example: "∫ x² dx  →  \\int x^2 dx = \\frac{x^3}{3} + C",
    },
    {
      id: "math.derivative-integral",
      name: "Derivative & Integral",
      badge: "Calculus",
      icon: <TrendingUp className="h-4 w-4" />,
      summary: "Calculates first/second derivatives, definite integrals, and shades bounded areas under curves.",
      howToUse: "Select a function expression to find f'(x), f''(x), critical extrema, and anti-derivatives.",
      example: "f(x) = sin(x)·e^x  →  f'(x) = e^x(sin x + cos x)",
    },
    {
      id: "math.polynomial-roots",
      name: "Polynomial Roots",
      badge: "Intersections",
      icon: <Target className="h-4 w-4" />,
      summary: "Identifies all real and complex roots, y-intercepts, and vertex coordinates for polynomials.",
      howToUse: "Select any polynomial equation or quadratic expression to locate all intersection points.",
      example: "x³ - 6x² + 11x - 6 = 0  →  x ∈ {1, 2, 3}",
    },
    {
      id: "math.limit-asymptote",
      name: "Limits & Asymptotes",
      badge: "Analysis",
      icon: <ArrowRightToLine className="h-4 w-4" />,
      summary: "Evaluates left-sided, right-sided, and infinite limits, vertical asymptotes, and holes.",
      howToUse: "Select a rational or transcendental function to detect asymptotes and limit behavior.",
      example: "lim(x→0) (sin x)/x = 1; Vertical asymptote at x=2",
    },
    {
      id: "math.matrix-ops",
      name: "Matrix Operations",
      badge: "Linear Algebra",
      icon: <Grid3x3 className="h-4 w-4" />,
      summary: "Calculates determinants, inverses, eigenvalues, eigenvectors, and RREF row reduction.",
      howToUse: "Select a 2x2, 3x3, or nxn matrix to perform transformations and solve linear systems.",
      example: "det([[1, 2], [3, 4]]) = -2, Inverse = [[-2, 1], [1.5, -0.5]]",
    },
    {
      id: "math.unit-circle",
      name: "Unit Circle Trig",
      badge: "Trigonometry",
      icon: <Compass className="h-4 w-4" />,
      summary: "Maps radian or degree angles onto the unit circle with exact coordinates (cos θ, sin θ).",
      howToUse: "Select an angle or trig expression to view its unit circle position, quadrant, and exact values.",
      example: "θ = 5π/6 (150°)  →  (-√3/2, 1/2), tan = -1/√3",
    },
    {
      id: "math.vector-visualizer",
      name: "Vector Visualizer",
      badge: "Vectors & Geometry",
      icon: <MoveUpRight className="h-4 w-4" />,
      summary: "Plots 2D and 3D vectors on coordinate planes with magnitude, angle, dot and cross products.",
      howToUse: "Select vector notation like [3, 4] to plot direction arrows, calculate ||v||, and projections.",
      example: "v = [3, 4]  →  Magnitude = 5, Angle = 53.13°",
    },
    {
      id: "math.error-highlighter",
      name: "Error Highlighter",
      badge: "Diagnostics",
      icon: <AlertTriangle className="h-4 w-4" />,
      summary: "Scans step-by-step mathematical working to pinpoint exact lines where mistakes occurred.",
      howToUse: "Select multi-line handwritten or typed working to detect sign flips and algebraic slips.",
      example: "Highlights line 3: Forgot to distribute negative sign across parentheses.",
    },
    {
      id: "math.geometric-net-3d",
      name: "3D Geometric Net",
      badge: "3D Geometry",
      icon: <Box className="h-4 w-4" />,
      summary: "Folds 2D geometric nets into interactive 3D polyhedra, cylinders, prisms, and cones.",
      howToUse: "Select a 2D shape net or solid specification to generate an interactive 3D model.",
      example: "Cube, Triangular Prism, Cylinder net folding animation.",
    },
  ],
  physics: [
    {
      id: "physics.free-body",
      name: "Free-Body Diagram",
      badge: "Mechanics",
      icon: <Layers className="h-4 w-4" />,
      summary: "Automatically constructs a labeled free-body diagram showing gravity, normal, friction, and tension.",
      howToUse: "Select a physics problem or mass on an incline to auto-generate all balanced force vectors.",
      example: "Mass on 30° incline: mg sin(30°), Normal N = mg cos(30°), Friction f.",
    },
    {
      id: "physics.force-decomposition",
      name: "Force Decomposition",
      badge: "Vector Math",
      icon: <Split className="h-4 w-4" />,
      summary: "Resolves arbitrary force vectors into orthogonal Fx and Fy components with angle trigonometry.",
      howToUse: "Select a force vector to break down into horizontal and vertical components.",
      example: "F = 50N at 37°  →  Fx = 40N, Fy = 30N.",
    },
    {
      id: "physics.trajectory",
      name: "Trajectory Predictor",
      badge: "Kinematics",
      icon: <Orbit className="h-4 w-4" />,
      summary: "Simulates projectile motion, range, apex height, time-of-flight, and impact velocity.",
      howToUse: "Select initial velocity v₀ and angle θ to compute parabolic path and flight time.",
      example: "v₀ = 20 m/s, θ = 45°  →  Range R = 40.8 m, Max H = 10.2 m.",
    },
    {
      id: "physics.collision",
      name: "Collision Simulator",
      badge: "Momentum",
      icon: <Activity className="h-4 w-4" />,
      summary: "Simulates 1D and 2D elastic and inelastic collisions with momentum conservation.",
      howToUse: "Select two masses with initial velocities to compute post-collision vectors.",
      example: "m₁v₁ + m₂v₂ = (m₁ + m₂)v' (Inelastic collision).",
    },
    {
      id: "physics.circuit-sim",
      name: "Circuit Simulator",
      badge: "Electromagnetism",
      icon: <Cpu className="h-4 w-4" />,
      summary: "Analyzes resistor, capacitor, and voltage schematics using Kirchhoff's and Ohm's laws.",
      howToUse: "Select a circuit equation or schematic text to compute equivalent resistance and branch currents.",
      example: "V = IR; 12V supply across 4Ω and 6Ω in parallel  →  Req = 2.4Ω, I = 5A.",
    },
    {
      id: "physics.ray-optics",
      name: "Ray Optics & Lenses",
      badge: "Optics",
      icon: <Eye className="h-4 w-4" />,
      summary: "Traces parallel, focal, and central rays through concave/convex lenses and spherical mirrors.",
      howToUse: "Select focal length f and object distance d_o to construct ray paths and image magnification.",
      example: "1/f = 1/d_o + 1/d_i  →  Image distance, upright/inverted, real/virtual.",
    },
    {
      id: "physics.energy-bars",
      name: "Energy Conservation",
      badge: "Thermodynamics",
      icon: <BarChart2 className="h-4 w-4" />,
      summary: "Generates dynamic kinetic (KE) and potential (PE) energy bar graphs along motion tracks.",
      howToUse: "Select a rollercoaster or pendulum setup to inspect total mechanical energy conservation.",
      example: "E_total = 1/2 mv² + mgh = constant.",
    },
    {
      id: "physics.pendulum",
      name: "Pendulum & SHM",
      badge: "Oscillations",
      icon: <RotateCw className="h-4 w-4" />,
      summary: "Models simple harmonic motion, period T = 2π√(L/g), frequency, and phase displacement.",
      howToUse: "Select length L and mass m to simulate periodic swing and restorative torque.",
      example: "L = 1.0 m  →  Period T = 2.006 s, frequency f = 0.498 Hz.",
    },
    {
      id: "physics.coulomb-field",
      name: "Coulomb E-Field",
      badge: "Electrostatics",
      icon: <Zap className="h-4 w-4" />,
      summary: "Maps electric field lines and equipotential surfaces surrounding positive and negative charges.",
      howToUse: "Select charge values q₁, q₂ to calculate electrostatic Coulomb force and field vectors.",
      example: "F = k·|q₁q₂|/r²; E-field vectors radiate outward from +q.",
    },
    {
      id: "physics.doppler",
      name: "Doppler Wave Shift",
      badge: "Wave Mechanics",
      icon: <Activity className="h-4 w-4" />,
      summary: "Calculates sound or light frequency shifts for moving sources and observers.",
      howToUse: "Select source velocity v_s and base frequency f₀ to calculate observed pitch changes.",
      example: "f' = f₀ · (v ± v_o)/(v ∓ v_s).",
    },
  ],
  chemistry: [
    {
      id: "chemistry.equation-balancer",
      name: "Equation Balancer",
      badge: "Stoichiometry",
      icon: <Scale className="h-4 w-4" />,
      summary: "Balances complex chemical equations with atom conservation and state symbols.",
      howToUse: "Select unbalanced chemical formulas to generate stoichiometric integer coefficients.",
      example: "C₃H₈ + 5O₂  →  3CO₂ + 4H₂O",
    },
    {
      id: "chemistry.stoichiometry",
      name: "Stoichiometry & Yield",
      badge: "Reactions",
      icon: <FlaskConical className="h-4 w-4" />,
      summary: "Identifies limiting reagents, excess reactants, theoretical yield, and percent yield.",
      howToUse: "Select reactant quantities in grams or moles to determine limiting reagent and product yield.",
      example: "10g Fe + 10g S  →  Fe is limiting reagent; Theoretical FeS yield = 15.74g.",
    },
    {
      id: "chemistry.molecule-3d",
      name: "3D Molecular Geometry",
      badge: "VSEPR 3D",
      icon: <Box className="h-4 w-4" />,
      summary: "Renders 3D VSEPR ball-and-stick models with interactive rotation and bond perspectives.",
      howToUse: "Select a chemical formula (e.g. SF6, H2O, CH4) to generate an interactive 3D model.",
      example: "CH₄: Tetrahedral geometry, 109.5° bond angles.",
    },
    {
      id: "chemistry.lewis-structure",
      name: "Lewis Dot Structure",
      badge: "Bonding",
      icon: <Droplet className="h-4 w-4" />,
      summary: "Generates Lewis dot structures with valence electrons, lone pairs, and formal charges.",
      howToUse: "Select any molecule or polyatomic ion to verify octet compliance and resonance.",
      example: "CO₃²⁻: 3 resonance forms, formal charges on oxygen atoms.",
    },
    {
      id: "chemistry.molarity",
      name: "Molarity & Dilutions",
      badge: "Solutions",
      icon: <Droplet className="h-4 w-4" />,
      summary: "Calculates solution molarity, moles of solute, and C₁V₁ = C₂V₂ serial dilution recipes.",
      howToUse: "Select concentration and volume values to compute required solvent or solute.",
      example: "C₁V₁ = C₂V₂: Dilute 50mL of 6M HCl to 2M  →  Final volume = 150mL.",
    },
    {
      id: "chemistry.redox",
      name: "Redox Half-Reactions",
      badge: "Electrochem",
      icon: <Zap className="h-4 w-4" />,
      summary: "Splits oxidation-reduction reactions into oxidation and reduction half-reactions in acid/base.",
      howToUse: "Select a redox reaction to balance electrons and determine standard cell potential E°.",
      example: "MnO₄⁻ + 5Fe²⁺ + 8H⁺  →  Mn²⁺ + 5Fe³⁺ + 4H₂O",
    },
    {
      id: "chemistry.vsepr-angles",
      name: "VSEPR Bond Angles",
      badge: "Structure",
      icon: <PieChart className="h-4 w-4" />,
      summary: "Calculates ideal and distorted bond angles based on electron geometry and lone-pair repulsion.",
      howToUse: "Select a molecule to view steric number, electron domain geometry, and compressed angles.",
      example: "H₂O: Steric # 4, 2 lone pairs compress angle to 104.5°.",
    },
    {
      id: "chemistry.titration",
      name: "Titration Curve",
      badge: "Equilibrium",
      icon: <TrendingUp className="h-4 w-4" />,
      summary: "Plots acid-base pH titration curves with buffer zones, equivalence points, and pKa markers.",
      howToUse: "Select acid and base strengths to chart pH vs added titrant volume.",
      example: "Weak acid CH₃COOH titrated with strong base NaOH: Equivalence pH ≈ 8.7.",
    },
    {
      id: "chemistry.hybridization",
      name: "Orbital Hybridization",
      badge: "Orbitals",
      icon: <Orbit className="h-4 w-4" />,
      summary: "Determines sp, sp², sp³, sp³d, and sp³d² orbital states and counts sigma/pi bonds.",
      howToUse: "Select an organic or inorganic compound to identify atomic orbital hybridization.",
      example: "Ethene C₂H₄: Carbon atoms are sp² hybridized with 5 σ bonds and 1 π bond.",
    },
    {
      id: "chemistry.periodic-table",
      name: "Periodic Properties",
      badge: "Elements",
      icon: <Table2 className="h-4 w-4" />,
      summary: "Displays electron configurations, electronegativity, ionization energy, and oxidation states.",
      howToUse: "Select an element symbol or compound to retrieve atomic data and valence electrons.",
      example: "Iron (Fe, Z=26): [Ar] 3d⁶ 4s², common oxidation states +2, +3.",
    },
  ],
};

export function KeyboardShortcutsModal({
  open,
  onClose,
  subject = "math",
}: KeyboardShortcutsModalProps) {
  const [activeTab, setActiveTab] = useState<"ai" | "shortcuts">("ai");
  const [activeSubject, setActiveSubject] = useState<Subject>(subject);

  if (!open) return null;

  const toolsShortcuts = [
    { key: "1", alt: "V", label: "Selection tool" },
    { key: "2", alt: "H", label: "Hand / Pan canvas" },
    { key: "3", alt: "P", label: "Pen (freehand drawing)" },
    { key: "4", alt: "E", label: "Eraser" },
    { key: "5", alt: "T", label: "Text tool" },
    { key: "6", alt: "R", label: "Rectangle" },
    { key: "7", alt: "O", label: "Ellipse / Circle" },
    { key: "8", alt: "L", label: "Line" },
    { key: "9", alt: "A", label: "Arrow" },
  ];

  const actionShortcuts = [
    { key: "Space + Drag", label: "Quick pan canvas" },
    { key: "Ctrl / ⌘ + Z", label: "Undo last action" },
    { key: "Ctrl / ⌘ + Shift + Z", label: "Redo action" },
    { key: "Delete / ⌫", label: "Delete selected elements" },
    { key: "Ctrl / ⌘ + A", label: "Select all elements" },
    { key: "Ctrl / ⌘ + K", label: "Open Studio Workspace Hub" },
    { key: "Ctrl / ⌘ + N", label: "Create new blackboard" },
    { key: "Escape", label: "Clear selection / Cancel" },
  ];

  const currentFeatures = AI_FEATURES_GUIDE[activeSubject] || AI_FEATURES_GUIDE.math;

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-label="Studio Feature & Shortcut Guide"
        className="relative z-10 flex h-[38rem] max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-black/10 bg-[var(--surface)] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.6)] backdrop-blur-3xl dark:border-white/10"
      >
        {/* Header with Title and Mode Switcher */}
        <div className="flex items-center justify-between border-b border-black/5 p-5 pb-4 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--brand)]/15 text-[var(--brand)] shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Studio Help & Feature Guide
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Interactive AI tools, selection actions, and hotkeys
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Guide"
            className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--bg)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] hover:scale-105 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Primary Tabs: AI Features Guide vs Keyboard Shortcuts */}
        <div className="flex items-center justify-between border-b border-black/5 bg-[var(--bg)]/40 px-5 py-2.5 dark:border-white/5">
          <div className="flex items-center gap-1.5 rounded-xl bg-[var(--surface)] p-1 border border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={() => setActiveTab("ai")}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                activeTab === "ai"
                  ? "bg-[var(--brand)] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Features Guide</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shortcuts")}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                activeTab === "shortcuts"
                  ? "bg-[var(--brand)] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <Keyboard className="h-3.5 w-3.5" />
              <span>Keyboard Shortcuts</span>
            </button>
          </div>

          {/* If AI Tab is active, show subject selector */}
          {activeTab === "ai" && (
            <div className="flex items-center gap-1 rounded-xl bg-[var(--surface)] p-1 border border-black/5 dark:border-white/5">
              <button
                type="button"
                onClick={() => setActiveSubject("math")}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition",
                  activeSubject === "math"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Math (10)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubject("physics")}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition",
                  activeSubject === "physics"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <span>Physics (10)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubject("chemistry")}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition",
                  activeSubject === "chemistry"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span>Chemistry (10)</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "ai" ? (
            <div className="space-y-3">
              <div className="mb-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>
                  Select any equation, graph, or text on the canvas to see these features in the bottom toolbar.
                </span>
                <span className="font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                  {activeSubject.toUpperCase()} AI TOOLKIT
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {currentFeatures.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-2xl border border-black/5 bg-[var(--bg)]/70 p-4 transition hover:bg-[var(--bg)] hover:shadow-md dark:border-white/5"
                  >
                    <div>
                      {/* Top: Icon + Name + Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={clsx(
                              "grid h-8 w-8 place-items-center rounded-xl",
                              activeSubject === "math"
                                ? "bg-emerald-500/15 text-emerald-500"
                                : activeSubject === "physics"
                                ? "bg-cyan-500/15 text-cyan-500"
                                : "bg-amber-500/15 text-amber-500"
                            )}
                          >
                            {item.icon}
                          </div>
                          <h4 className="text-sm font-bold text-[var(--text-primary)]">
                            {item.name}
                          </h4>
                        </div>
                        <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)] dark:bg-white/10">
                          {item.badge}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                        {item.summary}
                      </p>
                    </div>

                    {/* How to use & Example */}
                    <div className="mt-3 border-t border-black/5 pt-2.5 text-[11px] dark:border-white/5">
                      <div className="text-[var(--text-secondary)]">
                        <strong className="font-semibold text-[var(--text-primary)]">Usage: </strong>
                        {item.howToUse}
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-[var(--brand)]">
                        {item.example}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Keyboard Shortcuts View */
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Drawing Tools
                </h4>
                <div className="space-y-2">
                  {toolsShortcuts.map((s) => (
                    <div
                      key={s.key}
                      className="flex items-center justify-between rounded-xl bg-[var(--bg)]/50 px-3 py-2 text-xs"
                    >
                      <span className="text-[var(--text-primary)] font-medium">{s.label}</span>
                      <div className="flex items-center gap-1 font-mono">
                        <kbd className="inline-flex min-w-[22px] items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-xs font-semibold text-[var(--text-primary)] shadow-sm">
                          {s.key}
                        </kbd>
                        <span className="text-[10px] text-[var(--text-secondary)]">/</span>
                        <kbd className="inline-flex min-w-[22px] items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-xs font-semibold text-[var(--text-secondary)] shadow-sm">
                          {s.alt}
                        </kbd>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Canvas Navigation & Actions
                </h4>
                <div className="space-y-2">
                  {actionShortcuts.map((s) => (
                    <div
                      key={s.key}
                      className="flex items-center justify-between rounded-xl bg-[var(--bg)]/50 px-3 py-2 text-xs"
                    >
                      <span className="text-[var(--text-primary)] font-medium">{s.label}</span>
                      <kbd className="inline-flex items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 font-mono text-xs font-semibold text-[var(--text-primary)] shadow-sm">
                        {s.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-black/5 bg-[var(--bg)]/30 px-5 py-3 text-xs text-[var(--text-secondary)] dark:border-white/5">
          <span>
            {activeTab === "ai"
              ? "Tip: Click any AI button in the bottom selection toolbar to run it directly on the canvas."
              : "Press any number 1–9 to switch tools instantly."}
          </span>
          <kbd className="rounded bg-[var(--bg)] px-2 py-0.5 font-mono text-[10px]">
            ESC to close
          </kbd>
        </div>
      </div>
    </div>
  );
}
