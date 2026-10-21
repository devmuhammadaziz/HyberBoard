"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import clsx from "clsx";

export type DropdownOption<T extends string = string> = {
  value: T;
  label: string;
  hint?: string;
  accent?: string;
};

type Props<T extends string> = {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  align?: "left" | "right" | "center";
  size?: "sm" | "md";
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  openUp?: boolean;
  ariaLabel?: string;
  borderless?: boolean;
};

export function CustomDropdown<T extends string>({
  value,
  options,
  onChange,
  placeholder = "Select",
  align = "left",
  size = "sm",
  className,
  buttonClassName,
  menuClassName,
  openUp = true,
  ariaLabel,
  borderless = false,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
    function handleOutside(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
  }, [open]);

  return (
    <div ref={rootRef} className={clsx("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel || placeholder}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "group inline-flex items-center gap-2 rounded-xl text-[var(--text-primary)] transition",
          borderless
            ? "bg-[var(--surface)]/90 shadow-sm hover:bg-[var(--surface)]"
            : "border border-[var(--border)] bg-[var(--bg)]/80 hover:border-[color-mix(in_oklab,var(--brand)_45%,var(--border))] hover:bg-[var(--surface)]",
          open && "ring-2 ring-[color-mix(in_oklab,var(--brand)_25%,transparent)] bg-[var(--surface)]",
          size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2.5 text-sm",
          buttonClassName
        )}
      >
        {selected?.accent && (
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: selected.accent }}
          />
        )}
        <span className="max-w-[9rem] truncate font-medium">
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          className={clsx(
            "h-3.5 w-3.5 text-[var(--text-secondary)] transition duration-200",
            open && "rotate-180 text-[var(--brand)]"
          )}
        />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          className={clsx(
            "absolute z-[100] min-w-[12rem] overflow-hidden rounded-2xl p-1.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-150 animate-in fade-in zoom-in-95",
            borderless
              ? "bg-[var(--surface)]/95 shadow-2xl shadow-black/25"
              : "border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_92%,transparent)]",
            openUp ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]",
            align === "left" && "left-0",
            align === "right" && "right-0",
            align === "center" && "left-1/2 -translate-x-1/2",
            menuClassName
          )}
        >
          <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-[var(--brand)] to-transparent opacity-50" />
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={clsx(
                  "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition",
                  active
                    ? "bg-[color-mix(in_oklab,var(--brand)_16%,transparent)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text-primary)]"
                )}
              >
                {option.accent ? (
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: option.accent }}
                  />
                ) : (
                  <span className="grid h-4 w-4 place-items-center">
                    {active ? <Check className="h-3.5 w-3.5 text-[var(--brand)]" /> : null}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">{option.label}</span>
                  {option.hint && (
                    <span className="block truncate text-[10px] text-[var(--text-secondary)]">
                      {option.hint}
                    </span>
                  )}
                </span>
                {active && option.accent && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-[var(--brand)]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
