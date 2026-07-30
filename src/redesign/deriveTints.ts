/**
 * Palette derivation for the score drill-down (SOP §4).
 *
 * The drill-down arcs draw ONLY from the embed's accent — one hue family,
 * stepped tints/shades. No rainbow, no invented colors, no legend. These
 * helpers take the accent color and produce N legible mid-tone tints, ordered
 * so the largest contribution gets the base hue and deeper ranks step within
 * the same family.
 *
 * Lightness is deliberately clamped to a mid band so the arcs (and the white
 * points that ride on them) stay legible in BOTH light and dark themes — the
 * accent's own lightness varies by theme, but the derived arc lightness does
 * not.
 */

export type RGB = [number, number, number];

/** Parse an "r, g, b" CSS triplet (the shape our color tokens use). */
export const parseRgbTriplet = (value: string): RGB | null => {
  const m = value.trim().match(/(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
};

export const rgbToHsl = ([r, g, b]: RGB): [number, number, number] => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
        break;
    }
    h *= 60;
  }
  return [h, s * 100, l * 100];
};

export const hslToRgb = (h: number, s: number, l: number): RGB => {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = ln - c / 2;
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
};

const DEFAULT_ACCENT: RGB = [16, 185, 129]; // Human Passport emerald (#10B981)

/**
 * Derive `count` arc colors from `accent`, ranked (index 0 = largest slice).
 * ONE hue family (SOP §4, "no rainbow"): the accent's hue and saturation are
 * held fixed and only LIGHTNESS steps per rank, so every arc reads as the same
 * emerald — no hue-rotation drift toward teal/green. Lightness stays in a mid
 * band so the white points that ride on each arc stay legible in both themes.
 */
export const deriveTints = (accent: RGB | null, count: number): string[] => {
  const base = accent ?? DEFAULT_ACCENT;
  const [h, s] = rgbToHsl(base);
  const hue = h; // fixed — never rotated
  const sat = Math.min(Math.max(s, 55), 80);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    // Largest slice (i=0) is the deepest tone; deeper ranks step lighter within
    // the same emerald family. Clamped to a mid band (≤72) for point legibility.
    const light = Math.min(44 + i * 6, 72);
    const [r, g, b] = hslToRgb(hue, sat, light);
    out.push(`rgb(${r}, ${g}, ${b})`);
  }
  return out;
};
