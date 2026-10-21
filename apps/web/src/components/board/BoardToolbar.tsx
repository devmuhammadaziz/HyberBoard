"use client";

import { useState } from "react";
import type { BoardFont, BoardTool, Subject } from "@smart-desk/types";
import { BOARD_FONTS } from "@smart-desk/types";
import {
  MousePointer2,
  Pencil,
  Eraser,
  Type,
  Undo2,
  Redo2,
  Square,
  Circle,
  Minus,
  MoveUpRight,
  Hand,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { t } from "@/lib/i18n";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { ERASER_SIZES, type EraserSizeId } from "@/lib/board-utils";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";
import clsx from "clsx";

type Props = {
  tool: BoardTool;
  color: string;
  font: BoardFont;
  subject: Subject;
  eraserSize: EraserSizeId;
  saveLabel: string;
  onToolChange: (tool: BoardTool) => void;
  onColorChange: (color: string) => void;
  onFontChange: (font: BoardFont) => void;
  onSubjectChange: (subject: Subject) => void;
  onEraserSizeChange: (size: EraserSizeId) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearRequest: () => void;
};

const COLORS = ["#4F46E5", "#F9FAFB", "#10B981", "#06B6D4", "#F59E0B", "#EF4444", "#0F172A"];

export function BoardToolbar({
  tool,
  color,
  font,
  subject,
  eraserSize,
  saveLabel,
  onToolChange,
  onColorChange,
  onFontChange,
  onSubjectChange,
  onEraserSizeChange,
  onUndo,
  onRedo,
  onClearRequest,
}: Props) {
  const { locale } = useAuth();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Core drawing and interaction tools (1 - 5)
  const coreTools: {
    id: BoardTool;
    icon: React.ReactNode;
    label: string;
    shortcut: string;
  }[] = [
    { id: "select", icon: <MousePointer2 className="h-5 w-5" />, label: "Select", shortcut: "1" },
    { id: "hand", icon: <Hand className="h-5 w-5" />, label: "Pan Canvas", shortcut: "2" },
    { id: "pen", icon: <Pencil className="h-5 w-5" />, label: t(locale, "pen"), shortcut: "3" },
    { id: "eraser", icon: <Eraser className="h-5 w-5" />, label: t(locale, "eraser"), shortcut: "4" },
    { id: "text", icon: <Type className="h-5 w-5" />, label: t(locale, "text"), shortcut: "5" },
  ];

  // Geometric shape tools (6 - 9)
  const shapeTools: {
    id: BoardTool;
    icon: React.ReactNode;
    label: string;
    shortcut: string;
  }[] = [
    { id: "rect", icon: <Square className="h-5 w-5" />, label: "Rectangle", shortcut: "6" },
    { id: "ellipse", icon: <Circle className="h-5 w-5" />, label: "Ellipse", shortcut: "7" },
    { id: "line", icon: <Minus className="h-5 w-5" />, label: "Line", shortcut: "8" },
    { id: "arrow", icon: <MoveUpRight className="h-5 w-5" />, label: "Arrow", shortcut: "9" },
  ];

  const renderToolButton = (item: {
    id: BoardTool;
    icon: React.ReactNode;
    label: string;
    shortcut: string;
  }) => (
    <button
      key={item.id}
      type="button"
      title={`${item.label} (${item.shortcut})`}
      onClick={() => onToolChange(item.id)}
      className={clsx(
        "group relative flex h-11 w-11 items-center justify-center rounded-xl transition duration-150 select-none",
        tool === item.id
          ? "bg-[var(--brand)] text-white shadow-md shadow-indigo-500/25 scale-[1.03]"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text-primary)] active:scale-95"
      )}
    >
      {item.icon}

      {/* Excalidraw-style corner shortcut (flat, no bubble, no border, no protruding circle) */}
      <span
        className={clsx(
          "pointer-events-none absolute bottom-1 right-1.5 font-mono text-[9px] font-semibold leading-none select-none transition-opacity",
          tool === item.id
            ? "text-white/75"
            : "text-[var(--text-secondary)] opacity-40 group-hover:opacity-90"
        )}
      >
        {item.shortcut}
      </span>
    </button>
  );

  return (
    <>
      <KeyboardShortcutsModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          TOP-RIGHT SINGLE UNIFIED BLOCK: Subject, Autosave, Clear, Shortcuts
          All identical height (h-8), beautifully symmetrical and borderless
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none absolute right-4 top-4 z-40 flex items-center">
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-2xl bg-[var(--surface)]/90 p-1.5 shadow-xl shadow-black/10 backdrop-blur-2xl">
          {/* Subject Selector */}
          <CustomDropdown
            value={subject}
            onChange={onSubjectChange}
            ariaLabel={t(locale, "subject")}
            openUp={false}
            borderless
            align="left"
            options={[
              { value: "math", label: t(locale, "math"), accent: "#10B981", hint: "Equations · graphs" },
              { value: "physics", label: t(locale, "physics"), accent: "#06B6D4", hint: "Forces · fields" },
              { value: "chemistry", label: t(locale, "chemistry"), accent: "#F59E0B", hint: "Reactions · molecules" },
            ]}
          />

          {/* Autosaved Status Badge (Identical h-8 height) */}
          {saveLabel && (
            <>
              <div className="h-4 w-px bg-current/10" />
              <div className="flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-[var(--text-secondary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{saveLabel}</span>
              </div>
            </>
          )}

          {/* Keyboard Shortcuts Button (Identical h-8 size) */}
          <button
            type="button"
            title="Keyboard shortcuts (?)"
            onClick={() => setShortcutsOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-secondary)] transition hover:bg-[var(--bg)] hover:text-[var(--text-primary)] active:scale-95"
            aria-label="Keyboard shortcuts"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          BOTTOM DOCKS WRAPPER: Unified flex flow with gap-3 so they NEVER overlap
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-40 flex items-center justify-center gap-3 px-4">
        {/* Main Tools Dock (h-14, borderless frosted glass) */}
        <div className="pointer-events-auto flex h-14 shrink-0 items-center gap-1.5 rounded-2xl bg-[var(--surface)]/90 px-2 shadow-2xl shadow-black/25 backdrop-blur-2xl">
          {/* Tools 1 - 5: Select, Hand, Pen, Eraser, Text */}
          <div className="flex items-center gap-1.5">
            {coreTools.map(renderToolButton)}
          </div>

          <div className="mx-1 h-7 w-px bg-current/10" />

          {/* Tools 6 - 9: Rectangle, Ellipse, Line, Arrow */}
          <div className="flex items-center gap-1.5">
            {shapeTools.map(renderToolButton)}
          </div>

          <div className="mx-1 h-7 w-px bg-current/10" />

          {/* Undo / Redo Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              title={`${t(locale, "undo")} (⌘Z)`}
              onClick={onUndo}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-secondary)] transition hover:bg-[var(--bg)] hover:text-[var(--text-primary)] active:scale-95"
            >
              <Undo2 className="h-5 w-5" />
            </button>
            <button
              type="button"
              title={`${t(locale, "redo")} (⌘⇧Z)`}
              onClick={onRedo}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-secondary)] transition hover:bg-[var(--bg)] hover:text-[var(--text-primary)] active:scale-95"
            >
              <Redo2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Dedicated Color & Styling Feature Bar (h-14, matching height & clean gap) */}
        <aside
          aria-label="Color and style properties"
          className="pointer-events-auto flex h-14 shrink-0 items-center gap-3 rounded-2xl bg-[var(--surface)]/90 px-4 shadow-2xl shadow-black/25 backdrop-blur-2xl"
        >
          {/* 7 Color Swatches */}
          <div className="flex items-center gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onColorChange(c)}
                className={clsx(
                  "h-7 w-7 rounded-full transition hover:scale-115 active:scale-90",
                  c === "#F9FAFB" && "border border-neutral-300 dark:border-white/25",
                  color === c
                    ? "ring-2 ring-[var(--brand)] ring-offset-2 ring-offset-[var(--surface)] scale-110 shadow-sm"
                    : "opacity-80 hover:opacity-100"
                )}
                style={{ background: c }}
                title={`Color: ${c}`}
              />
            ))}
          </div>

          <div className="h-7 w-px bg-current/10" />

          {/* Contextual Eraser sizes (when eraser is active) */}
          {tool === "eraser" ? (
            <div className="flex items-center gap-1.5">
              {ERASER_SIZES.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  title={`Eraser ${size.label}`}
                  onClick={() => onEraserSizeChange(size.id)}
                  className={clsx(
                    "flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium transition",
                    eraserSize === size.id
                      ? "bg-[var(--brand)] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <span
                    className="rounded-full bg-current"
                    style={{
                      width: size.id === "s" ? 6 : size.id === "m" ? 10 : 14,
                      height: size.id === "s" ? 6 : size.id === "m" ? 10 : 14,
                    }}
                  />
                  <span>{size.label}</span>
                </button>
              ))}
            </div>
          ) : (
            /* Font Selector (Always accessible, aligns to right edge so it never overflows screen) */
            <CustomDropdown
              value={font}
              onChange={onFontChange}
              ariaLabel="Font"
              openUp
              borderless
              align="right"
              buttonClassName="h-10 px-3"
              options={BOARD_FONTS.map((f) => ({
                value: f.id,
                label: f.label,
                hint:
                  f.id === "computer-modern"
                    ? "LaTeX / academic"
                    : f.id === "architects-daughter"
                      ? "Handwritten"
                      : "Clean UI text",
              }))}
            />
          )}

          <div className="h-7 w-px bg-current/10" />

          {/* Clear Canvas Action (at the end of the menu bar) */}
          <button
            type="button"
            title="Clear canvas"
            onClick={onClearRequest}
            className="flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/15 active:scale-95 shrink-0"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear</span>
          </button>
        </aside>
      </div>
    </>
  );
}
