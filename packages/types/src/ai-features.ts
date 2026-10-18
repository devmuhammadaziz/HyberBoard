type Subject = "math" | "physics" | "chemistry";

export type AiFeatureGroup =
  | "algebra"
  | "calculus"
  | "geometry"
  | "stats"
  | "advanced-math"
  | "mechanics"
  | "waves-energy"
  | "em-optics"
  | "modern-physics"
  | "stoichiometry"
  | "structure"
  | "equilibrium"
  | "organic"
  | "analytical";

export type AiFeatureId = string;

export interface AiFeatureMeta {
  id: AiFeatureId;
  subject: Subject;
  group: AiFeatureGroup;
  name: string;
  description: string;
  icon: string;
}

export const AI_FEATURE_GROUPS: Record<
  Subject,
  Array<{ id: AiFeatureGroup; label: string }>
> = {
  math: [
    { id: "algebra", label: "Algebra & Equations" },
    { id: "calculus", label: "Calculus" },
    { id: "geometry", label: "Geometry & Graphs" },
    { id: "stats", label: "Stats & Probability" },
    { id: "advanced-math", label: "Advanced" },
  ],
  physics: [
    { id: "mechanics", label: "Mechanics" },
    { id: "waves-energy", label: "Waves & Energy" },
    { id: "em-optics", label: "EM & Optics" },
    { id: "modern-physics", label: "Modern Physics" },
  ],
  chemistry: [
    { id: "stoichiometry", label: "Reactions & Stoich" },
    { id: "structure", label: "Structure & Bonding" },
    { id: "equilibrium", label: "Equilibrium & Thermo" },
    { id: "organic", label: "Organic" },
    { id: "analytical", label: "Analytical" },
  ],
};

export const AI_FEATURES: AiFeatureMeta[] = [
  // Math — 30
  { id: "math.handwriting-latex", subject: "math", group: "algebra", name: "Handwriting → LaTeX", description: "Convert handwriting into LaTeX + graph.", icon: "sigma" },
  { id: "math.step-solver", subject: "math", group: "algebra", name: "Step-by-Step Solver", description: "Solve with clear intermediate steps.", icon: "list" },
  { id: "math.matrix-ops", subject: "math", group: "algebra", name: "Matrix Operations", description: "Det, inverse, eigenvalues.", icon: "grid" },
  { id: "math.word-problem", subject: "math", group: "algebra", name: "Word Problem → Model", description: "Translate word problems to equations.", icon: "languages" },
  { id: "math.error-highlighter", subject: "math", group: "algebra", name: "Error Highlighter", description: "Find arithmetic/sign errors.", icon: "bug" },
  { id: "math.boolean-algebra", subject: "math", group: "algebra", name: "Boolean Logic Gates", description: "Build logic-gate expressions.", icon: "cpu" },
  { id: "math.derivative-integral", subject: "math", group: "calculus", name: "Derivative & Integral", description: "Differentiate/integrate with area shade.", icon: "area" },
  { id: "math.riemann-sum", subject: "math", group: "calculus", name: "Riemann Sum", description: "Rectangular area approximations.", icon: "bars" },
  { id: "math.slope-fields", subject: "math", group: "calculus", name: "Slope Fields", description: "Differential equation slope fields.", icon: "flow" },
  { id: "math.limit-asymptote", subject: "math", group: "calculus", name: "Limits & Asymptotes", description: "Evaluate limits visually.", icon: "trend" },
  { id: "math.series-convergence", subject: "math", group: "calculus", name: "Series Convergence", description: "Check sequence/series convergence.", icon: "series" },
  { id: "math.fourier", subject: "math", group: "calculus", name: "Fourier Synthesizer", description: "Wave synthesis from series.", icon: "wave" },
  { id: "math.geometric-net-3d", subject: "math", group: "geometry", name: "3D Geometric Net", description: "Fold 2D nets into solids.", icon: "box" },
  { id: "math.unit-circle", subject: "math", group: "geometry", name: "Unit Circle", description: "Trig on the unit circle.", icon: "circle" },
  { id: "math.vector-visualizer", subject: "math", group: "geometry", name: "Vector Products", description: "Cross/dot product visuals.", icon: "vector" },
  { id: "math.polar-graph", subject: "math", group: "geometry", name: "Polar Grapher", description: "Polar coordinate graphs.", icon: "polar" },
  { id: "math.conic-fitter", subject: "math", group: "geometry", name: "Conic Auto-Fitter", description: "Fit circle/ellipse/parabola/hyperbola.", icon: "ellipse" },
  { id: "math.voronoi", subject: "math", group: "geometry", name: "Voronoi Diagram", description: "Generate Voronoi partitions.", icon: "map" },
  { id: "math.stats-curve", subject: "math", group: "stats", name: "Stats Curve", description: "Scatter + best fit.", icon: "scatter" },
  { id: "math.polynomial-roots", subject: "math", group: "stats", name: "Polynomial Roots", description: "Visual root intersections.", icon: "roots" },
  { id: "math.theorem-proof", subject: "math", group: "advanced-math", name: "Theorem Proof", description: "Guided classic proofs.", icon: "book" },
  { id: "math.fractal", subject: "math", group: "advanced-math", name: "Fractal Generator", description: "Interactive fractals.", icon: "fractal" },
  { id: "math.eigenvector-3d", subject: "math", group: "advanced-math", name: "Eigenvector 3D", description: "3D linear transformations.", icon: "3d" },
  { id: "math.graph-theory", subject: "math", group: "advanced-math", name: "Graph Theory Matrix", description: "Node/edge adjacency builder.", icon: "nodes" },
  { id: "math.rsa", subject: "math", group: "advanced-math", name: "RSA Walkthrough", description: "Step-by-step cryptography.", icon: "lock" },
  { id: "math.laplace", subject: "math", group: "advanced-math", name: "Laplace Transform", description: "Step visualizer.", icon: "laplace" },
  { id: "math.z-transform", subject: "math", group: "advanced-math", name: "Z-Transform", description: "Discrete transform mapper.", icon: "z" },
  { id: "math.complex-plane", subject: "math", group: "advanced-math", name: "Argand Diagram", description: "Complex plane mapper.", icon: "complex" },
  { id: "math.non-euclidean", subject: "math", group: "geometry", name: "Non-Euclidean Sphere", description: "Spherical geometry canvas.", icon: "globe" },
  { id: "math.kinematic-linker", subject: "math", group: "calculus", name: "Kinematic Graph Linker", description: "Link motion equations to graphs.", icon: "link" },

  // Physics — 30
  { id: "physics.force-decomposition", subject: "physics", group: "mechanics", name: "Force Decomposition", description: "Fx / Fy components.", icon: "force" },
  { id: "physics.trajectory", subject: "physics", group: "mechanics", name: "Trajectory Predictor", description: "Projectile + air resistance.", icon: "orbit" },
  { id: "physics.collision", subject: "physics", group: "mechanics", name: "Collision Simulator", description: "Elastic/inelastic outcomes.", icon: "bounce" },
  { id: "physics.free-body", subject: "physics", group: "mechanics", name: "Free-Body Diagram", description: "Auto FBD generator.", icon: "fbd" },
  { id: "physics.pendulum", subject: "physics", group: "mechanics", name: "Pendulum Animator", description: "SHM for pendulums.", icon: "pendulum" },
  { id: "physics.hookes-law", subject: "physics", group: "mechanics", name: "Hooke's Law", description: "Spring oscillator.", icon: "spring" },
  { id: "physics.torque", subject: "physics", group: "mechanics", name: "Torque & Inertia", description: "Pivot / rotational simulator.", icon: "torque" },
  { id: "physics.center-mass", subject: "physics", group: "mechanics", name: "Center of Mass", description: "Locate CoM in 2D/3D.", icon: "com" },
  { id: "physics.gyroscope", subject: "physics", group: "mechanics", name: "Gyroscope Precession", description: "Precession simulator.", icon: "gyro" },
  { id: "physics.kepler", subject: "physics", group: "mechanics", name: "Kepler Orbits", description: "Planetary orbit simulator.", icon: "planet" },
  { id: "physics.energy-bars", subject: "physics", group: "waves-energy", name: "Energy Bars", description: "KE vs PE live charts.", icon: "energy" },
  { id: "physics.standing-wave", subject: "physics", group: "waves-energy", name: "Standing Waves", description: "String harmonic simulator.", icon: "string" },
  { id: "physics.doppler", subject: "physics", group: "waves-energy", name: "Doppler Effect", description: "Sound wave animator.", icon: "sound" },
  { id: "physics.fluid", subject: "physics", group: "waves-energy", name: "Fluid Streamlines", description: "Streamline visualizer.", icon: "fluid" },
  { id: "physics.bernoulli", subject: "physics", group: "waves-energy", name: "Bernoulli Pipe Flow", description: "Pipe flow analyzer.", icon: "pipe" },
  { id: "physics.thermo-phase", subject: "physics", group: "waves-energy", name: "Phase Diagram", description: "Thermodynamics mapper.", icon: "phase" },
  { id: "physics.carnot", subject: "physics", group: "waves-energy", name: "Carnot PV Diagram", description: "Heat engine grapher.", icon: "engine" },
  { id: "physics.archimedes", subject: "physics", group: "waves-energy", name: "Buoyancy Tank", description: "Archimedes simulator.", icon: "buoyancy" },
  { id: "physics.circuit-sim", subject: "physics", group: "em-optics", name: "Circuit Simulator", description: "Schematic fix + current live.", icon: "circuit" },
  { id: "physics.ray-optics", subject: "physics", group: "em-optics", name: "Ray Optics", description: "Lenses and mirrors.", icon: "lens" },
  { id: "physics.coulomb-field", subject: "physics", group: "em-optics", name: "Coulomb Field", description: "Electric field mapper.", icon: "field" },
  { id: "physics.magnetic-flux", subject: "physics", group: "em-optics", name: "Magnetic Flux 3D", description: "Flux line renderer.", icon: "magnet" },
  { id: "physics.faraday", subject: "physics", group: "em-optics", name: "Faraday Induction", description: "Induction simulator.", icon: "induction" },
  { id: "physics.snell", subject: "physics", group: "em-optics", name: "Snell's Law Tank", description: "Refraction tank.", icon: "refract" },
  { id: "physics.blackbody", subject: "physics", group: "modern-physics", name: "Blackbody Curve", description: "Radiation curve generator.", icon: "curve" },
  { id: "physics.bohr", subject: "physics", group: "modern-physics", name: "Bohr Model", description: "Electron transitions.", icon: "atom" },
  { id: "physics.decay", subject: "physics", group: "modern-physics", name: "Radioactive Decay", description: "Half-life grapher.", icon: "decay" },
  { id: "physics.double-slit", subject: "physics", group: "modern-physics", name: "Double-Slit", description: "Interference animator.", icon: "slit" },
  { id: "physics.time-dilation", subject: "physics", group: "modern-physics", name: "Time Dilation", description: "Relativistic clocks.", icon: "clock" },
  { id: "physics.feynman", subject: "physics", group: "modern-physics", name: "Feynman Snapper", description: "Auto-snap Feynman diagrams.", icon: "feynman" },

  // Chemistry — 30
  { id: "chemistry.equation-balancer", subject: "chemistry", group: "stoichiometry", name: "Equation Balancer", description: "Balance chemical equations.", icon: "balance" },
  { id: "chemistry.stoichiometry", subject: "chemistry", group: "stoichiometry", name: "Stoichiometry", description: "Limiting reagent & yield.", icon: "yield" },
  { id: "chemistry.molarity", subject: "chemistry", group: "stoichiometry", name: "Molarity Solver", description: "C1V1 = C2V2 dilutions.", icon: "molarity" },
  { id: "chemistry.redox", subject: "chemistry", group: "stoichiometry", name: "Redox Splitter", description: "Half-reaction balancer.", icon: "redox" },
  { id: "chemistry.solubility", subject: "chemistry", group: "stoichiometry", name: "Solubility Rules", description: "Precipitate drop reactions.", icon: "precip" },
  { id: "chemistry.molecule-3d", subject: "chemistry", group: "structure", name: "3D Molecule Viewer", description: "VSEPR ball-and-stick.", icon: "molecule" },
  { id: "chemistry.lewis-structure", subject: "chemistry", group: "structure", name: "Lewis Structure", description: "Auto Lewis dots.", icon: "lewis" },
  { id: "chemistry.vsepr-angles", subject: "chemistry", group: "structure", name: "VSEPR Angles", description: "Bond angle measurer.", icon: "angle" },
  { id: "chemistry.hybridization", subject: "chemistry", group: "structure", name: "Hybridization", description: "sp / sp2 / sp3 highlighter.", icon: "hybrid" },
  { id: "chemistry.dipole", subject: "chemistry", group: "structure", name: "Bond Polarity", description: "Dipole vector visualizer.", icon: "dipole" },
  { id: "chemistry.electron-config", subject: "chemistry", group: "structure", name: "Electron Config", description: "s p d f builder.", icon: "config" },
  { id: "chemistry.crystal-lattice", subject: "chemistry", group: "structure", name: "Crystal Lattice", description: "FCC/BCC/SC viewer.", icon: "crystal" },
  { id: "chemistry.periodic-table", subject: "chemistry", group: "structure", name: "Periodic Table", description: "Element property extractor.", icon: "table" },
  { id: "chemistry.titration", subject: "chemistry", group: "equilibrium", name: "Titration Curve", description: "Acid-base titration.", icon: "titration" },
  { id: "chemistry.enthalpy", subject: "chemistry", group: "equilibrium", name: "Enthalpy Profile", description: "Exo/endothermic profiles.", icon: "enthalpy" },
  { id: "chemistry.hess", subject: "chemistry", group: "equilibrium", name: "Hess's Law", description: "Step enthalpy adder.", icon: "hess" },
  { id: "chemistry.kinetics", subject: "chemistry", group: "equilibrium", name: "Reaction Kinetics", description: "Rate grapher.", icon: "kinetics" },
  { id: "chemistry.le-chatelier", subject: "chemistry", group: "equilibrium", name: "Le Chatelier", description: "Equilibrium slider.", icon: "equil" },
  { id: "chemistry.buffer", subject: "chemistry", group: "equilibrium", name: "Buffer Capacity", description: "pH buffer grapher.", icon: "buffer" },
  { id: "chemistry.ideal-gas", subject: "chemistry", group: "equilibrium", name: "Ideal Gas Piston", description: "PV=nRT simulator.", icon: "gas" },
  { id: "chemistry.galvanic", subject: "chemistry", group: "equilibrium", name: "Galvanic Cell", description: "Voltaic voltmeter sim.", icon: "cell" },
  { id: "chemistry.nuclear-binding", subject: "chemistry", group: "equilibrium", name: "Nuclear Binding", description: "Binding energy calculator.", icon: "nuclear" },
  { id: "chemistry.functional-groups", subject: "chemistry", group: "organic", name: "Functional Groups", description: "Identify organic groups.", icon: "organic" },
  { id: "chemistry.isomers", subject: "chemistry", group: "organic", name: "Isomer Generator", description: "Stereo/structural isomers.", icon: "isomer" },
  { id: "chemistry.polymer", subject: "chemistry", group: "organic", name: "Polymerization", description: "Chain animator.", icon: "polymer" },
  { id: "chemistry.peptide", subject: "chemistry", group: "organic", name: "Peptide Folder", description: "Amino acid secondary structure.", icon: "peptide" },
  { id: "chemistry.spectral", subject: "chemistry", group: "analytical", name: "Emission Lines", description: "Spectral chart generator.", icon: "spectrum" },
  { id: "chemistry.mass-spec", subject: "chemistry", group: "analytical", name: "Mass Spec Peaks", description: "Peak analyzer.", icon: "ms" },
  { id: "chemistry.nmr", subject: "chemistry", group: "analytical", name: "NMR Predictor", description: "Shift predictor chart.", icon: "nmr" },
  { id: "chemistry.tlc", subject: "chemistry", group: "analytical", name: "TLC Simulator", description: "Thin-layer chromatography.", icon: "tlc" },
];

export function featuresForSubject(subject: Subject): AiFeatureMeta[] {
  return AI_FEATURES.filter((f) => f.subject === subject);
}

export function featuresByGroup(subject: Subject) {
  const groups = AI_FEATURE_GROUPS[subject];
  return groups.map((g) => ({
    ...g,
    features: AI_FEATURES.filter((f) => f.subject === subject && f.group === g.id),
  }));
}
