"use client";

import { useMemo, useState } from "react";
import {
  featuresByGroup,
  type AiFeatureId,
  type AiResponse,
  type Subject,
} from "@smart-desk/types";
import {
  Sparkles,
  Copy,
  Trash2,
  Loader2,
  X,
  Minus,
  Equal,
  LineChart,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { tryLocalSolve } from "@/lib/math-solve";
import { parsePlotFromText, plotDataFromApi } from "@/lib/plot-from-text";
import type { PlotData } from "@smart-desk/types";
import clsx from "clsx";

type Props = {
  subject: Subject;
  screenX: number;
  screenY: number;
  selectionText: string;
  boardId?: string;
  boardTitle?: string;
  color: string;
  onColorChange: (c: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDashToggle: () => void;
  onSolveAnswer: (answer: string) => void;
  onPlot: (plot: PlotData) => void;
  onResult: (result: AiResponse) => void;
  captureImage: () => Promise<string | null>;
};

const COLORS = ["#4F46E5", "#F9FAFB", "#10B981", "#06B6D4", "#F59E0B", "#EF4444", "#0F172A"];

export function SelectionMenu({
  subject,
  screenX,
  screenY,
  selectionText,
  boardId,
  boardTitle,
  color,
  onColorChange,
  onDuplicate,
  onDelete,
  onDashToggle,
  onSolveAnswer,
  onPlot,
  onResult,
  captureImage,
}: Props) {
  const { locale } = useAuth();
  const groups = useMemo(() => featuresByGroup(subject), [subject]);
  const [aiOpen, setAiOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(groups[0]?.id ?? null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeFeatures =
    groups.find((g) => g.id === activeGroup)?.features ?? groups[0]?.features ?? [];

  const plot = async () => {
    setBusy("plot");
    setError(null);
    try {
      const local = parsePlotFromText(selectionText);
      if (local) {
        onPlot(local);
        return;
      }

      const imageBase64 = await captureImage();
      if (!selectionText.trim() && !imageBase64) {
        setError("Select an equation, points, or vector first");
        return;
      }

      const data = await api<{
        result: {
          mode?: "2d" | "3d";
          title?: string;
          rawLatex?: string;
          normalizedExpression?: string | null;
          expression?: string | null;
          variable?: "x" | "y";
          functionType?: string;
          suggestedDomain?: [number, number] | null;
          points?: Array<{ x: number; y: number; label?: string }>;
          vectors?: Array<{
            x: number;
            y: number;
            label?: string;
            from?: { x: number; y: number };
          }>;
        };
      }>("/ai/plot", {
        method: "POST",
        body: JSON.stringify({
          text: selectionText || undefined,
          imageBase64: imageBase64 || undefined,
          subject,
          locale,
        }),
      });

      // Client-side mathjs sampling only — never trust LLM coordinates for curves
      const parsed = plotDataFromApi(data.result);
      if (!parsed) {
        setError("Could not build a graph from that selection");
        return;
      }
      onPlot(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Plot failed");
    } finally {
      setBusy(null);
    }
  };

  const solve = async () => {
    setBusy("solve");
    setError(null);
    try {
      const local = tryLocalSolve(selectionText);
      if (local) {
        onSolveAnswer(local);
        return;
      }

      const imageBase64 = await captureImage();
      const data = await api<{
        result: { answer: string; expression?: string | null; latex?: string | null };
      }>("/ai/solve", {
        method: "POST",
        body: JSON.stringify({
          text: selectionText || undefined,
          imageBase64: imageBase64 || undefined,
          subject,
          locale,
        }),
      });
      onSolveAnswer(data.result.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Solve failed");
    } finally {
      setBusy(null);
    }
  };

  const run = async (featureId: AiFeatureId) => {
    const value = selectionText.trim();
    if (!value) {
      setError("Write an equation first (Text tool or Solve on ink)");
      return;
    }
    setBusy(featureId);
    setError(null);
    try {
      const data = await api<{ result: AiResponse }>("/ai/run", {
        method: "POST",
        body: JSON.stringify({
          featureId,
          subject,
          input: value,
          locale,
          selection: { elementIds: [], text: value },
          boardContext: { boardId, title: boardTitle },
        }),
      });
      onResult(data.result);
      setAiOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="pointer-events-auto absolute z-50"
      style={{ left: screenX, top: screenY, transform: "translate(-50%, -120%)" }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)]/95 px-2 py-1.5 shadow-[var(--shadow)] backdrop-blur-xl">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onColorChange(c)}
            className={clsx(
              "h-4 w-4 rounded-full",
              color === c && "ring-2 ring-[var(--brand)] ring-offset-1"
            )}
            style={{ background: c }}
          />
        ))}
        <button type="button" title="Dash" onClick={onDashToggle} className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg)]">
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Duplicate" onClick={onDuplicate} className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg)]">
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Delete" onClick={onDelete} className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10">
          <Trash2 className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          title="Solve"
          disabled={!!busy}
          onClick={() => void solve()}
          className="ml-0.5 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60"
        >
          {busy === "solve" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Equal className="h-3.5 w-3.5" />
          )}
          Solve
        </button>

        <button
          type="button"
          title="Plot graph"
          disabled={!!busy}
          onClick={() => void plot()}
          className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60"
        >
          {busy === "plot" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LineChart className="h-3.5 w-3.5" />
          )}
          Graph
        </button>

        <button
          type="button"
          title="AI"
          onClick={() => setAiOpen((v) => !v)}
          className={clsx(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
            aiOpen ? "bg-[var(--brand)] text-white" : "bg-[var(--brand)]/15 text-[var(--brand)]"
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI
        </button>
      </div>

      {error && (
        <p className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-center text-[11px] text-red-300">
          {error}
        </p>
      )}

      {aiOpen && (
        <div className="absolute left-1/2 top-full z-50 mt-3 w-[340px] -translate-x-1/2 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-3 shadow-[var(--shadow)] backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              AI for {subject}
            </div>
            <button type="button" onClick={() => setAiOpen(false)} className="text-[var(--text-secondary)]">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-2 flex flex-wrap gap-1">
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setActiveGroup(g.id)}
                className={clsx(
                  "rounded-full px-2.5 py-1 text-[11px]",
                  activeGroup === g.id
                    ? "bg-[var(--brand)] text-white"
                    : "bg-[var(--bg)] text-[var(--text-secondary)]"
                )}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            {activeFeatures.map((f) => (
              <button
                key={f.id}
                type="button"
                disabled={!!busy}
                onClick={() => void run(f.id)}
                className="flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left hover:bg-[var(--bg)] disabled:opacity-60"
              >
                {busy === f.id ? (
                  <Loader2 className="mt-0.5 h-3.5 w-3.5 animate-spin text-[var(--brand)]" />
                ) : (
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--subject)]" />
                )}
                <span>
                  <span className="block text-sm text-[var(--text-primary)]">{f.name}</span>
                  <span className="block text-[11px] text-[var(--text-secondary)]">{f.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
