# HyperBoard Studio - Master Cursor AI Blueprint

**To the AI Assistant (Cursor):**
Act as a Principal Software Engineer, UI/UX Expert, and AI Solutions Architect. My goal is to build an industry-leading, AI-powered interactive blackboard platform named **HyperBoard Studio**. It is designed for STEM teachers (Math, Physics, Chemistry) at schools and universities. 

**Execution Instructions for Cursor:**
1. Read this entire blueprint carefully.
2. First, output a step-by-step execution plan for the monorepo setup, core architecture, and feature rollout. Ask for my confirmation.
3. Once I say "proceed", write the complete, production-ready code file by file. Do not give me partial snippets or placeholder comments. Implement the full setup.

---

## 1. Project Architecture & Tech Stack
*   **Monorepo:** Turborepo using `pnpm`.
*   **Frontend (Apps: `web`, `console`):** Next.js (App Router), Tailwind CSS, TypeScript. Modern, Excalidraw-like UI.
*   **Backend (App: `api`):** Elysia.js + Bun (high performance, TypeScript native).
*   **Database:** MongoDB (via Mongoose or native driver).
*   **Storage / Vectors:** Cloudflare R2.
*   **Icons:** Saxicons (`saxicons-io`) or Lucide-react for a modern aesthetic.
*   **AI Engine:** OpenAI API for context, coupled with modular AI feature handlers.

---

## 2. Core Platform Features & UI/UX
*   **Authentication:** Google OAuth ONLY (super simple, one-click login).
*   **Onboarding:** A simple 2-step process asking crucial user setup questions, then dumping them straight into the interactive desk/board.
*   **Internationalization:** 3 Languages: English, Russian, Kazakh.
*   **Auto-Save & History:** 
    *   The board auto-saves every 5 seconds to the database. 
    *   Past sessions are saved like a database history, searchable by content, showing what the user did and created.
*   **Canvas & Contextual Menus:** 
    *   The board should be super advanced, capable of 3D rendering.
    *   A top-level dropdown selects the subject: **Math, Physics, or Chemistry**.
    *   *Crucial UX Rule:* Do not clutter the screen with 90 buttons. Features must be **Contextual**. When a user selects a drawn object, text, or equation, a floating popup menu appears with the specific AI features relevant to that subject and selection.
    *   Standard features (color changing, undo, redo, pen size) are default floating tools.

---

## 3. UI Color Palette (Light & Dark Mode)
The app must strictly adhere to this exact color scheme using Tailwind variables:

**Dark Mode (The Tech/Deep Classroom Vibe):**
*   Background Primary: `#0B0F19`
*   Surface/Cards: `#111827`
*   Brand Accent: `#4F46E5` (Electric Indigo)
*   Text: `#F9FAFB` (Primary), `#9CA3AF` (Secondary)
*   Subject Accents: Math (`#10B981`), Physics (`#06B6D4`), Chemistry (`#F59E0B`)

**Light Mode (The Clean Academic Vibe):**
*   Background Primary: `#F8FAFC`
*   Surface/Cards: `#FFFFFF` (with soft shadow: `box-shadow: 0 4px 20px -2px rgba(0,0,0,0.05)`)
*   Brand Accent: `#4F46E5`
*   Text: `#0F172A` (Primary), `#64748B` (Secondary)
*   Subject Accents: Math (`#059669`), Physics (`#0284C7`), Chemistry (`#D97706`)

---

## 4. The 90 Advanced AI Features Matrix
*Build modular API routes in the backend for each of these features (`api/src/ai/math`, `api/src/ai/physics`, etc.) and corresponding frontend context triggers.*

### 📐 Mathematics (30 Features)
1. Instant Handwriting-to-LaTeX & Graph Render
2. Step-by-Step Equation Solver
3. Derivative & Integral Visualizer (Shades area under curve)
4. Matrix Operations & Determinant Solver
5. Interactive 3D Geometric Net Folding (2D to 3D)
6. Theorem Proof Assistant (Pythagorean, Thales, etc.)
7. Word Problem to Mathematical Model Translator
8. Probability & Statistics Curve Generator (Scatter + Best Fit)
9. Trigonometric Unit Circle Animator
10. Math Error Highlighter (Finds arithmetic/sign errors in steps)
11. Polynomial Root Finder (Visual intersections)
12. Vector Cross/Dot Product Visualizer
13. Polar Coordinate Grapher
14. Differential Equation Slope Fields
15. Interactive Fractal Generator
16. Riemann Sum Visualizer (Rectangular area approximations)
17. Conic Section Auto-Fitter (Circle, Ellipse, Parabola, Hyperbola)
18. Limit Evaluator & Visual Asymptote Grapher
19. Sequence & Series Convergence Checker
20. Eigenvector 3D Transformation Visualizer
21. Boolean Algebra Logic Gate Builder
22. Cryptography RSA Step-by-Step Generator
23. Graph Theory Node & Edge Matrix Builder
24. Voronoi Diagram Generator
25. Fourier Series Wave Synthesizer
26. Laplace Transform Step Visualizer
27. Z-Transform Mapper
28. Complex Plane (Argand Diagram) Mapper
29. Non-Euclidean Geometry Sphere Canvas
30. Kinematic Equation Graph Linker

### ⚡ Physics (30 Features)
31. Vector Force Decomposition ($F_x, F_y$)
32. Kinematic Trajectory Predictor with Air Resistance
33. Circuit Schematic Auto-Fixer & Live Current Simulator
34. Pendulum & Harmonic Motion Animator
35. Optical Ray Tracing (Lenses, Mirrors, Focal Points)
36. Fluid Dynamics Streamline Visualizer
37. Thermodynamics Phase Diagram Mapper
38. Magnetic Field 3D Flux Line Renderer
39. Elastic/Inelastic Collision Simulator
40. Energy Conservation Live Bar Charts (Kinetic vs Potential)
41. Free Body Diagram Auto-Generator
42. Doppler Effect Sound Wave Animator
43. Kepler's Laws Planetary Orbit Simulator
44. Bernoulli's Equation Pipe Flow Analyzer
45. Coulomb's Law Electric Field Mapper
46. Quantum Double-Slit Interference Animator
47. Radioactive Decay Curve & Half-Life Grapher
48. Spring Hooke's Law Oscillator
49. Carnot Engine PV Diagram Grapher
50. Faraday's Law Induction Simulator
51. Snell's Law Refraction Tank
52. Torque and Rotational Inertia Pivot Simulator
53. Archimedes Buoyancy Liquid Tank
54. Relativistic Time Dilation Clock Simulator
55. Blackbody Radiation Curve Generator
56. Bohr Model Electron Transition Visualizer
57. Center of Mass Auto-Locator for 2D/3D objects
58. Gyroscope Precession Simulator
59. Standing Wave Harmonic String Simulator
60. Feynman Diagram Auto-Snapper

### 🧪 Chemistry (30 Features)
61. Automatic Chemical Equation Balancer
62. 3D Molecular Structure Viewer (VSEPR Ball-and-Stick)
63. Stoichiometry Yield & Limiting Reagent Calculator
64. Interactive Periodic Table Property Extractor
65. Acid-Base Titration Curve Generator
66. Redox Half-Reaction Splitter & Balancer
67. Organic Functional Group Identifier
68. Solution Concentration & Molarity Solver ($C_1V_1=C_2V_2$)
69. Enthalpy & Reaction Energy Profile (Exo/Endothermic)
70. Stereoisomer & Structural Isomer Generator
71. Electron Configuration Builder (s, p, d, f)
72. Lewis Dot Structure Auto-Drawer
73. Bond Polarity & Dipole Vector Visualizer
74. Ideal Gas Law ($PV=nRT$) Piston Simulator
75. Hess's Law Step Adder
76. Reaction Rate Kinetics Grapher
77. Le Chatelier's Equilibrium Slider
78. Nuclear Binding Energy Calculator
79. Galvanic/Voltaic Cell Voltmeter Simulator
80. Polymerization Chain Animator
81. Spectral Emission Lines Chart Generator
82. Mass Spectrometry Peak Analyzer
83. NMR Shift Predictor Chart
84. Thin Layer Chromatography (TLC) Simulator
85. VSEPR Bond Angle Measurer
86. Crystal Lattice Unit Cell (FCC/BCC/SC) Viewer
87. Hybridization ($sp, sp^2, sp^3$) Highlighter
88. Solubility Rules Precipitator (Drop reactions)
89. pH Buffer Capacity Grapher
90. Amino Acid Peptide Bond Folder (Protein Secondary Structure)

---

## 5. Folder Structure & Environment Variables
**Root: `my-ai-blackboard/`**
*   `package.json` (pnpm workspace)
*   `pnpm-workspace.yaml`

**Web App (`apps/web`):**
*   Requires: `.env.local`
    *   `NEXT_PUBLIC_API_URL=http://localhost:3001`
    *   `NEXT_PUBLIC_GOOGLE_CLIENT_ID=...`

**API App (`apps/api`):**
*   Requires: `.env`
    *   `PORT=3001`
    *   `MONGODB_URI=...`
    *   `OPENAI_API_KEY=...`
    *   `CLOUDFLARE_R2_ENDPOINT=...`
    *   `CLOUDFLARE_R2_ACCESS_KEY_ID=...`
    *   `CLOUDFLARE_R2_SECRET_ACCESS_KEY=...`
    *   `CLOUDFLARE_R2_BUCKET_NAME=...`

**Admin Console App (`apps/console`):**
*   Requires: `.env.local`
    *   `NEXT_PUBLIC_API_URL=http://localhost:3001`
    *   `ADMIN_SECRET_KEY=...`

**Startup Command:** `pnpm run dev` from the root should start all 3 services concurrently.

---
**Cursor, please acknowledge you have read the HyperBoard Studio blueprint and provide the initial Step-by-Step execution plan before generating the code.**
