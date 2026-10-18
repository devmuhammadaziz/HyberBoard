import { derivative } from "mathjs";
import type { PlotCriticalPoint } from "@smart-desk/types";
import {
  compileExpression,
  evalAt,
  type SamplePoint,
} from "./FunctionSampler";

const EPS = 1e-7;
const SCAN = 500;
/** |f| above this near a candidate ⇒ treat as pole, not a root */
const POLE_Y = 25;
const POLE_DERIV = 1e5;

function bisect(
  f: (x: number) => number | null,
  a: number,
  b: number,
  fa: number,
  fb: number
): number | null {
  let lo = a;
  let hi = b;
  let flo = fa;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    // Hit a discontinuity inside the bracket → not a real root
    if (fm == null || Math.abs(fm) > POLE_Y * 10) return null;
    if (Math.abs(fm) < EPS || Math.abs(hi - lo) < EPS) return mid;
    if (flo * fm <= 0) {
      hi = mid;
    } else {
      lo = mid;
      flo = fm;
    }
  }
  return (lo + hi) / 2;
}

function newton(
  f: (x: number) => number | null,
  df: (x: number) => number | null,
  x0: number
): number | null {
  let x = x0;
  for (let i = 0; i < 40; i++) {
    const y = f(x);
    const yp = df(x);
    if (y == null || yp == null || Math.abs(yp) < 1e-12) break;
    if (Math.abs(yp) > POLE_DERIV) return null; // asymptote neighborhood
    const next = x - y / yp;
    if (!Number.isFinite(next)) return null;
    if (Math.abs(next - x) < EPS) return next;
    x = next;
  }
  const y = f(x);
  return y != null && Math.abs(y) < 1e-4 ? x : null;
}

/**
 * True root only if f is finite, near zero, continuous in a neighborhood,
 * and not sitting on / next to a vertical asymptote.
 */
function isValidRoot(
  f: (x: number) => number | null,
  df: ((x: number) => number | null) | null,
  x: number
): boolean {
  const y = f(x);
  if (y == null || !Number.isFinite(y) || Math.abs(y) > 1e-3) return false;

  const h = 1e-4;
  const yl = f(x - h);
  const yr = f(x + h);
  if (yl == null || yr == null) return false;
  if (!Number.isFinite(yl) || !Number.isFinite(yr)) return false;
  // Neighborhood still blows up → pole, not a crossing
  if (Math.abs(yl) > POLE_Y || Math.abs(yr) > POLE_Y) return false;

  // Sign should actually change (or touch) across a tiny window
  if (yl * yr > 0 && Math.abs(y) > 1e-6) {
    // allow exact touch zeros; reject if both sides same sign and far from zero
    if (Math.abs(yl) > 0.05 && Math.abs(yr) > 0.05) return false;
  }

  if (df) {
    const d = df(x);
    if (d != null && Math.abs(d) > POLE_DERIV) return false;
  }

  // Extra probes farther out — reject if function undefined nearby
  for (const t of [1e-3, 5e-3, 1e-2]) {
    if (f(x - t) == null || f(x + t) == null) return false;
  }

  return true;
}

/**
 * Sign-change brackets that look like poles (both sides large, or jump) are skipped.
 */
function findZeros(
  f: (x: number) => number | null,
  df: ((x: number) => number | null) | null,
  xMin: number,
  xMax: number,
  opts?: { validateRoots?: boolean }
): number[] {
  const validate = opts?.validateRoots !== false;
  const roots: number[] = [];
  const dx = (xMax - xMin) / SCAN;
  let prevX = xMin;
  let prevY = f(prevX);

  for (let i = 1; i <= SCAN; i++) {
    const x = xMin + dx * i;
    const y = f(x);

    // Domain hole → reset (do not bridge across asymptote)
    if (prevY == null || y == null) {
      prevX = x;
      prevY = y;
      continue;
    }

    if (Math.abs(prevY) < EPS) {
      if (!validate || isValidRoot(f, df, prevX)) pushUnique(roots, prevX);
    } else if (prevY * y <= 0) {
      const dy = Math.abs(y - prevY);
      // Pole crossing masquerading as a root (classic 1/(x-a) case)
      const poleBracket =
        Math.abs(prevY) > POLE_Y ||
        Math.abs(y) > POLE_Y ||
        dy > POLE_Y * 2 ||
        (Math.abs(prevY) > 5 && Math.abs(y) > 5 && prevY * y < 0);

      if (!poleBracket) {
        let root = bisect(f, prevX, x, prevY, y);
        if (root != null && df) {
          const refined = newton(f, df, root);
          if (refined != null) root = refined;
        }
        if (root != null && (!validate || isValidRoot(f, df, root))) {
          pushUnique(roots, root);
        }
      }
    }

    prevX = x;
    prevY = y;
  }
  return roots;
}

function pushUnique(arr: number[], v: number) {
  if (arr.some((x) => Math.abs(x - v) < 1e-5)) return;
  arr.push(v);
}

function compileDerivative(expr: string) {
  try {
    const d = derivative(expr, "x");
    return compileExpression(d.toString());
  } catch {
    return null;
  }
}

/**
 * Deterministic critical points for y = f(x).
 */
export function solveCriticalPoints(
  expr: string,
  xMin: number,
  xMax: number
): {
  criticalPoints: PlotCriticalPoint[];
  symmetryX?: number;
  contentBounds: { xMin: number; xMax: number; yMin: number; yMax: number };
  featureCenter: { x: number; y: number };
} {
  const compiled = compileExpression(expr);
  if (!compiled) {
    return {
      criticalPoints: [],
      contentBounds: { xMin, xMax, yMin: -5, yMax: 5 },
      featureCenter: { x: 0, y: 0 },
    };
  }

  const f = (x: number) => evalAt(compiled, x);
  const dCompiled = compileDerivative(expr);
  const df = dCompiled
    ? (x: number) => evalAt(dCompiled, x)
    : (x: number) => {
        const h = 1e-5;
        const a = f(x - h);
        const b = f(x + h);
        if (a == null || b == null) return null;
        return (b - a) / (2 * h);
      };

  const d2Compiled = dCompiled
    ? (() => {
        try {
          return compileExpression(
            derivative(derivative(expr, "x"), "x").toString()
          );
        } catch {
          return null;
        }
      })()
    : null;

  const criticalPoints: PlotCriticalPoint[] = [];

  // Y-intercept (only if defined)
  const y0 = f(0);
  if (y0 != null && Number.isFinite(y0) && Math.abs(y0) < 1e6) {
    criticalPoints.push({
      x: 0,
      y: y0,
      kind: "y-intercept",
      label: `(0, ${fmt(y0)})`,
    });
  }

  // Roots — never mark asymptotes
  const roots = findZeros(f, df, xMin, xMax, { validateRoots: true });
  for (const r of roots) {
    const y = f(r);
    if (y == null) continue;
    criticalPoints.push({
      x: r,
      y: 0,
      kind: "root",
      label: `(${fmt(r)}, 0)`,
    });
  }

  // Extrema: f' = 0 (skip pole brackets; lighter validation)
  const extremaXs = findZeros(df, null, xMin, xMax, { validateRoots: false }).filter(
    (ex) => {
      const y = f(ex);
      if (y == null || Math.abs(y) > POLE_Y * 20) return false;
      const d = df(ex);
      // Require flat derivative, not an asymptote spike
      if (d != null && Math.abs(d) > 1) return false;
      const yl = f(ex - 1e-3);
      const yr = f(ex + 1e-3);
      return yl != null && yr != null;
    }
  );

  let symmetryX: number | undefined;
  for (const ex of extremaXs) {
    const y = f(ex);
    if (y == null) continue;
    let kind: PlotCriticalPoint["kind"] = "extrema";
    if (
      extremaXs.length === 1 &&
      /x\s*\^\s*2|x\s*\*\*\s*2/i.test(expr.replace(/\s/g, ""))
    ) {
      kind = "vertex";
      symmetryX = ex;
    } else if (d2Compiled) {
      void evalAt(d2Compiled, ex);
    }
    if (extremaXs.length === 1) {
      const left = f(ex - 1);
      const right = f(ex + 1);
      if (left != null && right != null && left > y && right > y) {
        kind = "vertex";
        symmetryX = ex;
      } else if (left != null && right != null && left < y && right < y) {
        kind = "vertex";
        symmetryX = ex;
      }
    }

    criticalPoints.push({
      x: ex,
      y,
      kind,
      label:
        kind === "vertex"
          ? `vertex (${fmt(ex)}, ${fmt(y)})`
          : `(${fmt(ex)}, ${fmt(y)})`,
    });
  }

  const featurePts: SamplePoint[] = criticalPoints.map((p) => ({
    x: p.x,
    y: p.y,
  }));
  if (!featurePts.length) {
    for (let i = 0; i <= 20; i++) {
      const x = xMin + ((xMax - xMin) * i) / 20;
      const y = f(x);
      if (y != null && Math.abs(y) < 1e4) featurePts.push({ x, y });
    }
  }

  const xs = featurePts.map((p) => p.x);
  const ys = featurePts.map((p) => p.y);
  const contentBounds = {
    xMin: Math.min(...xs),
    xMax: Math.max(...xs),
    yMin: Math.min(...ys),
    yMax: Math.max(...ys),
  };

  const vertex = criticalPoints.find(
    (p) => p.kind === "vertex" || p.kind === "extrema"
  );
  const featureCenter = vertex
    ? { x: vertex.x, y: vertex.y }
    : {
        x: (contentBounds.xMin + contentBounds.xMax) / 2,
        y: (contentBounds.yMin + contentBounds.yMax) / 2,
      };

  return { criticalPoints, symmetryX, contentBounds, featureCenter };
}

function fmt(n: number) {
  const r = Math.round(n * 1e6) / 1e6;
  if (Number.isInteger(r)) return String(r);
  return String(parseFloat(r.toPrecision(6)));
}
