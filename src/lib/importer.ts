import type { VisiologyTheme, PaletteColor } from '../types/visiology';
import { getDefaultTheme, DEFAULT_PALETTE_COLORS } from '../assets/defaultTheme';

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

/* ================================================================
   Helpers
   ================================================================ */

function isThemeJson(data: unknown): data is VisiologyTheme {
  const d = data as Record<string, unknown>;
  return Boolean(d?.$type && (d?.WidgetStyles as { $values?: unknown[] })?.$values);
}

function normalizeColor(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const input = value.trim();
  if (!input) return null;
  if (/^rgba?\(/i.test(input)) {
    const rgba = input.replace(/^rgb\(([^)]+)\)$/i, 'rgba($1,1)');
    return rgba;
  }
  if (/^#[0-9a-fA-F]{3,8}$/.test(input)) return input;
  return null;
}

function isVisibleColor(c: string): boolean {
  return !/rgba\([^)]*,\s*0(\.0+)?\s*\)$/i.test(c);
}

function safeStr(val: unknown): string | undefined {
  return typeof val === 'string' && val.trim() ? val.trim() : undefined;
}

function safeNum(val: unknown): number | undefined {
  return typeof val === 'number' ? val : undefined;
}

function safeBool(val: unknown): boolean | undefined {
  return typeof val === 'boolean' ? val : undefined;
}

/* Deep-get for camelCase paths in dashboard widget */
function dig(obj: unknown, ...keys: string[]): unknown {
  let cur = obj;
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

/* Collect all unique visible colours from a JSON subtree */
function collectColorsDeep(node: unknown, acc: Set<string>) {
  if (!node) return;
  if (typeof node === 'string') {
    const c = normalizeColor(node);
    if (c && isVisibleColor(c)) acc.add(c);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item) => collectColorsDeep(item, acc));
    return;
  }
  if (typeof node === 'object') {
    Object.values(node as Record<string, unknown>).forEach((v) => collectColorsDeep(v, acc));
  }
}

function buildPaletteFromColors(rawColors: string[]): PaletteColor[] {
  const colors = [...rawColors];
  while (colors.length < 10) {
    colors.push(DEFAULT_PALETTE_COLORS[colors.length]?.value ?? 'rgba(120,120,120,1)');
  }
  return colors.slice(0, 10).map((value, i) => ({
    id: `import-${i + 1}`,
    role: PALETTE_ROLES[i] || `Color ${i + 1}`,
    value,
  }));
}

/* ================================================================
   Dashboard → Theme converter
   ================================================================ */

interface DashWidget {
  [key: string]: unknown;
}

/**
 * Reset all decorative properties to neutral ("invisible") defaults so that
 * only values explicitly present in the dashboard source survive into the
 * exported theme.  This prevents the reference template's own styling from
 * leaking through (e.g. colored shadows, enabled frames, etc.).
 */
function neutralizeVisualDefaults(w: Record<string, unknown>) {
  // BoxShadow → zero / transparent
  const bs = w.BoxShadow as Record<string, unknown> | undefined;
  if (bs) {
    bs.X = 0;
    bs.Y = 0;
    bs.Blur = 0;
    bs.Spread = 0;
    bs.Color = 'rgba(0,0,0,0)';
  }

  // Frame → disabled, transparent border
  const frame = w.Frame as Record<string, unknown> | undefined;
  if (frame) {
    frame.Enabled = false;
    const style = frame.Style as Record<string, unknown> | undefined;
    if (style) {
      style.Color = 'rgba(128,128,128,0.5)';
      style.Radius = 0;
    }
  }

  // Title background → disabled, transparent
  const title = w.Title as Record<string, unknown> | undefined;
  if (title) {
    const titleBg = title.Background as Record<string, unknown> | undefined;
    if (titleBg) {
      titleBg.Enabled = false;
      const titleBgColor = titleBg.Color as Record<string, unknown> | undefined;
      if (titleBgColor) titleBgColor.Color = 'rgba(255,255,255,0)';
    }
  }

  // Widget background → disabled, transparent
  const bg = w.Background as Record<string, unknown> | undefined;
  if (bg) {
    bg.Enabled = false;
    const bgColor = bg.Color as Record<string, unknown> | undefined;
    if (bgColor) bgColor.Color = 'rgba(255,255,255,0)';
  }
}

/**
 * Maps a single dashboard widget (camelCase) to PascalCase theme structure,
 * overlaying onto a clone of the reference widget template.
 * First neutralizes all decorative defaults so only explicit dashboard values survive.
 */
function mapWidgetToThemeStyle(
  dw: DashWidget,
  templateWidget: Record<string, unknown>,
): Record<string, unknown> {
  const w = JSON.parse(JSON.stringify(templateWidget)) as Record<string, unknown>;

  // Wipe template styling first — only dashboard-provided values will overwrite
  neutralizeVisualDefaults(w);

  // --- Background ---
  const bgColor = normalizeColor(dig(dw, 'background', 'color', 'color'));
  if (bgColor) {
    const bgObj = w.Background as Record<string, unknown>;
    const colorObj = bgObj?.Color as Record<string, unknown>;
    if (colorObj) colorObj.Color = bgColor;
    if (bgObj) bgObj.Enabled = true;
  }
  const bgEnabled = safeBool(dig(dw, 'background', 'enabled'));
  if (bgEnabled !== undefined) {
    const bgObj = w.Background as Record<string, unknown>;
    if (bgObj) bgObj.Enabled = bgEnabled;
  }

  // --- Title ---
  const titleTs = dw.title as Record<string, unknown> | undefined;
  if (titleTs) {
    const wTitle = w.Title as Record<string, unknown>;
    if (wTitle) {
      const titleEnabled = safeBool(titleTs.enabled);
      if (titleEnabled !== undefined) wTitle.Enabled = titleEnabled;

      const ts = titleTs.textStyle as Record<string, unknown> | undefined;
      const wTs = wTitle.TextStyle as Record<string, unknown>;
      if (ts && wTs) {
        const tc = normalizeColor(ts.color);
        if (tc) wTs.Color = tc;
        const ff = safeStr(ts.fontFamily);
        if (ff) wTs.FontFamily = ff;
        const fs = safeNum(ts.fontSize);
        if (fs !== undefined) wTs.FontSize = fs;
        const bold = safeBool(ts.isBold);
        if (bold !== undefined) wTs.IsBold = bold;
        const italic = safeBool(ts.isItalic);
        if (italic !== undefined) wTs.IsItalic = italic;
        const align = safeNum(ts.align);
        if (align !== undefined) wTs.Align = align;
        const lineH = safeNum(ts.lineHeight);
        if (lineH !== undefined) wTs.LineHeight = lineH;
      }
      const titleBg = normalizeColor(dig(titleTs, 'background', 'color', 'color'));
      if (titleBg) {
        const wTitleBg = wTitle.Background as Record<string, unknown>;
        if (wTitleBg) wTitleBg.Enabled = true;
        const wTitleBgColor = wTitleBg?.Color as Record<string, unknown>;
        if (wTitleBgColor) wTitleBgColor.Color = titleBg;
      }
      const titleBgEnabled = safeBool(dig(titleTs, 'background', 'enabled'));
      if (titleBgEnabled !== undefined) {
        const wTitleBg = wTitle.Background as Record<string, unknown>;
        if (wTitleBg) wTitleBg.Enabled = titleBgEnabled;
      }
      const titleHeight = safeNum(dig(titleTs, 'size', 'height'));
      if (titleHeight !== undefined) {
        const wTitleSize = wTitle.Size as Record<string, unknown>;
        if (wTitleSize) wTitleSize.Height = titleHeight;
      }
    }
  }

  // --- Frame ---
  const frameObj = dw.frame as Record<string, unknown> | undefined;
  if (frameObj) {
    const wFrame = w.Frame as Record<string, unknown>;
    if (wFrame) {
      const fEnabled = safeBool(frameObj.enabled);
      if (fEnabled !== undefined) wFrame.Enabled = fEnabled;
      const fStyle = frameObj.style as Record<string, unknown> | undefined;
      const wFStyle = wFrame.Style as Record<string, unknown>;
      if (fStyle && wFStyle) {
        const radius = safeNum(fStyle.radius);
        if (radius !== undefined) wFStyle.Radius = radius;
        const fColor = normalizeColor(fStyle.color);
        if (fColor) wFStyle.Color = fColor;
      }
    }
  }

  // --- BoxShadow ---
  const bsSrc = dw.boxShadow as Record<string, unknown> | undefined;
  if (bsSrc) {
    const wBs = w.BoxShadow as Record<string, unknown>;
    if (wBs) {
      const bsColor = normalizeColor(bsSrc.color);
      if (bsColor) wBs.Color = bsColor;
      const bsX = safeNum(bsSrc.x); if (bsX !== undefined) wBs.X = bsX;
      const bsY = safeNum(bsSrc.y); if (bsY !== undefined) wBs.Y = bsY;
      const bsBlur = safeNum(bsSrc.blur); if (bsBlur !== undefined) wBs.Blur = bsBlur;
      const bsSpread = safeNum(bsSrc.spread); if (bsSpread !== undefined) wBs.Spread = bsSpread;
    }
  }

  return w;
}

/**
 * Merge dashboard widget data into a specific theme widget type (e.g. Chart, Indicator).
 * This handles type-specific properties beyond the common base.
 */
function applyTypeSpecificProps(
  dw: DashWidget,
  themeWidget: Record<string, unknown>,
  widgetType: string,
) {
  if (widgetType === 'Indicator') {
    // ValueSettings
    const vsTs = dig(dw, 'valueSettings', 'textStyle') as Record<string, unknown> | undefined;
    if (vsTs) {
      const twVs = themeWidget.ValueSettings as Record<string, unknown> | undefined;
      if (twVs) {
        const twVsTs = twVs.TextStyle as Record<string, unknown>;
        if (twVsTs) {
          const c = normalizeColor(vsTs.color); if (c) twVsTs.Color = c;
          const ff = safeStr(vsTs.fontFamily); if (ff) twVsTs.FontFamily = ff;
          const fs = safeNum(vsTs.fontSize); if (fs !== undefined) twVsTs.FontSize = fs;
          const bold = safeBool(vsTs.isBold); if (bold !== undefined) twVsTs.IsBold = bold;
        }
      }
    }
    // TargetSettings
    const targetColor = normalizeColor(dig(dw, 'targetSettings', 'targetValueDetails', 'textStyle', 'color'));
    if (targetColor) {
      const twTarget = dig(themeWidget, 'TargetSettings', 'TargetValueDetails', 'TextStyle') as Record<string, unknown> | undefined;
      if (twTarget) twTarget.Color = targetColor;
    }
  }

  if (widgetType === 'Chart' || widgetType === 'BarChart' || widgetType === 'ColumnChart') {
    // xAxis labels
    const xLabelColor = normalizeColor(dig(dw, 'xAxis', 'labels', 'textStyle', 'color'));
    if (xLabelColor) {
      const twXLabels = dig(themeWidget, 'XAxis', 'Labels', 'TextStyle') as Record<string, unknown> | undefined;
      if (twXLabels) twXLabels.Color = xLabelColor;
    }
    // yAxis labels
    const yLabelColor = normalizeColor(dig(dw, 'yAxis', 'labels', 'textStyle', 'color'));
    if (yLabelColor) {
      const twYLabels = dig(themeWidget, 'YAxis', 'Labels', 'TextStyle') as Record<string, unknown> | undefined;
      if (twYLabels) twYLabels.Color = yLabelColor;
    }
    // Legend
    const legendColor = normalizeColor(dig(dw, 'legend', 'textStyle', 'color'));
    if (legendColor) {
      const twLegend = dig(themeWidget, 'Legend', 'TextStyle') as Record<string, unknown> | undefined;
      if (twLegend) twLegend.Color = legendColor;
    }
  }

  if (widgetType === 'DataGrid' || widgetType === 'OlapTable') {
    // Header style
    const headerColor = normalizeColor(dig(dw, 'headerStyle', 'textStyle', 'color'));
    if (headerColor) {
      const twHeader = dig(themeWidget, 'HeaderStyle', 'TextStyle') as Record<string, unknown> | undefined;
      if (twHeader) twHeader.Color = headerColor;
    }
    const headerBg = normalizeColor(dig(dw, 'headerStyle', 'background', 'color', 'color'));
    if (headerBg) {
      const twHeaderBg = dig(themeWidget, 'HeaderStyle', 'Background', 'Color') as Record<string, unknown> | undefined;
      if (twHeaderBg) twHeaderBg.Color = headerBg;
    }
  }
}

/**
 * Maps dashboard widget Type (camelCase) to theme widget Type (PascalCase).
 * Dashboard and theme use the same type names for most widgets.
 */
function matchThemeWidgetType(dashType: string): string {
  const map: Record<string, string> = {
    indicator: 'Indicator',
    chart: 'Chart',
    barchart: 'BarChart',
    columnchart: 'ColumnChart',
    piechart: 'PieChart',
    datagrid: 'DataGrid',
    olaptable: 'OlapTable',
    filter: 'Filter',
    datefilter: 'DateFilter',
    gauge: 'Gauge',
    treemap: 'Treemap',
    textwidget: 'TextWidget',
    imagewidget: 'ImageWidget',
    userwidget: 'UserWidget',
    regularreportbutton: 'RegularReportButton',
    highchartsbarchart: 'HighchartsBarChart',
    highchartschart: 'HighchartsChart',
    highchartscolumnchart: 'HighchartsColumnChart',
    highchartspiechart: 'HighchartsPieChart',
    highchartstreemap: 'HighchartsTreemap',
    highchartsgauge: 'HighchartsGauge',
  };
  return map[dashType.toLowerCase()] ?? dashType;
}

function importThemeFromDashboardJson(data: Record<string, unknown>): ImportResult {
  const dashboard = data.dashboard as Record<string, unknown> | undefined;
  if (!dashboard) {
    return { success: false, error: 'Invalid dashboard JSON: missing "dashboard" root object' };
  }

  const sheets = (dashboard.sheets as Array<Record<string, unknown>> | undefined) ?? [];
  const dashWidgets = sheets.flatMap(
    (sheet) => (sheet.widgets as DashWidget[] | undefined) ?? [],
  );

  const theme = getDefaultTheme();
  const name = safeStr(dashboard.name) || 'Imported Dashboard Theme';
  theme.Name = name;

  // Count how many dashboard widgets per type
  const widgetsByType = new Map<string, DashWidget[]>();
  for (const dw of dashWidgets) {
    const rawType = safeStr(dw.Type) || safeStr(dw.type) || 'unknown';
    const themeType = matchThemeWidgetType(rawType);
    if (!widgetsByType.has(themeType)) widgetsByType.set(themeType, []);
    widgetsByType.get(themeType)!.push(dw);
  }

  // For each theme widget type, find matching dashboard widget and apply properties
  theme.WidgetStyles.$values.forEach((tw) => {
    const themeType = tw.Type;
    const matching = widgetsByType.get(themeType);
    const representative = matching?.[0];

    if (representative) {
      const mapped = mapWidgetToThemeStyle(
        representative,
        tw as unknown as Record<string, unknown>,
      );
      // Copy mapped base props back to tw
      Object.assign(tw, mapped);
      applyTypeSpecificProps(representative, tw as unknown as Record<string, unknown>, themeType);
    }

    // WidgetBase gets common properties from any first widget
    if (themeType === 'WidgetBase' && !representative && dashWidgets.length > 0) {
      const any = dashWidgets[0];
      const mapped = mapWidgetToThemeStyle(any, tw as unknown as Record<string, unknown>);
      Object.assign(tw, mapped);
    }

    // Ensure BoxShadow.Color is never null (validator requires it)
    const bs = (tw as unknown as Record<string, unknown>).BoxShadow as Record<string, unknown> | undefined;
    if (bs && !bs.Color) {
      bs.Color = 'rgba(0,0,0,0)';
    }
  });

  // Build palette from all colors found in the dashboard
  const colorSet = new Set<string>();
  // Prioritize explicit series/bar colors and backgrounds
  for (const dw of dashWidgets) {
    const bgC = normalizeColor(dig(dw, 'background', 'color', 'color'));
    if (bgC && isVisibleColor(bgC)) colorSet.add(bgC);
    const bsC = normalizeColor(dig(dw, 'boxShadow', 'color'));
    if (bsC && isVisibleColor(bsC)) colorSet.add(bsC);
  }
  // Then sweep all remaining colours
  collectColorsDeep(dashboard, colorSet);
  const palette = buildPaletteFromColors([...colorSet]);

  return { success: true, theme, palette, name };
}

/* ================================================================
   Public: import from any JSON string
   ================================================================ */

export function importThemeFromJson(jsonString: string): ImportResult {
  try {
    const data = JSON.parse(jsonString) as unknown;

    // Direct theme JSON (PascalCase with $type)
    if (isThemeJson(data)) {
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

      // Also ensure BoxShadow.Color is present for all widgets
      data.WidgetStyles.$values.forEach((w) => {
        const bs = (w as unknown as Record<string, unknown>).BoxShadow as Record<string, unknown> | undefined;
        if (bs && !bs.Color) bs.Color = 'rgba(0,0,0,0)';
      });

      return {
        success: true,
        theme: data,
        palette,
        name: data.Name || 'Imported Theme',
      };
    }

    // Dashboard export JSON
    const asRecord = data as Record<string, unknown>;
    if (asRecord?.dashboard && typeof asRecord.dashboard === 'object') {
      return importThemeFromDashboardJson(asRecord);
    }

    return {
      success: false,
      error: 'Неподдерживаемый формат JSON. Ожидается Visiology Theme JSON или Dashboard export JSON (с ключом "dashboard").',
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
