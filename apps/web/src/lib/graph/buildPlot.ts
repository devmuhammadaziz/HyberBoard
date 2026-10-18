import type {
  PlotCriticalPoint,
  PlotData,
  PlotExpressionSpec,
  PlotPoint,
  PlotVector,
} from "@smart-desk/types";
import { fitViewport1to1, type GraphFrame } from "./CoordinateSystem";
import {
  sampleFunction,
  compileExpression,
  evalAt,
} from "./FunctionSampler";
import { solveCriticalPoints } from "./CriticalPointsEngine";

export function buildPlotFromExpressionSpec(
  spec: PlotExpressionSpec,
  frame: GraphFrame = { width: 360, height: 320, pad: 28 }
): PlotData | null {
  const expr = (spec.normalizedExpression || "").trim();
  if (!expr) return null;

  if (spec.mode === "3d") {
    return build3d(expr, spec, frame);
  }

  const suggested = spec.suggestedDomain || guessDomain(expr, spec.functionType);
  // Wide scan domain for critical points first
  const scanMin = suggested[0] - 2;
  const scanMax = suggested[1] + 2;
  const { criticalPoints, symmetryX, contentBounds, featureCenter } =
    solveCriticalPoints(expr, scanMin, scanMax);

  // Viewport around key features (vertex / roots / intercepts) — curve may leave the frame
  const padX = 5;
  const padY = 4;
  const content = {
    xMin: Math.min(contentBounds.xMin, featureCenter.x) - padX,
    xMax: Math.max(contentBounds.xMax, featureCenter.x) + padX,
    yMin: Math.min(contentBounds.yMin, featureCenter.y) - padY,
    yMax: Math.max(contentBounds.yMax, featureCenter.y) + padY + 2,
  };

  const { viewport, pixelsPerUnit } = fitViewport1to1(content, frame, 0.75);

  const segments = sampleFunction(
    expr,
    viewport.xMin,
    viewport.xMax,
    viewport.yMin,
    viewport.yMax,
    500
  );

  const curvePoints = segments.flatMap((seg, i) => {
    if (i === 0) return seg;
    // NaN breaker between segments for path builders that don't use multi-path
    return [{ x: seg[0].x, y: Number.NaN }, ...seg];
  });

  const title =
    spec.title ||
    spec.rawLatex ||
    `y = ${expr}`;

  return {
    kind: "cartesian",
    mode: "2d",
    title,
    expressionSpec: spec,
    expressions: [expr],
    curves: [
      {
        points: curvePoints,
        expression: expr,
        label: title.startsWith("y") ? title : `y = ${expr}`,
      },
    ],
    criticalPoints: criticalPoints.filter(
      (p) =>
        p.x >= viewport.xMin &&
        p.x <= viewport.xMax &&
        p.y >= viewport.yMin &&
        p.y <= viewport.yMax
    ),
    symmetryX,
    vectors: [],
    points: [],
    xMin: viewport.xMin,
    xMax: viewport.xMax,
    yMin: viewport.yMin,
    yMax: viewport.yMax,
    pixelsPerUnit,
    autoFit: true,
  };
}

function build3d(
  expr: string,
  spec: PlotExpressionSpec,
  frame: GraphFrame
): PlotData | null {
  const xMin = -2;
  const xMax = 2;
  const yMin = -2;
  const yMax = 2;
  const samples = sampleSurfaceGrid(expr, xMin, xMax, yMin, yMax, 16);
  if (samples.length < 4) return null;
  const zs = samples.map((s) => s.z);
  return {
    kind: "cartesian3d",
    mode: "3d",
    title: spec.title || spec.rawLatex || `z = ${expr}`,
    expressionSpec: spec,
    expressions: [expr],
    surface: {
      samples,
      expression: expr,
      label: `z = ${expr}`,
      resolution: 16,
    },
    xMin,
    xMax,
    yMin,
    yMax,
    zMin: Math.min(...zs) - 0.5,
    zMax: Math.max(...zs) + 0.5,
    pixelsPerUnit: 40,
  };
}

function sampleSurfaceGrid(
  expr: string,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  res: number
) {
  const compiled = compileExpression(expr);
  if (!compiled) return [] as Array<{ x: number; y: number; z: number }>;
  const out: Array<{ x: number; y: number; z: number }> = [];
  for (let i = 0; i <= res; i++) {
    for (let j = 0; j <= res; j++) {
      const x = xMin + ((xMax - xMin) * i) / res;
      const y = yMin + ((yMax - yMin) * j) / res;
      const z = evalAt(compiled, x, { y });
      if (z != null && Math.abs(z) < 1e5) out.push({ x, y, z });
    }
  }
  return out;
}

function guessDomain(
  expr: string,
  type?: string
): [number, number] {
  const e = expr.toLowerCase();
  if (type === "trigonometric" || /sin|cos|tan/.test(e))
    return [-2 * Math.PI, 2 * Math.PI];
  if (type === "exponential" || /exp|e\^/.test(e)) return [-3, 3];
  if (type === "rational" || /\/|log|ln|sqrt/.test(e)) return [-8, 8];
  // polynomial default — will be refined by critical points
  return [-6, 10];
}

/** Build plot from vectors/points without LLM sampling. */
export function buildPlotFromGeometry(input: {
  title?: string;
  points?: PlotPoint[];
  vectors?: PlotVector[];
  frame?: GraphFrame;
}): PlotData | null {
  const points = input.points || [];
  const vectors = input.vectors || [];
  if (!points.length && !vectors.length) return null;

  const xs = [0];
  const ys = [0];
  for (const p of points) {
    xs.push(p.x);
    ys.push(p.y);
  }
  for (const v of vectors) {
    const ox = v.from?.x ?? 0;
    const oy = v.from?.y ?? 0;
    xs.push(ox, ox + v.x);
    ys.push(oy, oy + v.y);
  }

  const frame = input.frame || { width: 320, height: 280, pad: 28 };
  const content = {
    xMin: Math.min(...xs),
    xMax: Math.max(...xs),
    yMin: Math.min(...ys),
    yMax: Math.max(...ys),
  };
  const { viewport, pixelsPerUnit } = fitViewport1to1(content, frame, 1.5);

  const criticalPoints: PlotCriticalPoint[] = points.map((p) => ({
    x: p.x,
    y: p.y,
    kind: "point" as const,
    label: p.label,
  }));

  return {
    kind: "cartesian",
    mode: "2d",
    title: input.title || "Coordinate plane",
    points,
    vectors,
    curves: [],
    criticalPoints,
    xMin: viewport.xMin,
    xMax: viewport.xMax,
    yMin: viewport.yMin,
    yMax: viewport.yMax,
    pixelsPerUnit,
    autoFit: true,
  };
}
