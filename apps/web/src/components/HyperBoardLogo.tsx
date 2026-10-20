import React from "react";

interface HyperBoardLogoProps {
  size?: number;
  className?: string;
  withGlow?: boolean;
}

export function HyperBoardLogo({
  size = 32,
  className = "",
  withGlow = false,
}: HyperBoardLogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {withGlow && (
        <div
          className="pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-tr from-indigo-500/30 via-cyan-400/20 to-purple-500/25 blur-xl"
          aria-hidden
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 overflow-visible"
        aria-label="HyperBoard Logo"
      >
        <defs>
          {/* Outer edge linear gradient */}
          <linearGradient id="tesseract-outer" x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          {/* Inner core gradient */}
          <linearGradient id="tesseract-inner" x1="10" y1="9" x2="22" y2="23" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>

          {/* Top facet fill */}
          <linearGradient id="tesseract-facet-top" x1="16" y1="3" x2="16" y2="16" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0.04" />
          </linearGradient>

          {/* Right facet fill */}
          <linearGradient id="tesseract-facet-right" x1="16" y1="16" x2="28" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.02" />
          </linearGradient>

          {/* Left facet fill */}
          <linearGradient id="tesseract-facet-left" x1="4" y1="16" x2="16" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* ══ Outer Facet Soft Fills ══ */}
        {/* Top outer facet */}
        <polygon
          points="16,3 27.26,9.5 16,16 4.74,9.5"
          fill="url(#tesseract-facet-top)"
        />
        {/* Left outer facet */}
        <polygon
          points="4.74,9.5 16,16 16,29 4.74,22.5"
          fill="url(#tesseract-facet-left)"
        />
        {/* Right outer facet */}
        <polygon
          points="16,16 27.26,9.5 27.26,22.5 16,29"
          fill="url(#tesseract-facet-right)"
        />

        {/* ══ Outer Hexagon Silhouette ══ */}
        <polygon
          points="16,3 27.26,9.5 27.26,22.5 16,29 4.74,22.5 4.74,9.5"
          stroke="url(#tesseract-outer)"
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* ══ Primary Projection Rays (Outer to Center) ══ */}
        <line
          x1="16"
          y1="3"
          x2="16"
          y2="16"
          stroke="url(#tesseract-outer)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="4.74"
          y1="22.5"
          x2="16"
          y2="16"
          stroke="url(#tesseract-outer)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="27.26"
          y1="22.5"
          x2="16"
          y2="16"
          stroke="url(#tesseract-outer)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* ══ Inner Suspended Hypercube ══ */}
        <polygon
          points="16,9.5 21.63,12.75 21.63,19.25 16,22.5 10.37,19.25 10.37,12.75"
          stroke="url(#tesseract-inner)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="#0B101D"
          fillOpacity="0.75"
        />

        {/* Inner Axes */}
        <line
          x1="16"
          y1="9.5"
          x2="16"
          y2="22.5"
          stroke="url(#tesseract-inner)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="10.37"
          y1="12.75"
          x2="21.63"
          y2="19.25"
          stroke="url(#tesseract-inner)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="10.37"
          y1="19.25"
          x2="21.63"
          y2="12.75"
          stroke="url(#tesseract-inner)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* ══ Quantum Nucleus ══ */}
        <circle cx="16" cy="16" r="2.2" fill="#FFFFFF" />
        <circle cx="16" cy="16" r="1" fill="#67E8F9" />
      </svg>
    </div>
  );
}
