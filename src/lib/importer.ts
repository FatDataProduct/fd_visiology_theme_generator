import type { VisiologyTheme, PaletteColor } from '../types/visiology';

export interface ImportResult {
  success: boolean;
  theme?: VisiologyTheme;
  palette?: PaletteColor[];
  name?: string;
  error?: string;
}

const PALETTE_ROLES = [
  'Accent 1', 'Accent 2', 'Warning', 'Neutral',
  'Accent 3', 'Accent 4', 'Accent 5', 'Accent 6',
  'Accent 7', 'Accent 8',
];

export function importThemeFromJson(jsonString: string): ImportResult {
  try {
    const data = JSON.parse(jsonString);

    if (!data.WidgetStyles?.$values || !Array.isArray(data.WidgetStyles.$values)) {
      return {
        success: false,
        error: 'Invalid theme: WidgetStyles.$values not found or not an array',
      };
    }

    if (!data.$type) {
      return {
        success: false,
        error: 'Invalid theme: missing root $type',
      };
    }

    const firstWidget = data.WidgetStyles.$values[0];
    const paletteValues = firstWidget?.ColorPalette?.$values;

    let palette: PaletteColor[] | undefined;
    if (paletteValues && Array.isArray(paletteValues) && paletteValues.length >= 10) {
      palette = paletteValues.slice(0, 10).map((c: { Id: string; Value: string }, i: number) => ({
        id: c.Id,
        role: PALETTE_ROLES[i] || `Color ${i + 1}`,
        value: c.Value,
      }));
    }

    return {
      success: true,
      theme: data as VisiologyTheme,
      palette,
      name: data.Name || 'Imported Theme',
    };
  } catch (e) {
    return {
      success: false,
      error: `JSON parse error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
