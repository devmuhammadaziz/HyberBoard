"use client";

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
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { t } from "@/lib/i18n";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { ERASER_SIZES, type EraserSizeId } from "@/lib/board-utils";
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

  const tools: { id: BoardTool; icon: React.ReactNode; label: string }[] = [
    { id: "select", icon: <MousePointer2 className="h-4 w-4" />, label: "Select" },
    { id: "hand", icon: <Hand className="h-4 w-4" />, label: "Pan" },
    { id: "pen", icon: <Pencil className="h-4 w-4" />, label: t(locale, "pen") },
    { id: "eraser", icon: <Eraser className="h-4 w-4" />, label: t(locale, "eraser") },
    { id: "text", icon: <Type className="h-4 w-4" />, label: t(locale, "text") },
    { id: "rect", icon: <Square className="h-4 w-4" />, label: "Rectangle" },
    { id: "ellipse", icon: <Circle className="h-4 w-4" />, label: "Ellipse" },
    { id: "line", icon: <Minus className="h-4 w-4" />, label: "Line" },
    { id: "arrow", icon: <MoveUpRight className="h-4 w-4" />, label: "Arrow" },
  ];

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-[95vw] flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 px-3 py-2 shadow-[var(--shadow)] backdrop-blur-xl">
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

        <div className="mx-1 h-5 w-px bg-[var(--border)]" />

        {tools.map((item) => (
          <button
            key={item.id}
            type="button"
            title={item.label}
            onClick={() => onToolChange(item.id)}
            className={clsx(
              "rounded-xl p-2 transition",
              tool === item.id
                ? "bg-[var(--brand)] text-white"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text-primary)]"
            )}
          >
            {item.icon}
          </button>
        ))}

        {tool === "eraser" && (
          <>
            <div className="mx-1 h-5 w-px bg-[var(--border)]" />
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

        <div className="mx-1 h-5 w-px bg-[var(--border)]" />

        <button type="button" title={t(locale, "undo")} onClick={onUndo} className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg)]">
          <Undo2 className="h-4 w-4" />
        </button>
        <button type="button" title={t(locale, "redo")} onClick={onRedo} className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg)]">
          <Redo2 className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-[var(--border)]" />

        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onColorChange(c)}
            className={clsx(
              "h-5 w-5 rounded-full border",
              color === c ? "ring-2 ring-[var(--brand)] ring-offset-1 ring-offset-[var(--surface)]" : "border-black/10"
            )}
            style={{ background: c }}
          />
        ))}

        <CustomDropdown
          value={font}
          onChange={onFontChange}
          ariaLabel="Font"
          openUp
          align="right"
          options={BOARD_FONTS.map((f) => ({
            value: f.id,
            label: f.label,
            hint:
              f.id === "computer-modern"
                ? "LaTeX / academic"
                : f.id === "architects-daughter"
                  ? "Handwritten notes"
                  : "Clean UI text",
          }))}
        />

        <button
          type="button"
          title="Clear everything"
          onClick={onClearRequest}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear all
        </button>

        {saveLabel && (
          <span className="ml-1 rounded-full bg-[var(--bg)] px-2.5 py-1 text-[10px] text-[var(--text-secondary)]">
            {saveLabel}
          </span>
        )}
      </div>
    </div>
  );
}
