import type {
  PlotData,
  PlotExpressionSpec,
  PlotPoint,
  PlotVector,
} from "@smart-desk/types";
import {
  buildPlotFromExpressionSpec,
  buildPlotFromGeometry,
} from "@/lib/graph/buildPlot";

/**
 * Parse selection text into a PlotData using deterministic mathjs sampling.
 * Never invents vectors from polynomial coefficients.
 */
export function parsePlotFromText(raw: string): PlotData | null {
  const text = raw.replace(/\u2212/g, "-").trim();
  if (!text) return null;

  const zSpec = extractZSpec(text);
  if (zSpec) return buildPlotFromExpressionSpec(zSpec);

  const ySpec = extractYSpec(text);
  if (ySpec) return buildPlotFromExpressionSpec(ySpec);

  return parsePointsAndVectors(text);
}

/** Convert OCR / API expression payload → PlotData (client-side sampling only). */
export function plotDataFromApi(raw: {
  mode?: "2d" | "3d";
  title?: string;
  rawLatex?: string;
  normalizedExpression?: string | null;
  expression?: string | null;
  expressions?: string[];
  variable?: "x" | "y";
  functionType?: PlotExpressionSpec["functionType"];
  suggestedDomain?: [number, number] | null;
  points?: PlotPoint[];
  vectors?: PlotVector[];
}): PlotData | null {
  const expr =
    raw.normalizedExpression ||
    raw.expression ||
    raw.expressions?.[0] ||
    null;

  if (expr && String(expr).trim()) {
    let normalized = String(expr).trim();
    const mode = raw.mode === "3d" ? "3d" : "2d";
    if (mode === "3d") {
      normalized = normalized.replace(/^z\s*=\s*/i, "");
    } else {
      normalized = normalized.replace(/^y\s*=\s*/i, "");
    }
    return buildPlotFromExpressionSpec({
      rawLatex: raw.rawLatex || raw.title,
      normalizedExpression: normalized,
      variable: raw.variable || "x",
      functionType: raw.functionType || classify(normalized),
      suggestedDomain: raw.suggestedDomain || undefined,
      mode,
      title: raw.title,
    });
  }

  // Geometry-only (explicit coords / vectors) — still no LLM samples
  if (raw.points?.length || raw.vectors?.length) {
    return buildPlotFromGeometry({
      title: raw.title,
      points: raw.points,
      vectors: raw.vectors,
    });
  }

  return null;
}

function extractYSpec(raw: string): PlotExpressionSpec | null {
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
  const rhs = m[1].replace(/[.,;]+$/, "").trim();
  if (!rhs) return null;
  return {
    rawLatex: cleaned,
    normalizedExpression: toMathjs(rhs),
    variable: "x",
    functionType: classify(rhs),
    suggestedDomain: domainFor(classify(rhs), rhs),
    mode: "2d",
    title: `y = ${rhs}`,
  };
}

function extractZSpec(raw: string): PlotExpressionSpec | null {
  const cleaned = raw
    .replace(/\u2212/g, "-")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/\n+/g, " ")
    .trim();
  const m =
    cleaned.match(/^(?:z|Z|f\s*\(\s*x\s*,\s*y\s*\))\s*=\s*(.+)$/i) ||
    cleaned.match(/(?:^|[\s;])(?:z|Z)\s*=\s*([^=;]+)/);
  if (!m) return null;
  const rhs = m[1].replace(/[.,;]+$/, "").trim();
  if (!rhs) return null;
  return {
    rawLatex: cleaned,
    normalizedExpression: toMathjs(rhs),
    functionType: "surface3d",
    mode: "3d",
    title: `z = ${rhs}`,
  };
}

function parsePointsAndVectors(raw: string): PlotData | null {
  if (/[yY]\s*=/.test(raw) || /[zZ]\s*=/.test(raw)) return null;

  const text = raw.replace(/,/g, " ");
  const indexed: Record<string, { x?: number; y?: number }> = {};
  const reIndexed =
    /([xy])\s*([₀₁₂₃₄₅₆₇₈₉0-9]+)\s*=\s*([-+]?\d*\.?\d+)/gi;
  let m: RegExpExecArray | null;
  while ((m = reIndexed.exec(text))) {
    const axis = m[1].toLowerCase();
    const idx = normalizeSub(m[2]);
    const val = Number(m[3]);
    if (!Number.isFinite(val)) continue;
    indexed[idx] ??= {};
    if (axis === "x") indexed[idx].x = val;
    else indexed[idx].y = val;
  }

  const points: PlotPoint[] = [];
  const vectors: PlotVector[] = [];
  const keys = Object.keys(indexed).sort();
  for (const key of keys) {
    const p = indexed[key];
    if (p.x == null || p.y == null) continue;
    points.push({
      x: p.x,
      y: p.y,
      label: keys.length > 1 ? `P${key}` : `(${fmt(p.x)}, ${fmt(p.y)})`,
    });
  }

  if (points.length === 2) {
    const a = points[0];
    const b = points[1];
    vectors.push({
      x: b.x - a.x,
      y: b.y - a.y,
      from: { x: a.x, y: a.y },
      label: "v⃗",
    });
  }

  const pairRe =
    /(?:\(|\[|<)\s*([-+]?\d*\.?\d+)\s*[;,]?\s+([-+]?\d*\.?\d+)\s*(?:\)|\]|>)/g;
  while ((m = pairRe.exec(text))) {
    const x = Number(m[1]);
    const y = Number(m[2]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    const open = m[0][0];
    if (open === "[" || open === "<") {
      vectors.push({ x, y, label: `⟨${fmt(x)}, ${fmt(y)}⟩` });
    } else if (!points.some((p) => p.x === x && p.y === y)) {
      points.push({ x, y, label: `(${fmt(x)}, ${fmt(y)})` });
    }
  }

  if (!vectors.length && points.length === 1) {
    vectors.push({ x: points[0].x, y: points[0].y, label: "v⃗" });
  }

  if (!points.length && !vectors.length) return null;
  return buildPlotFromGeometry({ points, vectors });
}

function toMathjs(rhs: string) {
  return rhs
    .replace(/\u2212/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/\bx2\b/gi, "x^2")
    .replace(/(\d)\s*([a-zA-Z(])/g, "$1*$2")
    .replace(/([xy)])\s*(\()/gi, "$1*$2")
    .trim();
}

function classify(expr: string): PlotExpressionSpec["functionType"] {
  const e = expr.toLowerCase();
  if (/sin|cos|tan|cot|sec|csc/.test(e)) return "trigonometric";
  if (/exp|e\s*\^/.test(e)) return "exponential";
  if (/\//.test(e) || /log|ln|sqrt/.test(e)) return "rational";
  if (/x\s*\^\s*\d|x\s*\*\*|x²|x2/.test(e) || /x/.test(e)) return "polynomial";
  return "unknown";
}

function domainFor(
  type: PlotExpressionSpec["functionType"],
  expr: string
): [number, number] {
  if (type === "trigonometric") return [-2 * Math.PI, 2 * Math.PI];
  if (type === "exponential") return [-3, 3];
  // Quadratic: center near vertex via -b/2a when possible
  const e = expr.replace(/\s+/g, "").replace(/²/g, "^2").replace(/\^/g, "**");
  const quad = e.match(
    /^([-+]?\d*\.?\d*)\*?x\*\*2([-+]\d*\.?\d*)\*?x([-+]\d*\.?\d+)?$/i
  );
  if (quad) {
    const a = coef(quad[1], 1);
    const b = coef(quad[2], 0);
    if (Math.abs(a) > 1e-9) {
      const v = -b / (2 * a);
      return [v - 6, v + 6];
    }
  }
  return [-6, 10];
}

function coef(raw: string | undefined, fallback: number) {
  if (raw == null || raw === "") return fallback;
  if (raw === "+" || raw === "-") return raw === "-" ? -1 : 1;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeSub(s: string) {
  const map: Record<string, string> = {
    "₀": "0",
    "₁": "1",
    "₂": "2",
    "₃": "3",
    "₄": "4",
    "₅": "5",
    "₆": "6",
    "₇": "7",
    "₈": "8",
    "₉": "9",
  };
  return s.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (c) => map[c] || c);
}

function fmt(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}
