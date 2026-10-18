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
  | "ai-result";

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
  meta?: Record<string, unknown>;
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
