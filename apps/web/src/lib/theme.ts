/**
 * Native View Transitions API + Web Animations API
 * Circular Reveal Theme Transition (Telegram / Linear / Raycast style)
 */

export type Theme = "dark" | "light";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = localStorage.getItem("hyperboard-theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return document.documentElement.classList.contains("dark") ||
    document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "dark"; // Default HyperBoard theme is dark
}

export function applyThemeDirectly(theme: Theme) {
  const isDark = theme === "dark";
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.classList.toggle("light", !isDark);
  root.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("hyperboard-theme", theme);
  } catch {}
}

export async function toggleThemeWithTransition(
  event?: React.MouseEvent | MouseEvent,
  targetTheme?: Theme,
  onApplyTheme?: (newTheme: Theme) => void | Promise<void>
): Promise<Theme> {
  if (typeof window === "undefined") return "dark";

  const root = document.documentElement;
  const currentIsDark =
    root.classList.contains("dark") || root.getAttribute("data-theme") === "dark";
  const nextTheme: Theme = targetTheme ?? (currentIsDark ? "light" : "dark");
  const isGoingToDark = nextTheme === "dark";

  // Check support and accessibility preferences
  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsViewTransition =
    "startViewTransition" in document && typeof document.startViewTransition === "function";

  if (!supportsViewTransition || isReducedMotion) {
    applyThemeDirectly(nextTheme);
    await onApplyTheme?.(nextTheme);
    return nextTheme;
  }

  // Determine origin coordinates for circular reveal
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;

  if (event && event.clientX !== undefined && event.clientY !== undefined) {
    x = event.clientX;
    y = event.clientY;
  } else if (event?.currentTarget && "getBoundingClientRect" in event.currentTarget) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    x = rect.left + rect.width / 2;
    y = rect.top + rect.height / 2;
  }

  // Calculate maximum distance to the furthest screen corner
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  // Trigger View Transition
  const transition = (document as any).startViewTransition(async () => {
    applyThemeDirectly(nextTheme);
    await onApplyTheme?.(nextTheme);
  });

  try {
    await transition.ready;

    // Smooth circular reveal animation via Web Animations API
    if (isGoingToDark) {
      // Dark screenshot reveals on top, expanding outward from click point
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    } else {
      // Light screenshot reveals underneath as the old dark view collapses into the click point
      root.animate(
        {
          clipPath: [
            `circle(${endRadius}px at ${x}px ${y}px)`,
            `circle(0px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-old(root)",
        }
      );
    }
  } catch (err) {
    // If browser aborts view transition, fallback safely
    applyThemeDirectly(nextTheme);
    await onApplyTheme?.(nextTheme);
  }

  return nextTheme;
}
