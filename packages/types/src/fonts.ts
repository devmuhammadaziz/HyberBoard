export type BoardFont = "computer-modern" | "inter" | "architects-daughter";

export const BOARD_FONTS: Array<{
  id: BoardFont;
  label: string;
  css: string;
}> = [
  {
    id: "computer-modern",
    label: "Computer Modern",
    css: '"Latin Modern Roman", "Computer Modern Serif", "STIX Two Text", "Times New Roman", serif',
  },
  {
    id: "inter",
    label: "Inter",
    css: 'var(--font-inter), Inter, "Segoe UI", system-ui, sans-serif',
  },
  {
    id: "architects-daughter",
    label: "Architects Daughter",
    css: 'var(--font-hand), "Architects Daughter", cursive',
  },
];

export function fontCss(id?: BoardFont) {
  return BOARD_FONTS.find((f) => f.id === id)?.css ?? BOARD_FONTS[1].css;
}
