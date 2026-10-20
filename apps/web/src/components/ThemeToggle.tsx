"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { toggleThemeWithTransition, getInitialTheme, Theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth-context";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ThemeToggle({ className = "", size = "md" }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<Theme>("dark");
  const auth = useAuthSafe();

  useEffect(() => {
    setMounted(true);
    const initial = getInitialTheme();
    setThemeState(initial);
  }, []);

  const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = await toggleThemeWithTransition(e, undefined, async (newTheme) => {
      setThemeState(newTheme);
      if (auth?.setTheme) {
        try {
          await auth.setTheme(newTheme);
        } catch {}
      }
    });
    setThemeState(nextTheme);
  };

  const isDark = theme === "dark";
  const sizeClasses =
    size === "sm"
      ? "h-8 w-8 text-xs"
      : size === "lg"
      ? "h-11 w-11 text-base"
      : "h-9 w-9 text-sm";

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`relative inline-flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-black/5 text-zinc-400 hover:text-white dark:hover:text-white light:hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${sizeClasses} ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4 transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon className="h-4 w-4 transition-transform duration-300 hover:-rotate-12" />
        )
      ) : (
        <span className="h-4 w-4" />
      )}
    </button>
  );
}

function useAuthSafe() {
  try {
    return useAuth();
  } catch {
    return null;
  }
}
