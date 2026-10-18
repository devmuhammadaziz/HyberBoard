export type Subject = "math" | "physics" | "chemistry";
export type Locale = "en" | "ru" | "kk";
export type ThemeMode = "light" | "dark";
export * from "./fonts";
export * from "./ai-features";
import type { BoardFont } from "./fonts";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  locale: Locale;
  theme: ThemeMode;
  subjects: Subject[];
  institution?: string;
  role?: "teacher" | "professor" | "tutor" | "student";
  onboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingPayload {
  subjects: Subject[];
  institution?: string;
  role: "teacher" | "professor" | "tutor" | "student";
  locale: Locale;
}

export type BoardTool =
  | "select"
  | "pen"
  | "eraser"
  | "text"
  | "rect"
  | "ellipse"
  | "line"
  | "arrow"
  | "hand";

export interface Point {
  x: number;
  y: number;
}

export interface BoardStrokeStyle {
  color: string;
  width: number;
  opacity: number;
  font?: BoardFont;
  fontSize?: number;
  dash?: "solid" | "dashed";
}

export type BoardElementType =
  | "path"
  | "rect"
  | "ellipse"
  | "line"
  | "arrow"
  | "text"
  | "equation"
  | "ai-result"
  | "graph";

export interface PlotVector {
  x: number;
  y: number;
  label?: string;
  color?: string;
  /** If set, vector starts at this point instead of the origin. */
  from?: { x: number; y: number };
}

export interface PlotPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
}

export interface PlotCurve {
  /** Dense polyline samples in math coordinates */
  points: Array<{ x: number; y: number }>;
  label?: string;
  color?: string;
  /** Original expression, e.g. "x^2 - 4x + 3" */
  expression?: string;
}

export interface PlotSurface3D {
  /** Flattened samples for a wireframe surface */
  samples: Array<{ x: number; y: number; z: number }>;
  expression?: string;
  label?: string;
  color?: string;
  resolution?: number;
}

export type PlotFunctionType =
  | "polynomial"
  | "trigonometric"
  | "rational"
  | "exponential"
  | "implicit"
  | "vector"
  | "points"
  | "surface3d"
  | "unknown";

/** Strict OCR / expression payload — never contains sampled coordinates from the LLM. */
export interface PlotExpressionSpec {
  rawLatex?: string;
  normalizedExpression: string;
  variable?: "x" | "y";
  functionType?: PlotFunctionType;
  suggestedDomain?: [number, number];
  mode?: "2d" | "3d";
  title?: string;
}

export interface PlotCriticalPoint {
  x: number;
  y: number;
  kind: "root" | "y-intercept" | "extrema" | "vertex" | "point";
  label?: string;
}

export interface PlotData {
  kind?: "cartesian" | "cartesian3d";
  title?: string;
  mode?: "2d" | "3d";
  /** Source expression(s) — frontend samples these with mathjs */
  expressionSpec?: PlotExpressionSpec;
  /** Function curves (parabola, sine, etc.) — always client-sampled */
  curves?: PlotCurve[];
  vectors?: PlotVector[];
  points?: PlotPoint[];
  criticalPoints?: PlotCriticalPoint[];
  /** Axis of symmetry x = c (quadratics) */
  symmetryX?: number;
  /** 3D surface samples */
  surface?: PlotSurface3D;
  /** Optional RHS expressions the client can re-sample */
  expressions?: string[];
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  zMin?: number;
  zMax?: number;
  /** Locked 1:1 pixels-per-unit (canvas display hint) */
  pixelsPerUnit?: number;
  autoFit?: boolean;
}

export interface BoardElement {
  id: string;
  type: BoardElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: Point[];
  text?: string;
  latex?: string;
  rotation?: number;
  style: BoardStrokeStyle;
  subject?: Subject;
  featureId?: string;
  meta?: Record<string, unknown> & { plot?: PlotData };
  createdAt: number;
  updatedAt: number;
}

export interface BoardDocument {
  id: string;
  userId: string;
  title: string;
  subject: Subject;
  elements: BoardElement[];
  viewport: { x: number; y: number; zoom: number };
  deleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionHistoryEntry {
  id: string;
  userId: string;
  boardId: string;
  title: string;
  subject: Subject;
  summary: string;
  searchableText: string;
  elementCount: number;
  thumbnailUrl?: string;
  status?: "active" | "deleted";
  createdAt: string;
  updatedAt: string;
}

export interface AiRequest {
  featureId: string;
  subject: Subject;
  input: string;
  locale?: Locale;
  selection?: {
    elementIds: string[];
    text?: string;
    latex?: string;
  };
  boardContext?: {
    boardId?: string;
    title?: string;
  };
}

export interface AiResponse {
  featureId: string;
  title: string;
  explanation: string;
  latex?: string;
  steps?: string[];
  visualization?: {
    type: "graph" | "chart" | "3d" | "diagram" | "table" | "text";
    data: Record<string, unknown>;
  };
  boardPatch?: Partial<BoardElement>[];
  raw?: string;
}
