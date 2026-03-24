import { parse, converter } from 'culori';
import type { PaletteColor } from '../types/visiology';

const toRgb = converter('rgb');
const toHsl = converter('hsl');

export type HarmonyMethod =
  | 'monochromatic'
  | 'complementary'
  | 'splitComplementary'
  | 'triadic'
  | 'square'
  | 'hexadic'
  | 'analogous'
  | 'accentedAnalogous';

export const HARMONY_LABELS: Record<HarmonyMethod, string> = {
  monochromatic: 'Monochromatic',
  complementary: 'Complementary',
  splitComplementary: 'Split Complementary',
  triadic: 'Triadic',
  square: 'Square',
  hexadic: 'Hexadic',
  analogous: 'Analogous',
  accentedAnalogous: 'Accented Analogous',
};

export interface RefinementValues {
  brightness: number;   // -50..+50, default 0
  saturation: number;   // -50..+50, default 0
  hueShift: number;     // -180..+180, default 0
  temperature: number;  // -50..+50, default 0
}

export const DEFAULT_REFINEMENT: RefinementValues = {
  brightness: 0,
  saturation: 0,
  hueShift: 0,
  temperature: 0,
};

function generateId(): string {
  const hex = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 32; i++) {
    id += hex[Math.floor(Math.random() * 16)];
  }
  return id;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function hslToRgba(h: number, s: number, l: number): string {
  const color = toRgb({ mode: 'hsl', h: ((h % 360) + 360) % 360, s: clamp(s, 0, 1), l: clamp(l, 0, 1) });
  if (!color) return 'rgba(0,0,0,1)';
  const r = Math.round((color.r ?? 0) * 255);
  const g = Math.round((color.g ?? 0) * 255);
  const b = Math.round((color.b ?? 0) * 255);
  return `rgba(${r}, ${g}, ${b}, 1)`;
}

function distributeByLightness(baseH: number, baseS: number, count: number): Array<{ h: number; s: number; l: number }> {
  const results: Array<{ h: number; s: number; l: number }> = [];
  for (let i = 0; i < count; i++) {
    const l = 0.15 + (0.70 / Math.max(count - 1, 1)) * i;
    results.push({ h: baseH, s: baseS, l });
  }
  return results;
}

function distributeAcrossHues(hues: number[], baseS: number, count: number): Array<{ h: number; s: number; l: number }> {
  const results: Array<{ h: number; s: number; l: number }> = [];
  const perHue = Math.ceil(count / hues.length);
  for (let hi = 0; hi < hues.length && results.length < count; hi++) {
    const stepsForThisHue = Math.min(perHue, count - results.length);
    for (let j = 0; j < stepsForThisHue; j++) {
      const l = stepsForThisHue === 1 ? 0.5 : 0.25 + (0.50 / Math.max(stepsForThisHue - 1, 1)) * j;
      results.push({ h: hues[hi], s: baseS, l });
    }
  }
  return results;
}

function generateBaseColors(method: HarmonyMethod, seedH: number, seedS: number, seedL: number, count: number): Array<{ h: number; s: number; l: number }> {
  switch (method) {
    case 'monochromatic':
      return distributeByLightness(seedH, seedS, count);

    case 'complementary':
      return distributeAcrossHues([seedH, (seedH + 180) % 360], seedS, count);

    case 'splitComplementary':
      return distributeAcrossHues([seedH, (seedH + 150) % 360, (seedH + 210) % 360], seedS, count);

    case 'triadic':
      return distributeAcrossHues([seedH, (seedH + 120) % 360, (seedH + 240) % 360], seedS, count);

    case 'square':
      return distributeAcrossHues([seedH, (seedH + 90) % 360, (seedH + 180) % 360, (seedH + 270) % 360], seedS, count);

    case 'hexadic':
      return distributeAcrossHues(
        [seedH, (seedH + 60) % 360, (seedH + 120) % 360, (seedH + 180) % 360, (seedH + 240) % 360, (seedH + 300) % 360],
        seedS,
        count,
      );

    case 'analogous':
      return distributeAcrossHues([(seedH + 330) % 360, seedH, (seedH + 30) % 360], seedS, count);

    case 'accentedAnalogous': {
      const analogousCount = Math.max(count - 1, 1);
      const base = distributeAcrossHues([(seedH + 330) % 360, seedH, (seedH + 30) % 360], seedS, analogousCount);
      base.push({ h: (seedH + 180) % 360, s: 1, l: 0.5 });
      return base.slice(0, count);
    }

    default:
      return distributeByLightness(seedH, seedS, count);
  }
}

/**
 * Generate palette from seed color, using specified harmony method.
 * Adds randomization so each call produces a different variation.
 */
export function generatePaletteFromSeed(
  seedHex: string,
  method: HarmonyMethod,
  count: number,
): PaletteColor[] {
  const parsed = parse(seedHex);
  if (!parsed) return getDefaultPaletteColors().slice(0, count);

  const hsl = toHsl(parsed);
  if (!hsl) return getDefaultPaletteColors().slice(0, count);

  const randomHueOffset = Math.random() * 360;
  const randomSatBase = 0.55 + Math.random() * 0.35;
  const randomLMid = 0.40 + Math.random() * 0.20;

  const h = ((hsl.h ?? 0) + randomHueOffset) % 360;
  const s = randomSatBase;

  const baseColors = generateBaseColors(method, h, s, randomLMid, count);

  const roles = Array.from({ length: count }, (_, i) => `Color ${i + 1}`);

  return baseColors.map((c, i) => ({
    id: generateId(),
    role: roles[i],
    value: hslToRgba(c.h, c.s, c.l),
  }));
}

/**
 * Apply refinement adjustments to unlocked palette colors.
 */
export function applyRefinement(
  palette: PaletteColor[],
  refinement: RefinementValues,
  lockedIndices: Set<number>,
): PaletteColor[] {
  return palette.map((color, i) => {
    if (lockedIndices.has(i)) return color;

    const parsed = parse(color.value);
    if (!parsed) return color;
    const hsl = toHsl(parsed);
    if (!hsl) return color;

    let h = hsl.h ?? 0;
    let s = hsl.s ?? 0.5;
    let l = hsl.l ?? 0.5;

    l = clamp(l + refinement.brightness / 100, 0.05, 0.95);
    s = clamp(s + refinement.saturation / 100, 0, 1);
    h = (h + refinement.hueShift) % 360;
    if (h < 0) h += 360;
    h = h + refinement.temperature * 0.3;
    if (h < 0) h += 360;
    h = h % 360;

    return {
      ...color,
      value: hslToRgba(h, s, l),
    };
  });
}

/**
 * Fill palette up to 10 colors for JSON export.
 * Extra slots get neutral dark colors derived from the seed hue.
 */
export function fillPaletteTo10(palette: PaletteColor[], seedHex: string): PaletteColor[] {
  if (palette.length >= 10) return palette.slice(0, 10);

  const parsed = parse(seedHex);
  const hsl = parsed ? toHsl(parsed) : null;
  const h = hsl?.h ?? 0;

  const filled = [...palette];
  while (filled.length < 10) {
    filled.push({
      id: generateId(),
      role: `Color ${filled.length + 1}`,
      value: hslToRgba(h, 0.05, 0.20),
    });
  }
  return filled;
}

export function getDefaultPaletteColors(): PaletteColor[] {
  return [
    { id: generateId(), role: 'Color 1', value: 'rgba(40, 238, 150, 1)' },
    { id: generateId(), role: 'Color 2', value: 'rgba(255, 217, 0, 1)' },
    { id: generateId(), role: 'Color 3', value: 'rgba(255, 70, 69, 1)' },
    { id: generateId(), role: 'Color 4', value: 'rgba(181, 181, 181, 1)' },
    { id: generateId(), role: 'Color 5', value: 'rgba(60, 146, 255, 1)' },
    { id: generateId(), role: 'Color 6', value: 'rgba(100, 229, 114, 1)' },
    { id: generateId(), role: 'Color 7', value: 'rgba(255, 150, 85, 1)' },
    { id: generateId(), role: 'Color 8', value: 'rgba(255, 242, 99, 1)' },
    { id: generateId(), role: 'Color 9', value: 'rgba(106, 249, 196, 1)' },
    { id: generateId(), role: 'Color 10', value: 'rgba(145, 232, 225, 1)' },
  ];
}

export function rgbaToHex(rgba: string): string {
  const parsed = parse(rgba);
  if (!parsed) return '#000000';
  const rgb = toRgb(parsed);
  if (!rgb) return '#000000';
  const r = Math.round((rgb.r ?? 0) * 255);
  const g = Math.round((rgb.g ?? 0) * 255);
  const b = Math.round((rgb.b ?? 0) * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function hexToRgba(hex: string, alpha = 1): string {
  const parsed = parse(hex);
  if (!parsed) return `rgba(0,0,0,${alpha})`;
  const rgb = toRgb(parsed);
  if (!rgb) return `rgba(0,0,0,${alpha})`;
  const r = Math.round((rgb.r ?? 0) * 255);
  const g = Math.round((rgb.g ?? 0) * 255);
  const b = Math.round((rgb.b ?? 0) * 255);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
