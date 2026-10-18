"use client";

import { useMemo, useState } from "react";
import { featuresForSubject, type AiFeatureId, type AiResponse, type Subject } from "@smart-desk/types";
import { Sparkles, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { t } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

type Props = {
  subject: Subject;
  open: boolean;
  x: number;
  y: number;
  selectionText: string;
  boardId?: string;
  boardTitle?: string;
  onResult: (result: AiResponse) => void;
  onClose: () => void;
};

export function ContextualAiMenu({
  subject,
  open,
  x,
  y,
  selectionText,
  boardId,
  boardTitle,
  onResult,
  onClose,
}: Props) {
  const { locale } = useAuth();
  const features = useMemo(() => featuresForSubject(subject), [subject]);
  const [input, setInput] = useState(selectionText);
  const [active, setActive] = useState<AiFeatureId | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const run = async (featureId: AiFeatureId) => {
    const value = input.trim() || selectionText.trim();
    if (!value) {
      setError(t(locale, "noSelection"));
      return;
    }
    setActive(featureId);
    setError(null);
    try {
      const data = await api<{ result: AiResponse }>("/ai/run", {
        method: "POST",
        body: JSON.stringify({
          featureId,
          subject,
          input: value,
          locale,
          selection: {
            elementIds: [],
            text: value,
          },
          boardContext: { boardId, title: boardTitle },
        }),
      });
      onResult(data.result);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI failed");
    } finally {
      setActive(null);
    }
  };

  return (
    <div
      className="absolute z-40 w-[320px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow)]"
      style={{ left: x, top: y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
        <Sparkles className="h-4 w-4 text-[var(--brand)]" />
        {t(locale, "aiTools")}
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t(locale, "aiInputPlaceholder")}
        className="mb-2 h-20 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand)]"
      />
      <div className="max-h-56 space-y-1 overflow-y-auto">
        {features.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => void run(f.id)}
            disabled={!!active}
            className="flex w-full items-start gap-2 rounded-xl px-2.5 py-2 text-left transition hover:bg-[var(--bg)] disabled:opacity-60"
          >
            {active === f.id ? (
              <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-[var(--brand)]" />
            ) : (
              <span className="mt-0.5 h-2 w-2 rounded-full bg-[var(--subject)]" />
            )}
            <span>
              <span className="block text-sm text-[var(--text-primary)]">{f.name}</span>
              <span className="block text-xs text-[var(--text-secondary)]">
                {f.description}
              </span>
            </span>
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
