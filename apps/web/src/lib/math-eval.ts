/**
 * Tiny safe evaluator for plot expressions in x (and optionally y).
 * Supports + - * / ^, parentheses, and common functions.
 */

const FN: Record<string, (a: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  abs: Math.abs,
  sqrt: Math.sqrt,
  ln: Math.log,
  log: Math.log10,
  exp: Math.exp,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
};

export function normalizeMathExpr(raw: string): string {
  return raw
    .replace(/\u2212/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/·/g, "*")
    .replace(/\u00b2/g, "^2")
    .replace(/\u00b3/g, "^3")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    // OCR often writes x2 for x²
    .replace(/\bx2\b/gi, "x^2")
    .replace(/\bx3\b/gi, "x^3")
    .replace(/([xy])\s*²/gi, "$1^2")
    .replace(/([xy])\s*³/gi, "$1^3")
    .replace(/(\d)\s*([a-zA-Z(])/g, "$1*$2")
    .replace(/([a-zA-Z)])\s*(\d)/g, "$1*$2")
    .replace(/([a-zA-Z)])\s*\(/g, "$1*(")
    .replace(/\)\s*([a-zA-Z(])/g, ")*$1")
    .replace(/\^/g, "**")
    .replace(/\s+/g, "");
}

/** Extract RHS of y=... or f(x)=... style equations. */
export function extractYEquals(raw: string): string | null {
  const cleaned = raw
    .replace(/\u2212/g, "-")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/\bx2\b/gi, "x^2")
    .replace(/\bx3\b/gi, "x^3")
    .replace(/\n+/g, " ")
    .trim();

  const m =
    cleaned.match(/^(?:y|Y|f\s*\(\s*x\s*\))\s*=\s*(.+)$/i) ||
    cleaned.match(/(?:^|[\s;])(?:y|Y)\s*=\s*([^=;]+)/);
  if (!m) return null;
  let rhs = m[1].trim();
  // Drop trailing junk
  rhs = rhs.replace(/[.,;]+$/, "").trim();
  return rhs || null;
}

export function extractZEquals(raw: string): string | null {
  const cleaned = raw
    .replace(/\u2212/g, "-")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/\n+/g, " ")
    .trim();
  const m =
    cleaned.match(/^(?:z|Z|f\s*\(\s*x\s*,\s*y\s*\))\s*=\s*(.+)$/i) ||
    cleaned.match(/(?:^|\s)(?:z|Z)\s*=\s*([^=]+)$/);
  if (!m) return null;
  return m[1].trim();
}

export function evalExpr(
  expr: string,
  vars: Record<string, number>
): number | null {
  try {
    const normalized = normalizeMathExpr(expr);
    // Replace variables with values (word boundaries via custom scan)
    let body = normalized;
    for (const [name, value] of Object.entries(vars)) {
      body = body.replace(new RegExp(`\\b${name}\\b`, "gi"), `(${value})`);
    }
    // Replace function names with Math.* via Function constructor whitelist
    let js = body;
    for (const name of Object.keys(FN)) {
      js = js.replace(new RegExp(`\\b${name}\\b`, "gi"), `__fn.${name}`);
    }
    // Disallow identifiers other than __fn
    if (/[a-zA-Z_]/.test(js.replace(/__fn/g, ""))) return null;
    // eslint-disable-next-line no-new-func
    const fn = new Function("__fn", `return (${js});`);
    const v = fn(FN);
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

export function sampleYEquals(
  rhs: string,
  xMin: number,
  xMax: number,
  steps = 160
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  const span = xMax - xMin || 1;
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (span * i) / steps;
    const y = evalExpr(rhs, { x, pi: Math.PI, e: Math.E });
    if (y == null || Math.abs(y) > 1e6) {
      // break segment
      if (pts.length && Number.isNaN(pts[pts.length - 1].y)) continue;
      pts.push({ x, y: Number.NaN });
      continue;
    }
    pts.push({ x, y });
  }
  return pts;
}

export function sampleSurfaceZ(
  rhs: string,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  res = 18
): { x: number; y: number; z: number }[] {
  const out: { x: number; y: number; z: number }[] = [];
  for (let i = 0; i <= res; i++) {
    for (let j = 0; j <= res; j++) {
      const x = xMin + ((xMax - xMin) * i) / res;
      const y = yMin + ((yMax - yMin) * j) / res;
      const z = evalExpr(rhs, { x, y, pi: Math.PI, e: Math.E });
      if (z != null && Math.abs(z) < 1e5) out.push({ x, y, z });
    }
  }
  return out;
}

/** Guess a sensible x-domain for common equation families. */
export function guessDomain(rhs: string): { xMin: number; xMax: number } {
  const e = rhs.toLowerCase();
  if (/sin|cos|tan/.test(e)) return { xMin: -Math.PI * 2, xMax: Math.PI * 2 };
  if (/log|ln/.test(e)) return { xMin: 0.2, xMax: 8 };
  if (/sqrt/.test(e)) return { xMin: 0, xMax: 8 };
  if (/exp/.test(e)) return { xMin: -3, xMax: 3 };
  // Polynomial / default
  return { xMin: -2, xMax: 6 };
}
