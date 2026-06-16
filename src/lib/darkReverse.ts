import { parse, converter } from 'culori';
import type { PaletteColor } from '../types/visiology';

const toHsl = converter('hsl');
const toRgb = converter('rgb');

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Mirrors lightness (L' = 1 − L) while keeping hue, saturation and alpha.
 * This is a true involution: applying it twice restores the original color,
 * so white ↔ black, light grey ↔ dark grey, and toggling light/dark is stable.
 */
function invertColor(colorStr: string): string {
  const parsed = parse(colorStr);
  if (!parsed) return colorStr;

  const hsl = toHsl(parsed);
  if (!hsl) return colorStr;
  const h = hsl.h ?? 0;
  const s = hsl.s ?? 0;
  const l = hsl.l ?? 0.5;
  const a = hsl.alpha ?? 1;

  const lInv = clamp(1 - l, 0, 1);

  const rgb = toRgb({ mode: 'hsl', h, s, l: lInv });
  if (!rgb) return colorStr;

  const r = Math.round((rgb.r ?? 0) * 255);
  const g = Math.round((rgb.g ?? 0) * 255);
  const b = Math.round((rgb.b ?? 0) * 255);

  return `rgba(${r},${g},${b},${a})`;
}

/**
 * True when a string represents a single CSS color (#hex, rgb/rgba, hsl/hsla).
 * Used to safely deep-reverse only color fields and skip fonts/formatters/SVG.
 */
function isColorString(value: string): boolean {
  const s = value.trim();
  return (
    /^#[0-9a-fA-F]{3,8}$/.test(s) ||
    /^rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+/i.test(s) ||
    /^hsla?\(/i.test(s)
  );
}

// Keys whose nested colors are managed elsewhere (palette is re-synced separately).
const SKIP_KEYS = new Set(['ColorPalette']);

/**
 * Recursively reverses every color string inside an arbitrary theme structure.
 * Non-color strings (font families, formatters, icon markup, etc.) are left intact.
 * Returns a new structure; the input is not mutated.
 */
export function reverseThemeColors<T>(node: T): T {
  if (typeof node === 'string') {
    return (isColorString(node) ? invertColor(node) : node) as unknown as T;
  }
  if (Array.isArray(node)) {
    return node.map((item) => reverseThemeColors(item)) as unknown as T;
  }
  if (node !== null && typeof node === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      result[key] = SKIP_KEYS.has(key) ? value : reverseThemeColors(value);
    }
    return result as unknown as T;
  }
  return node;
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
