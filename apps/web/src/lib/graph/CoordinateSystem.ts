export type Viewport = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

export type GraphFrame = {
  width: number;
  height: number;
  pad: number;
};

export const DEFAULT_PPU = 40; // pixels per unit — locked 1:1

/**
 * Build a square-unit viewport: same scale on X and Y.
 * Frame inner size determines how many units are visible.
 */
export function viewportFromCenter(
  cx: number,
  cy: number,
  frame: GraphFrame,
  pixelsPerUnit = DEFAULT_PPU
): Viewport {
  const innerW = Math.max(frame.width - frame.pad * 2, 40);
  const innerH = Math.max(frame.height - frame.pad * 2, 40);
  const halfX = innerW / (2 * pixelsPerUnit);
  const halfY = innerH / (2 * pixelsPerUnit);
  return {
    xMin: cx - halfX,
    xMax: cx + halfX,
    yMin: cy - halfY,
    yMax: cy + halfY,
  };
}

/**
 * Fit content AABB into the frame with 1:1 scale (letterbox if needed).
 * Never stretches X differently from Y.
 */
export function fitViewport1to1(
  content: Viewport,
  frame: GraphFrame,
  paddingUnits = 1.25
): { viewport: Viewport; pixelsPerUnit: number } {
  const innerW = Math.max(frame.width - frame.pad * 2, 40);
  const innerH = Math.max(frame.height - frame.pad * 2, 40);

  let xMin = content.xMin - paddingUnits;
  let xMax = content.xMax + paddingUnits;
  let yMin = content.yMin - paddingUnits;
  let yMax = content.yMax + paddingUnits;

  // Ensure origin-ish breathing room for typical school graphs
  xMin = Math.min(xMin, -0.5);
  xMax = Math.max(xMax, 0.5);
  yMin = Math.min(yMin, -0.5);
  yMax = Math.max(yMax, 0.5);

  const spanX = Math.max(xMax - xMin, 1e-6);
  const spanY = Math.max(yMax - yMin, 1e-6);

  // Choose PPU so BOTH spans fit — use the more restrictive axis
  const ppu = Math.min(innerW / spanX, innerH / spanY);
  const cx = (xMin + xMax) / 2;
  const cy = (yMin + yMax) / 2;
  const viewport = viewportFromCenter(cx, cy, frame, ppu);
  return { viewport, pixelsPerUnit: ppu };
}

export function createMappers(viewport: Viewport, frame: GraphFrame) {
  const { width: w, height: h, pad } = frame;
  const { xMin, xMax, yMin, yMax } = viewport;
  const sx = (x: number) =>
    pad + ((x - xMin) / (xMax - xMin || 1)) * (w - pad * 2);
  const sy = (y: number) =>
    h - pad - ((y - yMin) / (yMax - yMin || 1)) * (h - pad * 2);
  const invX = (px: number) =>
    xMin + ((px - pad) / (w - pad * 2 || 1)) * (xMax - xMin);
  const invY = (py: number) =>
    yMin + ((h - pad - py) / (h - pad * 2 || 1)) * (yMax - yMin);
  return { sx, sy, invX, invY };
}

export function zoomViewport(
  vp: Viewport,
  factor: number,
  anchor?: { x: number; y: number }
): Viewport {
  const cx = anchor?.x ?? (vp.xMin + vp.xMax) / 2;
  const cy = anchor?.y ?? (vp.yMin + vp.yMax) / 2;
  const hx = ((vp.xMax - vp.xMin) / 2) * factor;
  const hy = ((vp.yMax - vp.yMin) / 2) * factor;
  return {
    xMin: cx - hx,
    xMax: cx + hx,
    yMin: cy - hy,
    yMax: cy + hy,
  };
}

export function panViewport(vp: Viewport, dx: number, dy: number): Viewport {
  return {
    xMin: vp.xMin + dx,
    xMax: vp.xMax + dx,
    yMin: vp.yMin + dy,
    yMax: vp.yMax + dy,
  };
}

export function niceTicks(min: number, max: number, target = 10): number[] {
  const span = max - min;
  if (span <= 0) return [min];
  const raw = span / target;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const candidates = [1, 2, 2.5, 5, 10].map((c) => c * pow);
  let step = candidates[0];
  for (const c of candidates) {
    if (span / c <= target * 1.4) {
      step = c;
      break;
    }
  }
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= max + step * 1e-9; t += step) {
    const v = Math.abs(t) < step * 1e-9 ? 0 : Number(t.toPrecision(12));
    if (v !== 0) ticks.push(v);
  }
  return ticks;
}
