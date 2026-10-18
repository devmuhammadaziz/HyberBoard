/** Try to evaluate simple arithmetic / algebra locally (Apple Math Notes style). */
export function tryLocalSolve(raw: string): string | null {
  let input = raw.trim();
  if (!input) return null;

  // Normalize common ink/text forms
  input = input
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  // Complete trailing equals: "7 + 3 =" → evaluate left side
  const trailingEq = input.match(/^(.+?)=\s*$/);
  if (trailingEq) input = trailingEq[1].trim();

  // "7 + 3 = ?" → left side
  const qEq = input.match(/^(.+?)=\s*\?$/);
  if (qEq) input = qEq[1].trim();

  // Only allow safe math chars
  if (!/^[\d\s+\-*/().^%]+$/.test(input)) return null;

  try {
    const expr = input.replace(/\^/g, "**");
    // eslint-disable-next-line no-new-func
    const value = Function(`"use strict"; return (${expr});`)();
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    // Nice formatting
    if (Number.isInteger(value)) return String(value);
    const rounded = Math.round(value * 1e10) / 1e10;
    return String(rounded);
  } catch {
    return null;
  }
}
