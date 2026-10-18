import { compile, type EvalFunction } from "mathjs";

export type SamplePoint = { x: number; y: number };

export type SampleSegment = SamplePoint[];

function toMathjsExpr(raw: string): string {
  return raw
    .replace(/\u2212/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/·/g, "*")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/\bx2\b/gi, "x^2")
    .replace(/\bx3\b/gi, "x^3")
    .replace(/\^/g, "^")
    .replace(/(\d)\s*([a-zA-Z(])/g, "$1*$2")
    .replace(/([a-zA-Z)])\s*(\d)/g, "$1*$2")
    .replace(/([a-zA-Z)])\s*\(/g, "$1*(")
    .replace(/\)\s*([a-zA-Z(])/g, ")*$1")
    .trim();
}

export function compileExpression(expr: string): EvalFunction | null {
  try {
    return compile(toMathjsExpr(expr));
  } catch {
    return null;
  }
}

export function evalAt(
  compiled: EvalFunction,
  x: number,
  scopeExtra: Record<string, number> = {}
): number | null {
  try {
    const v = compiled.evaluate({ x, pi: Math.PI, e: Math.E, ...scopeExtra });
    if (typeof v !== "number" || !Number.isFinite(v)) return null;
    return v;
  } catch {
    return null;
  }
}

/**
 * Sample y=f(x) with hard breaks at poles / viewport exits.
 * Points outside the visible y-band are dropped so asymptotes never
 * draw a vertical stroke connecting +∞ and −∞.
 */
export function sampleFunction(
  expr: string,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  steps = 500
): SampleSegment[] {
  const compiled = compileExpression(expr);
  if (!compiled) return [];

  const spanY = Math.max(Math.abs(yMax - yMin), 1);
  // Keep only points near the visible window (tiny margin for edge smoothness)
  const yLo = yMin - spanY * 0.05;
  const yHi = yMax + spanY * 0.05;
  const jumpLimit = Math.max(spanY * 0.85, 6);
  const dx = (xMax - xMin) / steps;

  const segments: SampleSegment[] = [];
  let current: SampleSegment = [];
  let prevY: number | null = null;

  const flush = () => {
    if (current.length >= 2) segments.push(current);
    current = [];
    prevY = null;
  };

  for (let i = 0; i <= steps; i++) {
    const x = xMin + dx * i;
    const y = evalAt(compiled, x);

    // Undefined, non-finite, or outside visible band → break (no lineTo across gap)
    if (y == null || y < yLo || y > yHi) {
      flush();
      continue;
    }

    if (prevY != null) {
      const dy = Math.abs(y - prevY);
      const signFlip = prevY * y < 0;
      // Top↔bottom jump inside the view = pole crossing artifact
      const edgeFlip =
        (prevY > yMax - spanY * 0.2 && y < yMin + spanY * 0.2) ||
        (prevY < yMin + spanY * 0.2 && y > yMax - spanY * 0.2);

      if (dy > jumpLimit || edgeFlip || (signFlip && dy > spanY * 0.35)) {
        flush();
        current = [{ x, y }];
        prevY = y;
        continue;
      }
    }

    current.push({ x, y });
    prevY = y;
  }

  flush();
  return segments;
}

export function segmentsToSvgPath(
  segments: SampleSegment[],
  sx: (x: number) => number,
  sy: (y: number) => number
): string {
  const parts: string[] = [];
  for (const seg of segments) {
    if (seg.length < 2) continue;
    parts.push(
      seg
        .map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.x)} ${sy(p.y)}`)
        .join(" ")
    );
  }
  return parts.join(" ");
}
