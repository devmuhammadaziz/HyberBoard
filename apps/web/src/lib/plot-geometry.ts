import type { BoardElement, PlotData, PlotPoint, PlotVector } from "@smart-desk/types";
import type { Point } from "@smart-desk/types";

export type GraphHandle =
  | { kind: "point"; index: number }
  | { kind: "vector-start"; index: number }
  | { kind: "vector-end"; index: number };

export function graphLayout(el: BoardElement) {
  const plot = (el.meta?.plot || {}) as PlotData;
  const w = Math.max(el.width || 280, 120);
  const h = Math.max(el.height || 240, 120);
  const pad = 28;
  const xMin = plot.xMin ?? -1;
  const xMax = plot.xMax ?? 1;
  const yMin = plot.yMin ?? -1;
  const yMax = plot.yMax ?? 1;
  const sx = (x: number) =>
    pad + ((x - xMin) / (xMax - xMin || 1)) * (w - pad * 2);
  const sy = (y: number) =>
    h - pad - ((y - yMin) / (yMax - yMin || 1)) * (h - pad * 2);
  return { plot, w, h, pad, xMin, xMax, yMin, yMax, sx, sy };
}

export function screenToPlot(el: BoardElement, world: Point): Point {
  const { w, h, pad, xMin, xMax, yMin, yMax } = graphLayout(el);
  const lx = world.x - el.x;
  const ly = world.y - el.y;
  const x = xMin + ((lx - pad) / (w - pad * 2 || 1)) * (xMax - xMin);
  const y = yMin + ((h - pad - ly) / (h - pad * 2 || 1)) * (yMax - yMin);
  return {
    x: snap(x),
    y: snap(y),
  };
}

function snap(n: number) {
  return Math.round(n * 4) / 4;
}

export function hitGraphHandle(
  el: BoardElement,
  world: Point,
  hitRadius: number
): GraphHandle | null {
  if (el.type !== "graph") return null;
  const { plot, sx, sy } = graphLayout(el);
  const lx = world.x - el.x;
  const ly = world.y - el.y;

  const near = (px: number, py: number) =>
    Math.hypot(lx - px, ly - py) <= hitRadius;

  for (let i = 0; i < (plot.points || []).length; i++) {
    const p = plot.points![i];
    if (near(sx(p.x), sy(p.y))) return { kind: "point", index: i };
  }

  for (let i = 0; i < (plot.vectors || []).length; i++) {
    const v = plot.vectors![i];
    const ox = v.from?.x ?? 0;
    const oy = v.from?.y ?? 0;
    if (near(sx(ox + v.x), sy(oy + v.y)))
      return { kind: "vector-end", index: i };
    if (near(sx(ox), sy(oy))) return { kind: "vector-start", index: i };
  }

  return null;
}

export function applyGraphHandleDrag(
  plot: PlotData,
  handle: GraphHandle,
  math: Point
): PlotData {
  const points = (plot.points || []).map((p) => ({ ...p }));
  const vectors = (plot.vectors || []).map((v) => ({
    ...v,
    from: v.from ? { ...v.from } : undefined,
  }));

  if (handle.kind === "point" && points[handle.index]) {
    const old = points[handle.index];
    points[handle.index] = {
      ...old,
      x: math.x,
      y: math.y,
      label: pointLabel(old, math),
    };
    syncVectorsToPoints(points, vectors);
  }

  if (handle.kind === "vector-end" && vectors[handle.index]) {
    const v = vectors[handle.index];
    const ox = v.from?.x ?? 0;
    const oy = v.from?.y ?? 0;
    vectors[handle.index] = {
      ...v,
      x: math.x - ox,
      y: math.y - oy,
    };
    // Keep paired end point in sync when present
    if (v.from && points.length >= 2) {
      const tipIdx = findPointIndex(points, ox + v.x, oy + v.y) ?? 1;
      points[tipIdx] = {
        ...points[tipIdx],
        x: math.x,
        y: math.y,
        label: pointLabel(points[tipIdx], math),
      };
    } else if (!v.from && points.length === 1) {
      points[0] = {
        ...points[0],
        x: math.x,
        y: math.y,
        label: pointLabel(points[0], math),
      };
    }
  }

  if (handle.kind === "vector-start" && vectors[handle.index]) {
    const v = vectors[handle.index];
    const tipX = (v.from?.x ?? 0) + v.x;
    const tipY = (v.from?.y ?? 0) + v.y;
    if (v.from) {
      vectors[handle.index] = {
        ...v,
        from: { x: math.x, y: math.y },
        x: tipX - math.x,
        y: tipY - math.y,
      };
      const startIdx = findPointIndex(points, v.from.x, v.from.y) ?? 0;
      if (points[startIdx]) {
        points[startIdx] = {
          ...points[startIdx],
          x: math.x,
          y: math.y,
          label: pointLabel(points[startIdx], math),
        };
      }
    } else {
      // Origin-based vector: drag "start" moves whole vector tip relative? treat as moving tip from new origin offset — keep as origin, ignore
      vectors[handle.index] = { ...v, x: math.x, y: math.y };
    }
  }

  return expandRanges({
    ...plot,
    points,
    vectors,
  });
}

function syncVectorsToPoints(points: PlotPoint[], vectors: PlotVector[]) {
  if (points.length >= 2 && vectors[0]?.from) {
    const a = points[0];
    const b = points[1];
    vectors[0] = {
      ...vectors[0],
      from: { x: a.x, y: a.y },
      x: b.x - a.x,
      y: b.y - a.y,
    };
  } else if (points.length === 1 && vectors[0] && !vectors[0].from) {
    vectors[0] = {
      ...vectors[0],
      x: points[0].x,
      y: points[0].y,
    };
  }
}

function findPointIndex(points: PlotPoint[], x: number, y: number) {
  const i = points.findIndex(
    (p) => Math.abs(p.x - x) < 0.01 && Math.abs(p.y - y) < 0.01
  );
  return i >= 0 ? i : null;
}

function pointLabel(old: PlotPoint, math: Point) {
  if (old.label?.startsWith("P")) return old.label;
  return `(${fmt(math.x)}, ${fmt(math.y)})`;
}

function fmt(n: number) {
  return Number.isInteger(n) ? String(n) : String(n);
}

function expandRanges(plot: PlotData): PlotData {
  const xs = [0];
  const ys = [0];
  for (const p of plot.points || []) {
    xs.push(p.x);
    ys.push(p.y);
  }
  for (const v of plot.vectors || []) {
    const ox = v.from?.x ?? 0;
    const oy = v.from?.y ?? 0;
    xs.push(ox, ox + v.x);
    ys.push(oy, oy + v.y);
  }
  const padX = 1;
  const padY = 1;
  return {
    ...plot,
    xMin: Math.min(0, Math.floor(Math.min(...xs)) - padX),
    xMax: Math.max(0, Math.ceil(Math.max(...xs)) + padX),
    yMin: Math.min(0, Math.floor(Math.min(...ys)) - padY),
    yMax: Math.max(0, Math.ceil(Math.max(...ys)) + padY),
  };
}
