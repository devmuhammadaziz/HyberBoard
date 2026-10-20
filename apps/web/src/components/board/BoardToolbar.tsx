"use client";

import { useEffect, useRef, useState } from "react";
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
  Baseline,
  Check,
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
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const fontMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fontMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (!fontMenuRef.current?.contains(e.target as Node)) {
        setFontMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFontMenuOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [fontMenuOpen]);

  // Main Core Interaction Tools (Placed in Bottom Bar, 1 - 5)
  const mainTools: {
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

  // Geometric Shape Tools (Placed in Left Vertical Dock, 6 - 9)
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
          : "text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text-primary)]"
      )}
    >
      {item.icon}

      {/* Floating keycap badge (Top-Right, clear & never colliding with the icon) */}
      <span
        className={clsx(
          "pointer-events-none absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-md px-1 font-mono text-[10px] font-bold leading-none shadow-xs transition",
          tool === item.id
            ? "bg-white text-indigo-700 ring-2 ring-indigo-500/20 scale-105"
            : "bg-[var(--bg)] text-[var(--text-primary)] border border-[var(--border)] group-hover:border-[var(--brand)] group-hover:text-[var(--brand)]"
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
          RIGHT VERTICAL DOCK (Shapes, Colors, Typography)
          Positioned on the right side of the screen (right-4, vertically centered)
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center">
        <aside
          aria-label="Shapes and styles dock"
          className="pointer-events-auto flex flex-col items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-2 shadow-2xl shadow-black/25 backdrop-blur-2xl"
        >
          {/* Shapes Section (6 - 9) */}
          <div className="flex flex-col items-center gap-1.5">
            {shapeTools.map(renderToolButton)}
          </div>

          <div className="my-0.5 h-px w-7 bg-[var(--border)]" />

          {/* Color Palette Section */}
          <div className="flex flex-col items-center gap-2 py-0.5">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onColorChange(c)}
                className={clsx(
                  "h-6 w-6 rounded-full border transition hover:scale-115 active:scale-95",
                  color === c
                    ? "ring-2 ring-[var(--brand)] ring-offset-2 ring-offset-[var(--surface)] scale-110 shadow-sm"
                    : "border-black/20 opacity-85 hover:opacity-100"
                )}
                style={{ background: c }}
                title={`Color: ${c}`}
              />
            ))}
          </div>

          <div className="my-0.5 h-px w-7 bg-[var(--border)]" />

          {/* Font Selector Trigger & Flyout Menu (opens to the left) */}
          <div ref={fontMenuRef} className="relative">
            <button
              type="button"
              title="Font family"
              onClick={() => setFontMenuOpen((v) => !v)}
              className={clsx(
                "flex h-10 w-10 items-center justify-center rounded-xl transition duration-150",
                fontMenuOpen
                  ? "bg-[var(--brand)] text-white shadow-md shadow-indigo-500/25"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text-primary)]"
              )}
            >
              <Baseline className="h-5 w-5" />
            </button>

            {fontMenuOpen && (
              <div
                role="menu"
                className="absolute right-full top-0 mr-3 z-50 min-w-[13rem] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-1.5 shadow-[0_18px_50px_-15px_rgba(0,0,0,0.55)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Typography
                </div>
                {BOARD_FONTS.map((f) => {
                  const active = f.id === font;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        onFontChange(f.id);
                        setFontMenuOpen(false);
                      }}
                      className={clsx(
                        "flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left transition",
                        active
                          ? "bg-[color-mix(in_oklab,var(--brand)_16%,transparent)] text-[var(--text-primary)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-xs font-medium">{f.label}</div>
                        <div className="truncate text-[10px] text-[var(--text-secondary)]">
                          {f.id === "computer-modern"
                            ? "LaTeX / academic"
                            : f.id === "architects-daughter"
                              ? "Handwritten notes"
                              : "Clean UI text"}
                        </div>
                      </div>
                      {active && <Check className="h-4 w-4 text-[var(--brand)] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          BOTTOM HORIZONTAL DOCK (Subject, Main Tools 1-5, History, Utilities)
          Centered horizontally at the bottom of the screen
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-40 flex justify-center px-4">
        <div className="pointer-events-auto flex max-w-[96vw] flex-wrap items-center justify-center gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 px-4 py-2.5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          {/* 1. Subject Selector */}
          <CustomDropdown
            value={subject}
            onChange={onSubjectChange}
            ariaLabel={t(locale, "subject")}
            openUp
            options={[
              { value: "math", label: t(locale, "math"), accent: "#10B981", hint: "Equations · graphs" },
              { value: "physics", label: t(locale, "physics"), accent: "#06B6D4", hint: "Forces · fields" },
              { value: "chemistry", label: t(locale, "chemistry"), accent: "#F59E0B", hint: "Reactions · molecules" },
            ]}
          />

          <div className="mx-1 h-7 w-px bg-[var(--border)]" />

          {/* 2. Main Feature Tools (1 - 5) */}
          <div className="flex items-center gap-1.5">
            {mainTools.map(renderToolButton)}
          </div>

          {/* Contextual Eraser Size Options */}
          {tool === "eraser" && (
            <>
              <div className="mx-1 h-7 w-px bg-[var(--border)]" />
              <div className="flex items-center gap-1 rounded-xl bg-[var(--bg)] p-1">
                {ERASER_SIZES.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    title={`Eraser ${size.label}`}
                    onClick={() => onEraserSizeChange(size.id)}
                    className={clsx(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition",
                      eraserSize === size.id
                        ? "bg-[var(--brand)] text-white"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface)]"
                    )}
                  >
                    <span
                      className="rounded-full bg-current"
                      style={{
                        width: size.id === "s" ? 6 : size.id === "m" ? 11 : 16,
                        height: size.id === "s" ? 6 : size.id === "m" ? 11 : 16,
                        opacity: 0.9,
                      }}
                    />
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="mx-1 h-7 w-px bg-[var(--border)]" />

          {/* 3. Undo / Redo Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              title={`${t(locale, "undo")} (⌘Z)`}
              onClick={onUndo}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-secondary)] transition hover:bg-[var(--bg)] hover:text-[var(--text-primary)]"
            >
              <Undo2 className="h-5 w-5" />
            </button>
            <button
              type="button"
              title={`${t(locale, "redo")} (⌘⇧Z)`}
              onClick={onRedo}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-secondary)] transition hover:bg-[var(--bg)] hover:text-[var(--text-primary)]"
            >
              <Redo2 className="h-5 w-5" />
            </button>
          </div>

          <div className="mx-1.5 h-7 w-px bg-[var(--border)]" />

          {/* 4. Utilities: Clear All, Shortcuts, Save Status */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              title="Clear everything"
              onClick={onClearRequest}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </button>

            <button
              type="button"
              title="Keyboard shortcuts (?)"
              onClick={() => setShortcutsOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] transition hover:bg-[var(--bg)] hover:text-[var(--text-primary)]"
              aria-label="Keyboard shortcuts"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
          </div>

          {saveLabel && (
            <span className="ml-1 rounded-full bg-[var(--bg)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]">
              {saveLabel}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
