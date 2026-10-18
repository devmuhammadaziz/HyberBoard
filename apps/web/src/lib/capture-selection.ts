import type { Point } from "@smart-desk/types";

/** Rasterize the live SVG board cropped around a world-space selection. */
export async function captureSelectionPng(
  svg: SVGSVGElement,
  bounds: { x: number; y: number; width: number; height: number },
  viewport: { x: number; y: number; zoom: number },
  padding = 24
): Promise<string | null> {
  try {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const pad = padding / viewport.zoom;
    const viewX = bounds.x - pad;
    const viewY = bounds.y - pad;
    const viewW = Math.max(bounds.width + pad * 2, 40);
    const viewH = Math.max(bounds.height + pad * 2, 40);

    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(Math.ceil(viewW * viewport.zoom)));
    clone.setAttribute("height", String(Math.ceil(viewH * viewport.zoom)));
    clone.setAttribute("viewBox", `${viewX} ${viewY} ${viewW} ${viewH}`);

    // Flatten transform so viewBox crops correctly
    const g = clone.querySelector("g");
    if (g) g.removeAttribute("transform");

    const xml = new XMLSerializer().serializeToString(clone);
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;

    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewW * viewport.zoom);
    canvas.height = Math.ceil(viewH * viewport.zoom);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#0B0F19";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export type WorldBounds = { x: number; y: number; width: number; height: number };

export function worldToScreen(
  p: Point,
  viewport: { x: number; y: number; zoom: number }
) {
  return {
    x: p.x * viewport.zoom + viewport.x,
    y: p.y * viewport.zoom + viewport.y,
  };
}
