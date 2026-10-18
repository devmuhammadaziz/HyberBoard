import { nanoid } from "nanoid";
import type {
  BoardElement,
  BoardFont,
  BoardStrokeStyle,
  Point,
} from "@smart-desk/types";

export function createId() {
  return nanoid(10);
}

export function defaultStyle(
  color = "#4F46E5",
  font: BoardFont = "inter"
): BoardStrokeStyle {
  return { color, width: 2.5, opacity: 1, font, dash: "solid" };
}

export function createPathElement(
  points: Point[],
  style: BoardStrokeStyle
): BoardElement {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const now = Date.now();
  return {
    id: createId(),
    type: "path",
    x: minX,
    y: minY,
    width: Math.max(...xs) - minX,
    height: Math.max(...ys) - minY,
    points: points.map((p) => ({ x: p.x - minX, y: p.y - minY })),
    style,
    createdAt: now,
    updatedAt: now,
  };
}

export function estimateTextSize(text: string, fontSize: number) {
  // Rough glyph metrics — good enough for bounds / hit-testing
  const lines = text.split("\n");
  const longest = Math.max(...lines.map((l) => l.length), 1);
  return {
    width: Math.max(fontSize * 0.55 * longest, fontSize * 0.7),
    height: fontSize * (1.15 * lines.length),
  };
}

/** Match answer type size to the ink / selection height (Math Notes feel). */
export function answerFontSizeFromBounds(height: number) {
  // Sit near the visual height of handwritten digits
  return Math.round(Math.min(240, Math.max(32, height * 0.88)));
}

export function createTextElement(
  x: number,
  y: number,
  text: string,
  style: BoardStrokeStyle
): BoardElement {
  const now = Date.now();
  const fontSize = style.fontSize ?? 18;
  const size = estimateTextSize(text, fontSize);
  return {
    id: createId(),
    type: "text",
    x,
    y,
    width: size.width,
    height: size.height,
    text,
    style: { ...style, fontSize },
    createdAt: now,
    updatedAt: now,
  };
}

export function createShapeElement(
  type: "rect" | "ellipse" | "line" | "arrow",
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  style: BoardStrokeStyle
): BoardElement {
  const now = Date.now();
  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  const width = Math.abs(x2 - x1) || 1;
  const height = Math.abs(y2 - y1) || 1;
  return {
    id: createId(),
    type,
    x,
    y,
    width,
    height,
    points:
      type === "line" || type === "arrow"
        ? [
            { x: x1 - x, y: y1 - y },
            { x: x2 - x, y: y2 - y },
          ]
        : undefined,
    style,
    createdAt: now,
    updatedAt: now,
  };
}

export function createAiResultElement(
  x: number,
  y: number,
  title: string,
  body: string,
  latex: string | undefined,
  featureId: string,
  subject: BoardElement["subject"],
  style: BoardStrokeStyle
): BoardElement {
  const now = Date.now();
  return {
    id: createId(),
    type: "ai-result",
    x,
    y,
    width: 380,
    height: 200,
    text: `${title}\n\n${body}`,
    latex,
    featureId,
    subject,
    style: { ...style, color: style.color || "#4F46E5" },
    meta: { title, body },
    createdAt: now,
    updatedAt: now,
  };
}

export function getBounds(el: BoardElement) {
  if (el.type === "text" || el.type === "ai-result") {
    const fontSize = el.style.fontSize ?? (el.type === "ai-result" ? 22 : 16);
    const text = el.latex || el.text || "";
    const size = estimateTextSize(text, fontSize);
    return {
      x: el.x,
      y: el.y,
      width: Math.max(el.width ?? size.width, size.width),
      height: Math.max(el.height ?? size.height, size.height),
    };
  }
  const w = Math.max(el.width ?? 40, 8);
  const h = Math.max(el.height ?? 40, 8);
  return { x: el.x, y: el.y, width: w, height: h };
}

export function hitTest(el: BoardElement, x: number, y: number) {
  const b = getBounds(el);
  return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
}

export function selectionBounds(elements: BoardElement[]) {
  if (!elements.length) return null;
  const boxes = elements.map(getBounds);
  const minX = Math.min(...boxes.map((b) => b.x));
  const minY = Math.min(...boxes.map((b) => b.y));
  const maxX = Math.max(...boxes.map((b) => b.x + b.width));
  const maxY = Math.max(...boxes.map((b) => b.y + b.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function pointsToPath(points: Point[], originX: number, originY: number) {
  if (!points.length) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${originX + p.x} ${originY + p.y}`)
    .join(" ");
}

export function moveElements(
  elements: BoardElement[],
  ids: string[],
  dx: number,
  dy: number
) {
  return elements.map((el) =>
    ids.includes(el.id)
      ? { ...el, x: el.x + dx, y: el.y + dy, updatedAt: Date.now() }
      : el
  );
}

export type ResizeCorner = "nw" | "ne" | "sw" | "se";

export function cornerPoint(
  b: { x: number; y: number; width: number; height: number },
  corner: ResizeCorner
): Point {
  switch (corner) {
    case "nw":
      return { x: b.x, y: b.y };
    case "ne":
      return { x: b.x + b.width, y: b.y };
    case "sw":
      return { x: b.x, y: b.y + b.height };
    case "se":
      return { x: b.x + b.width, y: b.y + b.height };
  }
}

export function oppositeCorner(corner: ResizeCorner): ResizeCorner {
  switch (corner) {
    case "nw":
      return "se";
    case "ne":
      return "sw";
    case "sw":
      return "ne";
    case "se":
      return "nw";
  }
}

/** Scale selected elements around a fixed origin (usually the opposite corner). */
export function scaleElements(
  elements: BoardElement[],
  ids: string[],
  origin: Point,
  sx: number,
  sy: number
): BoardElement[] {
  const now = Date.now();
  const strokeScale = Math.max(0.15, (Math.abs(sx) + Math.abs(sy)) / 2);

  return elements.map((el) => {
    if (!ids.includes(el.id)) return el;

    const mapAbs = (p: Point): Point => ({
      x: origin.x + (p.x - origin.x) * sx,
      y: origin.y + (p.y - origin.y) * sy,
    });

    if (el.type === "path" && el.points?.length) {
      const scaled = el.points.map((p) =>
        mapAbs({ x: el.x + p.x, y: el.y + p.y })
      );
      const xs = scaled.map((p) => p.x);
      const ys = scaled.map((p) => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      return {
        ...el,
        x: minX,
        y: minY,
        width: Math.max(...xs) - minX,
        height: Math.max(...ys) - minY,
        points: scaled.map((p) => ({ x: p.x - minX, y: p.y - minY })),
        style: {
          ...el.style,
          width: Math.max(0.5, el.style.width * strokeScale),
        },
        updatedAt: now,
      };
    }

    if (el.type === "text" || el.type === "ai-result") {
      const fontSize = Math.max(
        8,
        (el.style.fontSize ?? 18) * strokeScale
      );
      const topLeft = mapAbs({ x: el.x, y: el.y });
      const size = estimateTextSize(el.latex || el.text || "", fontSize);
      return {
        ...el,
        x: topLeft.x,
        y: topLeft.y,
        width: size.width,
        height: size.height,
        style: { ...el.style, fontSize },
        updatedAt: now,
      };
    }

    const tl = mapAbs({ x: el.x, y: el.y });
    const br = mapAbs({
      x: el.x + (el.width || 0),
      y: el.y + (el.height || 0),
    });
    const x = Math.min(tl.x, br.x);
    const y = Math.min(tl.y, br.y);
    const width = Math.max(Math.abs(br.x - tl.x), 1);
    const height = Math.max(Math.abs(br.y - tl.y), 1);

    let points = el.points;
    if (points?.length) {
      const scaled = points.map((p) =>
        mapAbs({ x: el.x + p.x, y: el.y + p.y })
      );
      points = scaled.map((p) => ({ x: p.x - x, y: p.y - y }));
    }

    return {
      ...el,
      x,
      y,
      width,
      height,
      points,
      style: {
        ...el.style,
        width: Math.max(0.5, el.style.width * strokeScale),
      },
      updatedAt: now,
    };
  });
}

function dist(a: Point, b: Point) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function pointNearBounds(
  el: BoardElement,
  pt: Point,
  radius: number
) {
  const b = getBounds(el);
  const nearestX = Math.max(b.x, Math.min(pt.x, b.x + b.width));
  const nearestY = Math.max(b.y, Math.min(pt.y, b.y + b.height));
  return dist(pt, { x: nearestX, y: nearestY }) <= radius;
}

/** Split absolute points into contiguous segments (gaps where eraser removed points). */
function splitSegments(points: Point[], maxGap: number): Point[][] {
  if (!points.length) return [];
  const segments: Point[][] = [];
  let current: Point[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    if (dist(points[i], points[i - 1]) > maxGap) {
      if (current.length >= 2) segments.push(current);
      current = [points[i]];
    } else {
      current.push(points[i]);
    }
  }
  if (current.length >= 2) segments.push(current);
  return segments;
}

/**
 * Real rubber: wipe path points inside the brush, delete shapes/text when brush overlaps.
 */
export function eraseAtPoint(
  elements: BoardElement[],
  pt: Point,
  radius: number
): BoardElement[] {
  const out: BoardElement[] = [];
  const now = Date.now();

  for (const el of elements) {
    if (el.type === "path" && el.points?.length) {
      const absolute = el.points.map((p) => ({ x: el.x + p.x, y: el.y + p.y }));
      const kept = absolute.filter((p) => dist(p, pt) > radius);
      if (kept.length < 2) continue;

      const segments = splitSegments(kept, radius * 2.5);
      for (const seg of segments) {
        const xs = seg.map((p) => p.x);
        const ys = seg.map((p) => p.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        out.push({
          ...el,
          id: createId(),
          x: minX,
          y: minY,
          width: Math.max(...xs) - minX,
          height: Math.max(...ys) - minY,
          points: seg.map((p) => ({ x: p.x - minX, y: p.y - minY })),
          updatedAt: now,
        });
      }
      continue;
    }

    // Shapes / text / ai-result: remove when brush touches them
    if (pointNearBounds(el, pt, radius)) continue;
    out.push(el);
  }

  return out;
}

export const ERASER_SIZES = [
  { id: "s" as const, label: "S", radius: 10 },
  { id: "m" as const, label: "M", radius: 22 },
  { id: "l" as const, label: "L", radius: 40 },
];

export type EraserSizeId = (typeof ERASER_SIZES)[number]["id"];

/** Sample along a drag so fast strokes still wipe cleanly. */
export function eraseAlongStroke(
  elements: BoardElement[],
  from: Point,
  to: Point,
  radius: number
): BoardElement[] {
  const gap = Math.max(radius * 0.35, 4);
  const steps = Math.max(1, Math.ceil(dist(from, to) / gap));
  let current = elements;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    current = eraseAtPoint(
      current,
      {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
      },
      radius
    );
  }
  return current;
}

export function elementsShallowEqual(a: BoardElement[], b: BoardElement[]) {
  if (a.length !== b.length) return false;
  return a.every((el, i) => el === b[i]);
}
