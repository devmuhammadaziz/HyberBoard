"use client";

import React, { useState } from "react";

export interface SeriesData {
  name: string;
  color: string;
  data: number[];
}

interface LineChartProps {
  categories: string[];
  series: SeriesData[];
  height?: number;
  valueFormatter?: (v: number) => string;
}

export function LineChart({
  categories,
  series,
  height = 240,
  valueFormatter = (v) => String(v),
}: LineChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!categories.length || !series.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-[var(--text-secondary)]">
        No timeline data available
      </div>
    );
  }

  // Calculate scales
  const allValues = series.flatMap((s) => s.data);
  const rawMax = Math.max(...allValues, 1);
  const maxVal = Math.ceil(rawMax * 1.15); // Add 15% headroom
  const minVal = 0;

  const width = 600;
  const padding = { top: 20, right: 20, bottom: 35, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (index: number) => {
    if (categories.length === 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (categories.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return padding.top + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
  };

  // Generate smooth SVG bezier path
  const makeSmoothPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i !== points.length - 2 ? points[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  // Grid levels (4 steps)
  const gridLevels = [0, 0.33, 0.66, 1].map((pct) => {
    const val = Math.round(minVal + pct * (maxVal - minVal));
    const y = getY(val);
    return { val, y };
  });

  return (
    <div className="relative w-full">
      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-6">
        {series.map((s) => (
          <div key={s.name} className="flex items-center gap-2 text-xs font-medium">
            <span
              className="h-2.5 w-2.5 rounded-full ring-2 ring-white/10"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-[var(--text-secondary)]">{s.name}</span>
          </div>
        ))}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full overflow-visible"
          style={{ height }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {series.map((s, idx) => (
              <linearGradient
                key={s.name}
                id={`gradient-${idx}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0.0" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines & Y-axis labels */}
          {gridLevels.map(({ val, y }, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="currentColor"
                className="text-white/5"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-[var(--text-secondary)] text-[10px]"
              >
                {valueFormatter(val)}
              </text>
            </g>
          ))}

          {/* Series Areas and Lines */}
          {series.map((s, idx) => {
            const points = s.data.map((val, i) => ({ x: getX(i), y: getY(val) }));
            const linePath = makeSmoothPath(points);
            const areaPath = `${linePath} L ${points[points.length - 1].x} ${
              padding.top + chartHeight
            } L ${points[0].x} ${padding.top + chartHeight} Z`;

            return (
              <g key={s.name}>
                {/* Area under curve */}
                <path d={areaPath} fill={`url(#gradient-${idx})`} />
                {/* Smooth stroke */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Data points */}
                {points.map((p, pIdx) => (
                  <circle
                    key={pIdx}
                    cx={p.x}
                    cy={p.y}
                    r={hoverIndex === pIdx ? 5 : 3}
                    fill={s.color}
                    className="transition-all duration-150"
                    stroke="#0B0F19"
                    strokeWidth="2"
                  />
                ))}
              </g>
            );
          })}

          {/* Hover Crosshair & Trigger Columns */}
          {categories.map((cat, i) => {
            const x = getX(i);
            const isHovered = hoverIndex === i;

            return (
              <g key={i}>
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartHeight}
                    stroke="rgba(255, 255, 255, 0.25)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}
                {/* Invisible hover capture rect */}
                <rect
                  x={x - chartWidth / (categories.length * 2)}
                  y={padding.top}
                  width={chartWidth / categories.length}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(i)}
                />
                {/* X Axis labels (show every few labels to avoid clutter) */}
                {(categories.length <= 8 || i % Math.ceil(categories.length / 7) === 0) && (
                  <text
                    x={x}
                    y={height - 8}
                    textAnchor="middle"
                    className="fill-[var(--text-secondary)] text-[10px]"
                  >
                    {cat}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {hoverIndex !== null && (
          <div
            className="pointer-events-none absolute top-4 z-20 rounded-xl border border-white/10 bg-[#111827]/95 p-3 text-xs shadow-2xl backdrop-blur-md"
            style={{
              left: `${Math.min(
                Math.max(10, (getX(hoverIndex) / width) * 100),
                80
              )}%`,
            }}
          >
            <div className="font-semibold text-white">{categories[hoverIndex]}</div>
            <div className="mt-1 space-y-1">
              {series.map((s) => (
                <div key={s.name} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-[var(--text-secondary)]">{s.name}:</span>
                  </div>
                  <span className="font-semibold text-white">
                    {valueFormatter(s.data[hoverIndex] ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
