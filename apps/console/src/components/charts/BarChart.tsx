"use client";

import React, { useState } from "react";

export interface BarItem {
  label: string;
  value: number;
  color?: string;
  secondaryLabel?: string;
}

interface BarChartProps {
  data: BarItem[];
  height?: number;
  valueFormatter?: (v: number) => string;
}

export function BarChart({
  data,
  height = 220,
  valueFormatter = (v) => String(v),
}: BarChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-[var(--text-secondary)]">
        No distribution data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = height - 40;

  return (
    <div className="relative w-full">
      <div
        className="flex items-end justify-between gap-3 pt-6"
        style={{ height: chartHeight }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {data.map((item, idx) => {
          const barHeight = Math.max(6, (item.value / maxValue) * (chartHeight - 30));
          const isHovered = hoverIndex === idx;
          const barColor = item.color || "#4F46E5";

          return (
            <div
              key={item.label}
              className="group relative flex flex-1 flex-col items-center justify-end h-full cursor-pointer"
              onMouseEnter={() => setHoverIndex(idx)}
            >
              {/* Value label on top of bar */}
              <div
                className={`mb-2 text-xs font-semibold transition-all duration-150 ${
                  isHovered ? "scale-110 text-white" : "text-[var(--text-secondary)]"
                }`}
              >
                {valueFormatter(item.value)}
              </div>

              {/* Bar element */}
              <div
                className="w-full max-w-[56px] rounded-t-xl transition-all duration-200"
                style={{
                  height: barHeight,
                  backgroundColor: barColor,
                  opacity: hoverIndex === null ? 0.9 : isHovered ? 1 : 0.45,
                  boxShadow: isHovered
                    ? `0 0 20px ${barColor}55`
                    : undefined,
                }}
              />

              {/* Category label */}
              <div className="mt-3 truncate text-center text-xs font-medium text-[var(--text-secondary)] group-hover:text-white">
                {item.label}
              </div>

              {item.secondaryLabel && (
                <div className="text-[10px] text-[var(--text-muted)]">
                  {item.secondaryLabel}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
