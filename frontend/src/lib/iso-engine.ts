/**
 * Isometric office engine — pure SVG helpers.
 * Grid convention: right=(+col), forward=(+row); viewer looks from South-East.
 */

export const TW = 80;   // tile width in px
export const TH = 40;   // tile height in px (TW/2 for classic 2:1 iso)

/** Grid → screen X */
export const sx = (c: number, r: number) => (c - r) * (TW / 2);

/** Grid → screen Y */
export const sy = (c: number, r: number) => (c + r) * (TH / 2);

/** SVG point string */
export const pt = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;

/** Iso rhombus polygon string for a 1×1 tile */
export function tilePts(c: number, r: number): string {
  return [
    pt(sx(c,   r),   sy(c,   r)),
    pt(sx(c+1, r),   sy(c+1, r)),
    pt(sx(c+1, r+1), sy(c+1, r+1)),
    pt(sx(c,   r+1), sy(c,   r+1)),
  ].join(" ");
}

/** 3D box face polygons */
export function boxFaces(c: number, r: number, w: number, d: number, h: number) {
  // top face
  const top = [
    pt(sx(c,   r),   sy(c,   r)),
    pt(sx(c+w, r),   sy(c+w, r)),
    pt(sx(c+w, r+d), sy(c+w, r+d)),
    pt(sx(c,   r+d), sy(c,   r+d)),
  ].join(" ");

  // left face (west-facing, darker)
  const left = [
    pt(sx(c, r),     sy(c, r)),
    pt(sx(c, r+d),   sy(c, r+d)),
    pt(sx(c, r+d),   sy(c, r+d) + h),
    pt(sx(c, r),     sy(c, r)   + h),
  ].join(" ");

  // right face (south-facing, mid-dark)
  const right = [
    pt(sx(c,   r+d), sy(c,   r+d)),
    pt(sx(c+w, r+d), sy(c+w, r+d)),
    pt(sx(c+w, r+d), sy(c+w, r+d) + h),
    pt(sx(c,   r+d), sy(c,   r+d) + h),
  ].join(" ");

  return { top, left, right };
}

export type AgentState = "working" | "reviewing" | "idle" | "offline";

export const TIER_COLOR: Record<string, string> = {
  root:       "#f59e0b",
  sub:        "#3b82f6",
  supporting: "#8b5cf6",
  system:     "#6b7280",
};
