/**
 * The "A" mark, redrawn from the brand board (same geometry as the explainer's
 * src/brand/markGeometry.ts). Used by BrandMark.astro and the hero stage's 3D sign.
 */

export type MarkVariant = "onDark" | "onLight";
export type MarkPart = "right" | "left" | "fold" | "orange";

export const markViewBox = { x: 206, y: 116, width: 304, height: 236 };

export const markPaths: readonly { part: MarkPart; d: string }[] = [
  { part: "right", d: "M357 127 L389 127 L499 342 L449 342 Z" },
  { part: "left", d: "M342 127 L390 127 L268 338 L219 338 Z" },
  { part: "fold", d: "M334 276 C344 256 370 249 388 270 L434 342 L384 342 L350 284 Z" },
  { part: "orange", d: "M330 268 C334 268 337 271 339 274 L286 342 L218 342 Z" },
];

/** Gradient direction per part, in objectBoundingBox units (y1 is always 0). */
export const markGradients: Record<MarkPart, { x1: number; x2: number; y2: number }> = {
  left: { x1: 0, x2: 0, y2: 1 },
  right: { x1: 0, x2: 0, y2: 1 },
  fold: { x1: 0, x2: 1, y2: 1 },
  orange: { x1: 1, x2: 0, y2: 1 },
};

export const markColors: Record<MarkVariant, Record<MarkPart, readonly [string, string]>> = {
  onLight: {
    left: ["#192530", "#354350"],
    right: ["#6A89A9", "#577493"],
    fold: ["#1C2733", "#46576A"],
    orange: ["#FAB672", "#F2A250"],
  },
  onDark: {
    left: ["#F1F3F4", "#A1A9B1"],
    right: ["#7496B7", "#6784A4"],
    fold: ["#F4F6F6", "#C9D0D6"],
    orange: ["#F2A250", "#E38F44"],
  },
};
