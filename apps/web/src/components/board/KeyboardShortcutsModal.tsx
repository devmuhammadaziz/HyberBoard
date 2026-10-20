"use client";

import React from "react";
import { X, Command, Keyboard } from "lucide-react";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({
  open,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!open) return null;

  const toolsShortcuts = [
    { key: "1", alt: "V", label: "Selection tool" },
    { key: "2", alt: "H", label: "Hand / Pan canvas" },
    { key: "3", alt: "P", label: "Pen (freehand drawing)" },
    { key: "4", alt: "E", label: "Eraser" },
    { key: "5", alt: "T", label: "Text tool" },
    { key: "6", alt: "R", label: "Rectangle" },
    { key: "7", alt: "O", label: "Ellipse / Circle" },
    { key: "8", alt: "L", label: "Line" },
    { key: "9", alt: "A", label: "Arrow" },
  ];

  const actionShortcuts = [
    { key: "Space + Drag", label: "Quick pan canvas" },
    { key: "Ctrl / ⌘ + Z", label: "Undo last action" },
    { key: "Ctrl / ⌘ + Shift + Z", label: "Redo action" },
    { key: "Delete / ⌫", label: "Delete selected elements" },
    { key: "Ctrl / ⌘ + A", label: "Select all elements" },
    { key: "Escape", label: "Clear selection / Cancel" },
    { key: "0", label: "Reset view zoom & pan" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand)]/15 text-[var(--brand)]">
              <Keyboard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Keyboard Shortcuts
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Excalidraw-style hotkeys for fast blackboard teaching
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-secondary)] transition hover:bg-[var(--bg)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Tools column */}
          <div>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Drawing Tools
            </h4>
            <div className="space-y-2">
              {toolsShortcuts.map((s) => (
                <div
                  key={s.key}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-[var(--text-secondary)]">{s.label}</span>
                  <div className="flex items-center gap-1 font-mono">
                    <kbd className="inline-flex min-w-[20px] items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--text-primary)] shadow-sm">
                      {s.key}
                    </kbd>
                    <span className="text-[10px] text-[var(--text-secondary)]">/</span>
                    <kbd className="inline-flex min-w-[20px] items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--text-secondary)] shadow-sm">
                      {s.alt}
                    </kbd>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions column */}
          <div>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Canvas Navigation
            </h4>
            <div className="space-y-2">
              {actionShortcuts.map((s) => (
                <div
                  key={s.key}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-[var(--text-secondary)]">{s.label}</span>
                  <kbd className="inline-flex items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg)] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[var(--text-primary)] shadow-sm">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-[var(--border)] pt-4 text-center text-xs text-[var(--text-secondary)]">
          Press any number <kbd className="rounded border border-[var(--border)] bg-[var(--bg)] px-1 py-0.5 font-mono text-[10px]">1</kbd> - <kbd className="rounded border border-[var(--border)] bg-[var(--bg)] px-1 py-0.5 font-mono text-[10px]">9</kbd> on your keyboard to instantly switch tools.
        </div>
      </div>
    </div>
  );
}
