"use client";

import type { BoardElement, PlotData } from "@smart-desk/types";
import { fontCss } from "@smart-desk/types";
import type { GraphHandle } from "@/lib/plot-geometry";
import {
  createMappers,
  niceTicks,
  zoomViewport,
  type Viewport,
} from "@/lib/graph/CoordinateSystem";
import { sampleFunction, segmentsToSvgPath } from "@/lib/graph/FunctionSampler";

export function GraphElementView({
  el,
  opacity = 1,
  selected = false,
  onHandleDown,
  onPlotChange,
}: {
  el: BoardElement;
  opacity?: number;
  selected?: boolean;
  onHandleDown?: (handle: GraphHandle, e: React.PointerEvent) => void;
  onPlotChange?: (plot: PlotData) => void;
}) {
  const plot = (el.meta?.plot || {}) as PlotData;
  if (plot.mode === "3d" || plot.kind === "cartesian3d" || plot.surface) {
    return <Graph3DView el={el} plot={plot} opacity={opacity} selected={selected} />;
  }
  return (
    <Graph2DView
      el={el}
      plot={plot}
      opacity={opacity}
      selected={selected}
      onHandleDown={onHandleDown}
      onPlotChange={onPlotChange}
    />
  );
}

function Graph2DView({
  el,
  plot,
  opacity,
  selected,
  onHandleDown,
  onPlotChange,
}: {
  el: BoardElement;
  plot: PlotData;
  opacity: number;
  selected: boolean;
  onHandleDown?: (handle: GraphHandle, e: React.PointerEvent) => void;
  onPlotChange?: (plot: PlotData) => void;
}) {
  const w = Math.max(el.width || 360, 160);
  const h = Math.max(el.height || 320, 140);
  const pad = 30;
  const frame = { width: w, height: h, pad };
  const viewport: Viewport = {
    xMin: plot.xMin ?? -5,
    xMax: plot.xMax ?? 5,
    yMin: plot.yMin ?? -5,
    yMax: plot.yMax ?? 5,
  };
  const { sx, sy } = createMappers(viewport, frame);
  const accent = el.style.color || "#60A5FA";
  const axis = "color-mix(in oklab, var(--text-primary) 85%, transparent)";
  const muted = "var(--text-secondary)";
  const originX = sx(0);
  const originY = sy(0);
  const markerId = `arrow-${el.id}`;

  const xTicks = niceTicks(viewport.xMin, viewport.xMax, 10);
  const yTicks = niceTicks(viewport.yMin, viewport.yMax, 10);

  // Re-sample live from expression so zoom stays exact
  const expr =
    plot.expressionSpec?.normalizedExpression ||
    plot.expressions?.[0] ||
    plot.curves?.[0]?.expression;
  let curvePath = "";
  if (expr) {
    const segments = sampleFunction(
      expr,
      viewport.xMin,
      viewport.xMax,
      viewport.yMin,
      viewport.yMax,
      500
    );
    curvePath = segmentsToSvgPath(segments, sx, sy);
  } else if (plot.curves?.[0]?.points?.length) {
    curvePath = legacyCurvePath(plot.curves[0].points, sx, sy);
  }

  const setVp = (next: Viewport) => {
    if (!onPlotChange) return;
    onPlotChange({
      ...plot,
      xMin: next.xMin,
      xMax: next.xMax,
      yMin: next.yMin,
      yMax: next.yMax,
    });
  };

  const clipId = `plot-clip-${el.id}`;

  return (
    <g opacity={opacity} transform={`translate(${el.x} ${el.y})`}>
      <rect x={0} y={0} width={w} height={h} fill="transparent" />

      <defs>
        <clipPath id={clipId}>
          <rect x={pad} y={pad} width={w - pad * 2} height={h - pad * 2} />
        </clipPath>
        <marker
          id={markerId}
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill={accent} />
        </marker>
        <marker
          id={`${markerId}-axis`}
          markerWidth="7"
          markerHeight="7"
          refX="5"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L5,3 L0,6 Z" fill={axis} />
        </marker>
      </defs>

      {xTicks.map((t) => (
        <line
          key={`gx-${t}`}
          x1={sx(t)}
          y1={pad}
          x2={sx(t)}
          y2={h - pad}
          stroke="color-mix(in oklab, var(--text-secondary) 12%, transparent)"
          strokeWidth={1}
        />
      ))}
      {yTicks.map((t) => (
        <line
          key={`gy-${t}`}
          x1={pad}
          y1={sy(t)}
          x2={w - pad}
          y2={sy(t)}
          stroke="color-mix(in oklab, var(--text-secondary) 12%, transparent)"
          strokeWidth={1}
        />
      ))}

      {/* Axis of symmetry */}
      {plot.symmetryX != null &&
        plot.symmetryX >= viewport.xMin &&
        plot.symmetryX <= viewport.xMax && (
          <line
            x1={sx(plot.symmetryX)}
            y1={pad}
            x2={sx(plot.symmetryX)}
            y2={h - pad}
            stroke={accent}
            strokeOpacity={0.45}
            strokeWidth={1.25}
            strokeDasharray="5 4"
          />
        )}

      <line
        x1={pad}
        y1={originY}
        x2={w - pad + 4}
        y2={originY}
        stroke={axis}
        strokeWidth={1.6}
        markerEnd={`url(#${markerId}-axis)`}
      />
      <line
        x1={originX}
        y1={h - pad}
        x2={originX}
        y2={pad - 4}
        stroke={axis}
        strokeWidth={1.6}
        markerEnd={`url(#${markerId}-axis)`}
      />

      <text x={w - pad + 2} y={originY - 8} fontSize={13} fontFamily={fontCss("computer-modern")} fill={muted}>
        x
      </text>
      <text x={originX + 8} y={pad + 4} fontSize={13} fontFamily={fontCss("computer-modern")} fill={muted}>
        y
      </text>

      {xTicks.map((t) => (
        <g key={`xt-${t}`}>
          <line x1={sx(t)} y1={originY - 4} x2={sx(t)} y2={originY + 4} stroke={axis} strokeWidth={1.2} />
          <text x={sx(t)} y={originY + 16} textAnchor="middle" fontSize={11} fontFamily={fontCss("computer-modern")} fill={muted}>
            {fmtTick(t)}
          </text>
        </g>
      ))}
      {yTicks.map((t) => (
        <g key={`yt-${t}`}>
          <line x1={originX - 4} y1={sy(t)} x2={originX + 4} y2={sy(t)} stroke={axis} strokeWidth={1.2} />
          <text x={originX - 10} y={sy(t) + 4} textAnchor="end" fontSize={11} fontFamily={fontCss("computer-modern")} fill={muted}>
            {fmtTick(t)}
          </text>
        </g>
      ))}

      <g clipPath={`url(#${clipId})`}>
        {curvePath && (
          <path
            d={curvePath}
            fill="none"
            stroke={accent}
            strokeWidth={2.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </g>

      {(plot.vectors || []).map((v, i) => {
        const ox = v.from?.x ?? 0;
        const oy = v.from?.y ?? 0;
        const color = v.color || accent;
        return (
          <g key={`v-${i}`}>
            <line
              x1={sx(ox)}
              y1={sy(oy)}
              x2={sx(ox + v.x)}
              y2={sy(oy + v.y)}
              stroke={color}
              strokeWidth={2.75}
              strokeLinecap="round"
              markerEnd={`url(#${markerId})`}
            />
            <text
              x={(sx(ox) + sx(ox + v.x)) / 2 + 10}
              y={(sy(oy) + sy(oy + v.y)) / 2 - 8}
              fontSize={13}
              fontFamily={fontCss("computer-modern")}
              fill={color}
              fontWeight={600}
            >
              {v.label || "v⃗"}
            </text>
          </g>
        );
      })}

      {/* Critical points: roots, vertex, intercepts */}
      {(plot.criticalPoints || []).map((p, i) => {
        const fill =
          p.kind === "vertex" || p.kind === "extrema"
            ? "#FBBF24"
            : p.kind === "root"
              ? "#34D399"
              : accent;
        return (
          <g key={`cp-${i}`}>
            <circle
              cx={sx(p.x)}
              cy={sy(p.y)}
              r={selected ? 6.5 : 5}
              fill={fill}
              stroke="white"
              strokeWidth={1.6}
            />
            {p.label && (
              <text
                x={sx(p.x) + 9}
                y={sy(p.y) - 9}
                fontSize={11}
                fontFamily={fontCss("computer-modern")}
                fill={fill}
              >
                {p.label}
              </text>
            )}
          </g>
        );
      })}

      {(plot.points || []).map((p, i) => (
        <g key={`p-${i}`}>
          <circle
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={selected ? 6 : 4.5}
            fill={p.color || accent}
            stroke="white"
            strokeWidth={1.5}
          />
          {p.label && (
            <text
              x={sx(p.x) + 8}
              y={sy(p.y) - 8}
              fontSize={12}
              fontFamily={fontCss("computer-modern")}
              fill={p.color || accent}
            >
              {p.label}
            </text>
          )}
        </g>
      ))}

      {plot.curves?.[0]?.label && (
        <text
          x={w - pad}
          y={pad - 8}
          textAnchor="end"
          fontSize={12}
          fontFamily={fontCss("computer-modern")}
          fill={accent}
        >
          {plot.curves[0].label}
        </text>
      )}

      {/* Zoom controls */}
      {selected && onPlotChange && (
        <g transform={`translate(${w - 58}, ${h - 78})`}>
          <rect width={50} height={70} rx={10} fill="var(--surface)" stroke="var(--border)" strokeWidth={1} opacity={0.95} />
          <ZoomBtn
            y={8}
            label="+"
            onClick={() => setVp(zoomViewport(viewport, 0.8))}
          />
          <ZoomBtn
            y={28}
            label="−"
            onClick={() => setVp(zoomViewport(viewport, 1.25))}
          />
          <ZoomBtn
            y={48}
            label="핏"
            title="Auto-fit"
            onClick={() => {
              // Rebuild from expressionSpec if available
              if (plot.expressionSpec) {
                void import("@/lib/graph/buildPlot").then(({ buildPlotFromExpressionSpec }) => {
                  const next = buildPlotFromExpressionSpec(plot.expressionSpec!, frame);
                  if (next) onPlotChange(next);
                });
              }
            }}
          />
        </g>
      )}

      {selected &&
        (plot.vectors || []).map((v, i) => {
          const ox = v.from?.x ?? 0;
          const oy = v.from?.y ?? 0;
          return (
            <g key={`vh-${i}`}>
              <circle
                cx={sx(ox)}
                cy={sy(oy)}
                r={11}
                fill="transparent"
                style={{ cursor: "grab" }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onHandleDown?.({ kind: "vector-start", index: i }, e);
                }}
              />
              <circle
                cx={sx(ox + v.x)}
                cy={sy(oy + v.y)}
                r={11}
                fill="transparent"
                style={{ cursor: "grab" }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onHandleDown?.({ kind: "vector-end", index: i }, e);
                }}
              />
            </g>
          );
        })}
    </g>
  );
}

function ZoomBtn({
  y,
  label,
  title,
  onClick,
}: {
  y: number;
  label: string;
  title?: string;
  onClick: () => void;
}) {
  return (
    <g
      style={{ cursor: "pointer" }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <title>{title || label}</title>
      <rect x={8} y={y} width={34} height={16} rx={5} fill="var(--bg)" />
      <text
        x={25}
        y={y + 12}
        textAnchor="middle"
        fontSize={11}
        fill="var(--text-primary)"
        fontFamily={fontCss("inter")}
      >
        {label === "핏" ? "fit" : label}
      </text>
    </g>
  );
}

function Graph3DView({
  el,
  plot,
  opacity,
  selected,
}: {
  el: BoardElement;
  plot: PlotData;
  opacity: number;
  selected: boolean;
}) {
  const w = Math.max(el.width || 340, 160);
  const h = Math.max(el.height || 300, 140);
  const accent = el.style.color || "#60A5FA";
  const axis = "color-mix(in oklab, var(--text-primary) 80%, transparent)";
  const muted = "var(--text-secondary)";
  const samples = plot.surface?.samples || [];
  const xMin = plot.xMin ?? -2;
  const xMax = plot.xMax ?? 2;
  const yMin = plot.yMin ?? -2;
  const yMax = plot.yMax ?? 2;
  const zMin = plot.zMin ?? -1;
  const zMax = plot.zMax ?? 1;
  const res = plot.surface?.resolution ?? 16;

  const project = (x: number, y: number, z: number) => {
    const nx = (x - xMin) / (xMax - xMin || 1);
    const ny = (y - yMin) / (yMax - yMin || 1);
    const nz = (z - zMin) / (zMax - zMin || 1);
    return {
      x: w * 0.18 + nx * w * 0.55 + ny * w * 0.28,
      y: h * 0.72 - ny * h * 0.28 - nz * h * 0.45,
    };
  };

  const byKey = new Map<string, { x: number; y: number; z: number }>();
  for (const s of samples) {
    const ix = Math.round(((s.x - xMin) / (xMax - xMin || 1)) * res);
    const iy = Math.round(((s.y - yMin) / (yMax - yMin || 1)) * res);
    byKey.set(`${ix},${iy}`, s);
  }
  const gridLines: string[] = [];
  for (let i = 0; i <= res; i++) {
    for (let j = 0; j < res; j++) {
      const a = byKey.get(`${i},${j}`);
      const b = byKey.get(`${i},${j + 1}`);
      if (a && b) {
        const pa = project(a.x, a.y, a.z);
        const pb = project(b.x, b.y, b.z);
        gridLines.push(`M${pa.x} ${pa.y} L${pb.x} ${pb.y}`);
      }
    }
  }
  for (let j = 0; j <= res; j++) {
    for (let i = 0; i < res; i++) {
      const a = byKey.get(`${i},${j}`);
      const b = byKey.get(`${i + 1},${j}`);
      if (a && b) {
        const pa = project(a.x, a.y, a.z);
        const pb = project(b.x, b.y, b.z);
        gridLines.push(`M${pa.x} ${pa.y} L${pb.x} ${pb.y}`);
      }
    }
  }

  const o = project(0, 0, 0);
  const ox = project(xMax, 0, 0);
  const oy = project(0, yMax, 0);
  const oz = project(0, 0, zMax);

  return (
    <g opacity={opacity} transform={`translate(${el.x} ${el.y})`}>
      <rect
        x={0}
        y={0}
        width={w}
        height={h}
        fill="transparent"
        stroke={selected ? "var(--brand)" : "transparent"}
        strokeWidth={selected ? 1.25 : 0}
        strokeDasharray={selected ? "4 3" : undefined}
        rx={8}
      />
      <line x1={o.x} y1={o.y} x2={ox.x} y2={ox.y} stroke={axis} strokeWidth={1.4} />
      <line x1={o.x} y1={o.y} x2={oy.x} y2={oy.y} stroke={axis} strokeWidth={1.4} />
      <line x1={o.x} y1={o.y} x2={oz.x} y2={oz.y} stroke={axis} strokeWidth={1.4} />
      <text x={ox.x + 6} y={ox.y} fontSize={12} fill={muted} fontFamily={fontCss("computer-modern")}>
        x
      </text>
      <text x={oy.x + 6} y={oy.y} fontSize={12} fill={muted} fontFamily={fontCss("computer-modern")}>
        y
      </text>
      <text x={oz.x + 6} y={oz.y} fontSize={12} fill={muted} fontFamily={fontCss("computer-modern")}>
        z
      </text>
      <path d={gridLines.join(" ")} fill="none" stroke={accent} strokeWidth={1.15} strokeOpacity={0.85} />
      {plot.surface?.label && (
        <text
          x={w / 2}
          y={18}
          textAnchor="middle"
          fontSize={13}
          fontFamily={fontCss("computer-modern")}
          fill={accent}
        >
          {plot.surface.label}
        </text>
      )}
    </g>
  );
}

function legacyCurvePath(
  points: Array<{ x: number; y: number }>,
  sx: (x: number) => number,
  sy: (y: number) => number
) {
  let d = "";
  let penUp = true;
  for (const p of points) {
    if (!Number.isFinite(p.y)) {
      penUp = true;
      continue;
    }
    const x = sx(p.x);
    const y = sy(p.y);
    d += penUp ? `M ${x} ${y} ` : `L ${x} ${y} `;
    penUp = false;
  }
  return d.trim();
}

function fmtTick(n: number) {
  if (Number.isInteger(n)) return String(n);
  return String(parseFloat(n.toPrecision(4)));
}
