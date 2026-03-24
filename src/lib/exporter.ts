import type { VisiologyTheme, PaletteColor } from '../types/visiology';

const NS = 'Visiology.DashboardService.Modules.Dashboards.Domain.Models';
const CORE = 'System.Private.CoreLib';

function generateId(): string {
  const hex = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 32; i++) {
    id += hex[Math.floor(Math.random() * 16)];
  }
  return id;
}

function buildWidgetColorList(palette: PaletteColor[]) {
  return {
    $type: `System.Collections.Generic.List\`1[[${NS}.Widget.WidgetColor, ${NS.split('.Models')[0]}]], ${CORE}`,
    $values: palette.map((c) => ({
      $type: `${NS}.Widget.WidgetColor, ${NS.split('.Models')[0]}`,
      Id: c.id.length === 32 ? c.id : generateId(),
      Value: c.value,
    })),
  };
}

/**
 * Apply palette colors to all widget styles and recalculate ZIndex
 */
export function applyPaletteToTheme(
  theme: VisiologyTheme,
  palette: PaletteColor[]
): VisiologyTheme {
  const result = JSON.parse(JSON.stringify(theme)) as VisiologyTheme;
  const widgets = result.WidgetStyles.$values;

  widgets.forEach((widget, index) => {
    widget.ColorPalette = buildWidgetColorList(palette);
    widget.ZIndex = index;
  });

  return result;
}

/**
 * Validate theme before export per requirements section 7.3
 */
export function validateTheme(theme: VisiologyTheme): string[] {
  const errors: string[] = [];

  if (!theme.$type) errors.push('Missing root $type namespace');
  if (!theme.Name) errors.push('Missing theme name');

  const widgets = theme.WidgetStyles?.$values;
  if (!widgets || !Array.isArray(widgets)) {
    errors.push('WidgetStyles.$values is missing or not an array');
    return errors;
  }

  widgets.forEach((widget, i) => {
    const prefix = `Widget[${i}] (${widget.Type})`;

    if (!widget.$type) {
      errors.push(`${prefix}: missing $type`);
    }

    const palette = widget.ColorPalette?.$values;
    if (!palette || palette.length !== 10) {
      errors.push(`${prefix}: ColorPalette must have exactly 10 items (has ${palette?.length ?? 0})`);
    }

    if (palette) {
      const ids = new Set<string>();
      palette.forEach((c, j) => {
        if (!c.Id || c.Id.length !== 32) {
          errors.push(`${prefix}: Color[${j}].Id must be 32 hex chars`);
        }
        if (ids.has(c.Id)) {
          errors.push(`${prefix}: duplicate color Id "${c.Id}"`);
        }
        ids.add(c.Id);
      });
    }

    if (widget.BoxShadow && !widget.BoxShadow.Color) {
      errors.push(`${prefix}: BoxShadow.Color is missing`);
    }
  });

  return errors;
}

export function exportThemeToJson(theme: VisiologyTheme): string {
  return JSON.stringify(theme, null, 2);
}

export function downloadTheme(theme: VisiologyTheme, fileName: string): void {
  const json = exportThemeToJson(theme);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
