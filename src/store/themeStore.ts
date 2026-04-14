import { create } from 'zustand';
import type { VisiologyTheme, PaletteColor, GlobalTokens } from '../types/visiology';
import { getDefaultTheme, DEFAULT_PALETTE_COLORS } from '../assets/defaultTheme';
import { applyPaletteToTheme } from '../lib/exporter';
import { reversePalette } from '../lib/darkReverse';
import {
  generatePaletteFromSeed,
  applyRefinement,
  fillPaletteTo10,
  type HarmonyMethod,
  type RefinementValues,
  DEFAULT_REFINEMENT,
} from '../lib/paletteGen';

export type ThemeMode = 'light' | 'dark';
export type PreviewBackground = 'white' | 'gray' | 'dark';
export type DetailTab = 'shell' | 'chart' | 'table' | 'indicator' | 'filter';
export type PreviewSheet = 'echarts' | 'visapi';

const DEFAULT_VISAPI_URL = (import.meta.env.VITE_VISAPI_IFRAME_URL as string | undefined)?.trim() ?? '';

interface ThemeState {
  themeName: string;
  theme: VisiologyTheme;
  palette: PaletteColor[];
  seedColor: string;
  seedIndex: number;
  paletteSize: number;
  harmonyMethod: HarmonyMethod;
  refinement: RefinementValues;
  lockedIndices: Set<number>;
  mode: ThemeMode;
  globalTokens: GlobalTokens;
  previewScale: number;
  previewBackground: PreviewBackground;
  showGrid: boolean;
  activeDetailTab: DetailTab;
  activeSheet: PreviewSheet;
  visApiUrl: string;
  visApiTargetOrigin: string;
  isDirty: boolean;

  setThemeName: (name: string) => void;
  setTheme: (theme: VisiologyTheme) => void;
  setPalette: (palette: PaletteColor[]) => void;
  updatePaletteColor: (index: number, value: string) => void;
  setSeedColor: (color: string) => void;
  setSeedIndex: (index: number) => void;
  setPaletteSize: (size: number) => void;
  setHarmonyMethod: (method: HarmonyMethod) => void;
  setRefinement: (refinement: Partial<RefinementValues>) => void;
  resetRefinement: () => void;
  toggleLock: (index: number) => void;
  generatePalette: () => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setGlobalTokens: (tokens: Partial<GlobalTokens>) => void;
  setPreviewScale: (scale: number) => void;
  setPreviewBackground: (bg: PreviewBackground) => void;
  setShowGrid: (show: boolean) => void;
  setActiveDetailTab: (tab: DetailTab) => void;
  setActiveSheet: (sheet: PreviewSheet) => void;
  setVisApiUrl: (url: string) => void;

  updateWidgetBase: (path: string, value: unknown) => void;
  getExportTheme: () => VisiologyTheme;

  importTheme: (theme: VisiologyTheme, palette: PaletteColor[], name: string) => void;
  resetToDefault: () => void;
}

const DEFAULT_GLOBAL_TOKENS: GlobalTokens = {
  titleFontFamily: 'Arial',
  dataFontFamily: 'Open Sans',
  titleFontSize: 21,
  lineHeight: 1.5,
  borderRadius: 3,
};

function applyGlobalTokensToTheme(theme: VisiologyTheme, tokens: GlobalTokens): VisiologyTheme {
  const result = JSON.parse(JSON.stringify(theme)) as VisiologyTheme;
  result.WidgetStyles.$values.forEach((widget) => {
    if (widget.Title?.TextStyle) {
      widget.Title.TextStyle.FontFamily = tokens.titleFontFamily;
      widget.Title.TextStyle.FontSize = tokens.titleFontSize;
      widget.Title.TextStyle.LineHeight = tokens.lineHeight;
    }
    if (widget.Frame?.Style) {
      widget.Frame.Style.Radius = tokens.borderRadius;
    }
  });
  return result;
}

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] === undefined || current[key] === null || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

function applyToAllWidgets(theme: VisiologyTheme, path: string, value: unknown): VisiologyTheme {
  const result = JSON.parse(JSON.stringify(theme)) as VisiologyTheme;
  result.WidgetStyles.$values.forEach((widget) => {
    setNestedValue(widget as unknown as Record<string, unknown>, path, value);
  });
  return result;
}

function syncPaletteToTheme(theme: VisiologyTheme, palette: PaletteColor[], seedColor: string): VisiologyTheme {
  const filled = fillPaletteTo10(palette, seedColor);
  return applyPaletteToTheme(theme, filled);
}

function getOriginFromUrl(url: string): string {
  if (!url) return '';
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeName: 'Энергия Visiology',
  theme: getDefaultTheme(),
  palette: DEFAULT_PALETTE_COLORS.map((c) => ({ ...c })),
  seedColor: '#28EE96',
  seedIndex: 0,
  paletteSize: 10,
  harmonyMethod: 'triadic' as HarmonyMethod,
  refinement: { ...DEFAULT_REFINEMENT },
  lockedIndices: new Set<number>(),
  mode: 'light',
  globalTokens: { ...DEFAULT_GLOBAL_TOKENS },
  previewScale: 100,
  previewBackground: 'white',
  showGrid: false,
  activeDetailTab: 'shell',
  activeSheet: 'echarts',
  visApiUrl: DEFAULT_VISAPI_URL,
  visApiTargetOrigin: getOriginFromUrl(DEFAULT_VISAPI_URL),
  isDirty: false,

  setThemeName: (name) => set({ themeName: name, isDirty: true }),
  setTheme: (theme) => set({ theme, isDirty: true }),

  setPalette: (palette) => {
    const { theme, seedColor } = get();
    const updated = syncPaletteToTheme(theme, palette, seedColor);
    set({ palette, theme: updated, isDirty: true });
  },

  updatePaletteColor: (index, value) => {
    const { palette } = get();
    const newPalette = palette.map((c, i) => i === index ? { ...c, value } : c);
    get().setPalette(newPalette);
  },

  setSeedColor: (color) => {
    set({ seedColor: color });
    get().generatePalette();
  },

  setSeedIndex: (index) => {
    const { palette } = get();
    if (index >= 0 && index < palette.length) {
      set({ seedIndex: index });
    }
  },

  setPaletteSize: (size) => {
    const clamped = Math.max(3, Math.min(10, size));
    set({ paletteSize: clamped });
    get().generatePalette();
  },

  setHarmonyMethod: (method) => {
    set({ harmonyMethod: method });
    get().generatePalette();
  },

  setRefinement: (partial) => {
    const current = get().refinement;
    const merged = { ...current, ...partial };
    const { palette, lockedIndices } = get();
    const refined = applyRefinement(palette, merged, lockedIndices);
    const { theme, seedColor } = get();
    const updated = syncPaletteToTheme(theme, refined, seedColor);
    set({ refinement: merged, theme: updated, isDirty: true });
  },

  resetRefinement: () => {
    set({ refinement: { ...DEFAULT_REFINEMENT } });
  },

  toggleLock: (index) => {
    const { lockedIndices } = get();
    const newSet = new Set(lockedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    set({ lockedIndices: newSet });
  },

  generatePalette: () => {
    const { seedColor, harmonyMethod, paletteSize, refinement, lockedIndices, palette: oldPalette, theme } = get();

    let newPalette = generatePaletteFromSeed(seedColor, harmonyMethod, paletteSize);

    // Preserve locked colors
    newPalette = newPalette.map((c, i) => {
      if (lockedIndices.has(i) && i < oldPalette.length) {
        return oldPalette[i];
      }
      return c;
    });

    // Apply refinement to unlocked
    newPalette = applyRefinement(newPalette, refinement, lockedIndices);

    const updated = syncPaletteToTheme(theme, newPalette, seedColor);
    set({ palette: newPalette, theme: updated, isDirty: true });
  },

  setMode: (mode) => set({ mode }),

  toggleMode: () => {
    const { mode, palette, theme, seedColor } = get();
    const newMode = mode === 'light' ? 'dark' : 'light';
    const newPalette = reversePalette(palette);

    let newTheme = JSON.parse(JSON.stringify(theme)) as VisiologyTheme;
    newTheme = syncPaletteToTheme(newTheme, newPalette, seedColor);

    newTheme.WidgetStyles.$values.forEach((widget) => {
      if (newMode === 'dark') {
        if (widget.Background?.Color) widget.Background.Color.Color = 'rgba(30,30,46,0.95)';
        if (widget.Title?.TextStyle) widget.Title.TextStyle.Color = 'rgba(255,255,255,1)';
      } else {
        if (widget.Background?.Color) widget.Background.Color.Color = 'rgba(255,255,255,0)';
        if (widget.Title?.TextStyle) widget.Title.TextStyle.Color = 'rgba(0,0,0,1)';
      }
    });

    set({ mode: newMode, palette: newPalette, theme: newTheme, isDirty: true });
  },

  setGlobalTokens: (tokens) => {
    const current = get().globalTokens;
    const merged = { ...current, ...tokens };
    const newTheme = applyGlobalTokensToTheme(get().theme, merged);
    set({ globalTokens: merged, theme: newTheme, isDirty: true });
  },

  setPreviewScale: (scale) => set({ previewScale: scale }),
  setPreviewBackground: (bg) => set({ previewBackground: bg }),
  setShowGrid: (show) => set({ showGrid: show }),
  setActiveDetailTab: (tab) => set({ activeDetailTab: tab }),
  setActiveSheet: (sheet) => set({ activeSheet: sheet }),
  setVisApiUrl: (url) => {
    const normalized = url.trim();
    set({
      visApiUrl: normalized,
      visApiTargetOrigin: getOriginFromUrl(normalized),
      // Do NOT auto-switch sheet — user switches manually via sheet buttons
    });
  },

  updateWidgetBase: (path, value) => {
    const { theme } = get();
    const newTheme = applyToAllWidgets(theme, path, value);
    set({ theme: newTheme, isDirty: true });
  },

  getExportTheme: () => {
    const { theme, palette, themeName, globalTokens, seedColor } = get();
    let result = JSON.parse(JSON.stringify(theme)) as VisiologyTheme;
    result.Name = themeName;
    const filled = fillPaletteTo10(palette, seedColor);
    result = applyPaletteToTheme(result, filled);
    result = applyGlobalTokensToTheme(result, globalTokens);
    result.WidgetStyles.$values.forEach((w, i) => { w.ZIndex = i; });
    return result;
  },

  importTheme: (theme, palette, name) => {
    // Extract globalTokens from the imported theme so UI controls stay in sync
    const base = theme.WidgetStyles?.$values?.[0];
    const extractedTokens: GlobalTokens = {
      titleFontFamily: base?.Title?.TextStyle?.FontFamily ?? DEFAULT_GLOBAL_TOKENS.titleFontFamily,
      dataFontFamily: DEFAULT_GLOBAL_TOKENS.dataFontFamily,
      titleFontSize: base?.Title?.TextStyle?.FontSize ?? DEFAULT_GLOBAL_TOKENS.titleFontSize,
      lineHeight: base?.Title?.TextStyle?.LineHeight ?? DEFAULT_GLOBAL_TOKENS.lineHeight,
      borderRadius: base?.Frame?.Style?.Radius ?? DEFAULT_GLOBAL_TOKENS.borderRadius,
    };
    // Auto-detect dark mode from background colour
    const bgColor = base?.Background?.Color?.Color ?? '';
    let detectedMode: ThemeMode = 'light';
    const rgbMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      const luminance = (0.299 * +rgbMatch[1] + 0.587 * +rgbMatch[2] + 0.114 * +rgbMatch[3]);
      if (luminance < 128) detectedMode = 'dark';
    }
    set({
      theme,
      palette,
      themeName: name,
      globalTokens: extractedTokens,
      isDirty: false,
      mode: detectedMode,
      refinement: { ...DEFAULT_REFINEMENT },
      lockedIndices: new Set<number>(),
    });
  },

  resetToDefault: () => {
    set({
      theme: getDefaultTheme(),
      palette: DEFAULT_PALETTE_COLORS.map((c) => ({ ...c })),
      themeName: 'Энергия Visiology',
      seedColor: '#28EE96',
      seedIndex: 0,
      paletteSize: 10,
      harmonyMethod: 'triadic',
      refinement: { ...DEFAULT_REFINEMENT },
      lockedIndices: new Set<number>(),
      mode: 'light',
      globalTokens: { ...DEFAULT_GLOBAL_TOKENS },
      visApiUrl: DEFAULT_VISAPI_URL,
      visApiTargetOrigin: getOriginFromUrl(DEFAULT_VISAPI_URL),
      isDirty: false,
    });
  },
}));
