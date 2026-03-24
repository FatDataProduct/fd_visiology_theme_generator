import { parse, converter } from 'culori';
import type { PaletteColor } from '../types/visiology';

const toHsl = converter('hsl');
const toRgb = converter('rgb');

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Inverts lightness: L_dark = 1 – L_light × 0.85
 * Reduces saturation for light neutrals (S < 10%)
 */
function invertColor(colorStr: string): string {
  const parsed = parse(colorStr);
  if (!parsed) return colorStr;

  const hsl = toHsl(parsed);
  if (!hsl) return colorStr;
  const h = hsl.h ?? 0;
  let s = hsl.s ?? 0;
  const l = hsl.l ?? 0.5;
  const a = hsl.alpha ?? 1;

  const lDark = clamp(1 - l * 0.85, 0, 1);

  if (s < 0.1) {
    s = clamp(s * 0.7, 0, 1);
  }

  const rgb = toRgb({ mode: 'hsl', h, s, l: lDark });
  if (!rgb) return colorStr;

  const r = Math.round((rgb.r ?? 0) * 255);
  const g = Math.round((rgb.g ?? 0) * 255);
  const b = Math.round((rgb.b ?? 0) * 255);

  return `rgba(${r},${g},${b},${a})`;
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Returns white or black text color based on WCAG contrast against background
 */
export function getContrastTextColor(bgColor: string): string {
  const parsed = parse(bgColor);
  if (!parsed) return 'rgba(255,255,255,1)';

  const rgb = toRgb(parsed);
  if (!rgb) return 'rgba(255,255,255,1)';
  const r = Math.round((rgb.r ?? 0) * 255);
  const g = Math.round((rgb.g ?? 0) * 255);
  const b = Math.round((rgb.b ?? 0) * 255);

  const bgLum = getRelativeLuminance(r, g, b);
  const whiteLum = getRelativeLuminance(255, 255, 255);
  const blackLum = getRelativeLuminance(0, 0, 0);

  const whiteContrast = contrastRatio(bgLum, whiteLum);
  const blackContrast = contrastRatio(bgLum, blackLum);

  return whiteContrast >= blackContrast ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)';
}

export function reversePalette(palette: PaletteColor[]): PaletteColor[] {
  return palette.map((color) => ({
    ...color,
    value: invertColor(color.value),
  }));
}

export function reverseColorString(color: string): string {
  return invertColor(color);
}

export function isDarkBackground(color: string): boolean {
  const parsed = parse(color);
  if (!parsed) return false;
  const hsl = toHsl(parsed);
  if (!hsl) return false;
  return (hsl.l ?? 0.5) < 0.4;
}
