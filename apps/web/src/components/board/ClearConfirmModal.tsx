"use client";

type Props = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ClearConfirmModal({ open, onCancel, onConfirm }: Props) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-[80] grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
        <h3 className="text-lg font-semibold">Clear this board?</h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Everything on the canvas will be cleared. A deleted snapshot is saved in the database for a future restore (Pro).
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white"
          >
            Yes, clear
          </button>
        </div>
      </div>
    </div>
  );
}
