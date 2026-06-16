import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as echarts from 'echarts';
import { useThemeStore } from '../../store/themeStore';

/* ================================================================
   DATA MODEL — deterministic sales dataset (отдел продаж)
   Stable across renders; rich enough that filters change results.
   ================================================================ */

const REGIONS = ['Москва', 'Санкт-Петербург', 'Поволжье', 'Урал', 'Сибирь', 'Юг'];
const MANAGERS = ['Иванов А.', 'Петрова Е.', 'Сидоров К.', 'Кузнецова М.', 'Смирнов Д.', 'Орлова Н.'];
const CHANNELS = ['Прямые продажи', 'Партнёры', 'Онлайн', 'Тендеры'];
const STATUSES = ['Закрыта', 'В работе', 'Отказ'] as const;
type Status = (typeof STATUSES)[number];

const CATEGORIES: { name: string; products: string[] }[] = [
  { name: 'Программное обеспечение', products: ['BI-платформа', 'ETL-модуль', 'API-доступ'] },
  { name: 'Оборудование', products: ['Серверы', 'СХД', 'Сетевое оборуд.'] },
  { name: 'Услуги', products: ['Внедрение', 'Обучение', 'Техподдержка'] },
];

const CLIENTS = [
  'ООО «Ромашка»', 'ПАО «Вектор»', 'АО «Горизонт»', 'ООО «Альфа-Трейд»',
  'ГК «Меридиан»', 'ООО «ТехноПром»', 'АО «СеверСталь-ИТ»', 'ООО «Биржа»',
  'ПАО «ЭнергоСбыт»', 'ООО «ФинГрупп»', 'АО «АгроХолдинг»', 'ООО «Логистик+»',
  'ГК «Стройинвест»', 'ООО «МедиаЛайн»',
];

const MON = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

const AMOUNT_RANGE: Record<string, [number, number]> = {
  'Программное обеспечение': [800_000, 3_500_000],
  'Оборудование': [1_200_000, 6_000_000],
  'Услуги': [300_000, 2_000_000],
};

interface Deal {
  id: number;
  ts: number;
  dateStr: string;   // dd.mm.yyyy
  mk: string;        // YYYY-MM
  client: string;
  manager: string;
  region: string;
  channel: string;
  category: string;
  product: string;
  amount: number;    // сумма сделки, ₽
  planned: number;   // плановый таргет по сделке, ₽
  status: Status;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ALL_DEALS: Deal[] = (() => {
  const rng = mulberry32(20240617);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
  const start = new Date(2024, 0, 1).getTime();
  const end = new Date(2025, 11, 31).getTime();
  const deals: Deal[] = [];

  for (let i = 0; i < 640; i++) {
    const ts = Math.floor(start + rng() * (end - start));
    const d = new Date(ts);
    const cat = pick(CATEGORIES);
    const product = pick(cat.products);
    const [lo, hi] = AMOUNT_RANGE[cat.name];
    const amount = Math.round((lo + rng() * (hi - lo)) / 1000) * 1000;
    const planned = Math.round((amount * (0.66 + rng() * 0.14)) / 1000) * 1000;
    const sr = rng();
    const status: Status = sr < 0.62 ? 'Закрыта' : sr < 0.83 ? 'В работе' : 'Отказ';
    const y = d.getFullYear();
    const m = d.getMonth();
    deals.push({
      id: i + 1,
      ts,
      dateStr: `${String(d.getDate()).padStart(2, '0')}.${String(m + 1).padStart(2, '0')}.${y}`,
      mk: `${y}-${String(m + 1).padStart(2, '0')}`,
      client: pick(CLIENTS),
      manager: pick(MANAGERS),
      region: pick(REGIONS),
      channel: pick(CHANNELS),
      category: cat.name,
      product,
      amount,
      planned,
      status,
    });
  }
  return deals.sort((a, b) => b.ts - a.ts);
})();

const DATA_MIN = '2024-01-01';
const DATA_MAX = '2025-12-31';

/* ================================================================
   FILTER + MODEL TYPES
   ================================================================ */

interface Filters {
  dateFrom: string;
  dateTo: string;
  region: string;
  manager: string;
  channel: string;
}

interface MonthBucket {
  mk: string;
  label: string;
}

function monthsBetween(fromT: number, toT: number): MonthBucket[] {
  const res: MonthBucket[] = [];
  const d = new Date(fromT);
  d.setDate(1);
  while (d.getTime() <= toT) {
    const y = d.getFullYear();
    const m = d.getMonth();
    res.push({ mk: `${y}-${String(m + 1).padStart(2, '0')}`, label: `${MON[m]} ${String(y).slice(2)}` });
    d.setMonth(m + 1);
  }
  return res;
}

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

function groupSum(deals: Deal[], key: keyof Deal): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const d of deals) {
    const k = String(d[key]);
    map.set(k, (map.get(k) ?? 0) + d.amount);
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

interface SalesModel {
  curDeals: Deal[];
  revenue: number;
  prevRevenue: number;
  dealCount: number;
  prevDealCount: number;
  planTotal: number;
  completion: number;
  months: MonthBucket[];
  revByMonth: number[];
  planByMonth: number[];
  byRegion: { name: string; value: number }[];
  byManager: { name: string; value: number }[];
  treemap: Record<string, unknown>[];
}

function buildModel(f: Filters, palette: string[]): SalesModel {
  const fromT = Date.parse(f.dateFrom);
  const toT = Date.parse(f.dateTo) + 86_400_000 - 1;
  const len = toT - fromT;
  const prevTo = fromT - 1;
  const prevFrom = prevTo - len;

  const match = (d: Deal) =>
    (f.region === 'Все' || d.region === f.region) &&
    (f.manager === 'Все' || d.manager === f.manager) &&
    (f.channel === 'Все' || d.channel === f.channel);

  const curDeals = ALL_DEALS.filter((d) => match(d) && d.ts >= fromT && d.ts <= toT);
  const prevDeals = ALL_DEALS.filter((d) => match(d) && d.ts >= prevFrom && d.ts <= prevTo);

  const closed = (arr: Deal[]) => arr.filter((d) => d.status === 'Закрыта');
  const curClosed = closed(curDeals);

  const revenue = sum(curClosed.map((d) => d.amount));
  const prevRevenue = sum(closed(prevDeals).map((d) => d.amount));
  const planTotal = sum(curDeals.map((d) => d.planned));
  const completion = planTotal ? Math.round((revenue / planTotal) * 100) : 0;

  const months = monthsBetween(fromT, toT);
  const revByMonth = months.map((mb) => sum(curClosed.filter((d) => d.mk === mb.mk).map((d) => d.amount)));
  const planByMonth = months.map((mb) => sum(curDeals.filter((d) => d.mk === mb.mk).map((d) => d.planned)));

  const byRegion = groupSum(curClosed, 'region');
  const byManager = groupSum(curClosed, 'manager');

  const treemap = CATEGORIES.map((cat, i) => {
    const color = palette[i % palette.length] || 'rgb(40,238,150)';
    const catDeals = curClosed.filter((d) => d.category === cat.name);
    const prodMap = new Map<string, number>();
    for (const d of catDeals) prodMap.set(d.product, (prodMap.get(d.product) ?? 0) + d.amount);
    const children = [...prodMap.entries()]
      .map(([name, value], j) => ({
        name,
        value,
        itemStyle: { color: withAlpha(color, 0.85 - j * 0.18) },
      }))
      .sort((a, b) => b.value - a.value);
    return {
      name: cat.name,
      value: sum(catDeals.map((d) => d.amount)),
      itemStyle: { color },
      children,
    };
  }).filter((c) => (c.value as number) > 0);

  return {
    curDeals,
    revenue,
    prevRevenue,
    dealCount: curDeals.length,
    prevDealCount: prevDeals.length,
    planTotal,
    completion,
    months,
    revByMonth,
    planByMonth,
    byRegion,
    byManager,
    treemap,
  };
}

/* ================================================================
   HELPERS
   ================================================================ */

function getVal(obj: unknown, path: string, def: unknown = ''): unknown {
  if (obj == null || typeof obj !== 'object') return def;
  const keys = path.split('.');
  let cur: unknown = obj;
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return def;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur ?? def;
}

function fmt(n: number): string {
  return n.toLocaleString('ru-RU');
}

function fmtMln(n: number): string {
  return (n / 1_000_000).toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function deltaPct(cur: number, prev: number): number | null {
  if (!prev) return null;
  return ((cur - prev) / prev) * 100;
}

function withAlpha(color: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  const m = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) return `rgba(${m[1]},${m[2]},${m[3]},${a})`;
  if (color.startsWith('#') && color.length >= 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  return color;
}

/* ================================================================
   ECHART WRAPPER — lightweight React wrapper around ECharts
   ================================================================ */

interface EChartProps {
  option: Record<string, unknown>;
  style?: React.CSSProperties;
  onClick?: (params: { name?: string; seriesType?: string; data?: unknown }) => void;
}

const EChart: React.FC<EChartProps> = ({ option, style, onClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    chartRef.current = echarts.init(containerRef.current, undefined, { renderer: 'svg' });

    const ro = new ResizeObserver(() => chartRef.current?.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  // Run on every render — guarantees ECharts always reflects latest state
  useEffect(() => {
    const c = chartRef.current;
    if (!c) return;
    c.setOption(option, { notMerge: true });
    c.off('click');
    if (onClick) c.on('click', onClick);
  });

  return <div ref={containerRef} style={style} />;
};

/* ================================================================
   THEME HOOK — extracts all display properties from Zustand store
   ================================================================ */

function useWidgetStyles() {
  const { theme, palette, mode, globalTokens, showGrid } = useThemeStore();
  const base = theme.WidgetStyles.$values[0];
  const paletteColors = palette.map((c) => c.value);

  const chartWidget = theme.WidgetStyles.$values.find(
    (w) => w.Type === 'BarChart' || w.Type === 'ColumnChart' || w.Type === 'Chart',
  );
  const dgWidget = theme.WidgetStyles.$values.find((w) => w.Type === 'DataGrid');
  const indicatorWidget = theme.WidgetStyles.$values.find((w) => w.Type === 'Indicator');

  return {
    paletteColors,
    bgColor: (() => {
      const c = base?.Background?.Color?.Color;
      const fallback = mode === 'dark' ? 'rgba(30,30,46,0.95)' : 'rgba(255,255,255,0.95)';
      if (!c) return fallback;
      if (/rgba\([^)]*,\s*0(\.0+)?\s*\)$/i.test(c)) return fallback;
      return c;
    })(),
    frameEnabled: base?.Frame?.Enabled ?? false,
    frameColor: base?.Frame?.Style?.Color ?? 'rgba(128,128,128,0.5)',
    frameRadius: base?.Frame?.Style?.Radius ?? globalTokens.borderRadius,
    shadowX: base?.BoxShadow?.X ?? 0,
    shadowY: base?.BoxShadow?.Y ?? 0,
    shadowBlur: base?.BoxShadow?.Blur ?? 0,
    shadowColor: base?.BoxShadow?.Color ?? 'rgba(0,0,0,0)',
    titleColor: base?.Title?.TextStyle?.Color ?? (mode === 'dark' ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'),
    titleFont: base?.Title?.TextStyle?.FontFamily ?? globalTokens.titleFontFamily,
    titleSize: base?.Title?.TextStyle?.FontSize ?? globalTokens.titleFontSize,
    titleBold: base?.Title?.TextStyle?.IsBold ?? true,
    axisLabelColor: chartWidget
      ? (getVal(chartWidget, 'YAxis.Labels.TextStyle.Color', 'rgb(108,117,125)') as string)
      : 'rgb(108,117,125)',
    gridEnabled: chartWidget
      ? (getVal(chartWidget, 'YAxis.Grid.Enabled', true) as boolean)
      : true,
    legendEnabled: chartWidget
      ? (getVal(chartWidget, 'Legend.Enabled', true) as boolean)
      : true,
    legendColor: chartWidget
      ? (getVal(chartWidget, 'Legend.TextStyle.Color', 'rgb(108,117,125)') as string)
      : 'rgb(108,117,125)',
    dgHeaderBg: dgWidget
      ? (getVal(dgWidget, 'DataGridStyle.Header.Background', 'rgb(234,246,249)') as string)
      : 'rgb(234,246,249)',
    dgHeaderColor: dgWidget
      ? (getVal(dgWidget, 'DataGridStyle.Header.TextStyle.Color', 'rgb(73,80,87)') as string)
      : 'rgb(73,80,87)',
    dgHeaderFontSize: dgWidget
      ? (getVal(dgWidget, 'DataGridStyle.Header.TextStyle.FontSize', 15) as number)
      : 15,
    dgBodyColor: dgWidget
      ? (getVal(dgWidget, 'DataGridStyle.Body.TextStyle.Color', 'rgb(73,80,87)') as string)
      : 'rgb(73,80,87)',
    dgBodyFontSize: dgWidget
      ? (getVal(dgWidget, 'DataGridStyle.Body.TextStyle.FontSize', 15) as number)
      : 15,
    dgRowAltEnabled: dgWidget
      ? (getVal(dgWidget, 'DataGridStyle.Body.RowAlternationEnabled', false) as boolean)
      : false,
    dgRowAltColor: dgWidget
      ? (getVal(dgWidget, 'DataGridStyle.Body.RowAlternationColor', 'rgb(234,246,249)') as string)
      : 'rgb(234,246,249)',
    xAxisLabelColor: chartWidget
      ? (getVal(chartWidget, 'XAxis.Labels.TextStyle.Color', 'rgb(108,117,125)') as string)
      : 'rgb(108,117,125)',
    indValueColor: indicatorWidget
      ? (getVal(indicatorWidget, 'ValueSettings.TextStyle.Color', 'rgb(73,80,87)') as string)
      : 'rgb(73,80,87)',
    indPositiveColor: indicatorWidget
      ? (getVal(indicatorWidget, 'TrendSettings.PositiveTrendDetails.Color', 'rgb(29,167,80)') as string)
      : 'rgb(29,167,80)',
    indNegativeColor: indicatorWidget
      ? (getVal(indicatorWidget, 'TrendSettings.NegativeTrendDetails.Color', 'rgb(255,65,54)') as string)
      : 'rgb(255,65,54)',
    dataFont: globalTokens.dataFontFamily,
    showGrid,
    mode,

    titleEnabled: base?.Title?.Enabled ?? true,
    titleItalic: base?.Title?.TextStyle?.IsItalic ?? false,
    titleAlign: (base?.Title?.TextStyle?.Align ?? 1) as number,
    titleBgEnabled: base?.Title?.Background?.Enabled ?? false,
    titleBgColor: base?.Title?.Background?.Color?.Color ?? 'transparent',

    yAxisEnabled: chartWidget
      ? (getVal(chartWidget, 'YAxis.Enabled', true) as boolean)
      : true,
    yAxisLineEnabled: chartWidget
      ? (getVal(chartWidget, 'YAxis.LineEnabled', false) as boolean)
      : false,
    yAxisLabelSize: chartWidget
      ? (getVal(chartWidget, 'YAxis.Labels.TextStyle.FontSize', 12) as number)
      : 12,
    xAxisLineEnabled: chartWidget
      ? (getVal(chartWidget, 'XAxis.LineEnabled', false) as boolean)
      : false,
    xAxisLabelSize: chartWidget
      ? (getVal(chartWidget, 'XAxis.Labels.TextStyle.FontSize', 12) as number)
      : 12,
    xAxisRotation: chartWidget
      ? (getVal(chartWidget, 'XAxis.Labels.RotationAngle', 0) as number)
      : 0,
    legendFontSize: chartWidget
      ? (getVal(chartWidget, 'Legend.TextStyle.FontSize', 12) as number)
      : 12,
    legendPosition: chartWidget
      ? (getVal(chartWidget, 'Legend.VerticalAlign', 0) as number)
      : 0,
    dataLabelsEnabled: chartWidget
      ? (getVal(chartWidget, 'DataLabels.Enabled', false) as boolean)
      : false,
    dataLabelsColor: chartWidget
      ? (getVal(chartWidget, 'DataLabels.TextStyle.Color', 'rgb(73,80,87)') as string)
      : 'rgb(73,80,87)',
    columnWidth: chartWidget
      ? (getVal(chartWidget, 'Column.Width', 20) as number)
      : 20,

    dgOuterBorderColor: dgWidget
      ? (getVal(dgWidget, 'DataGridStyle.OuterBorder.Color.Color', 'rgba(101,210,228,0.5)') as string)
      : 'rgba(101,210,228,0.5)',
    dgHorizBorderColor: dgWidget
      ? (getVal(dgWidget, 'DataGridStyle.InnerHorizontalBorder.Color.Color', 'rgba(0,0,0,0.06)') as string)
      : 'rgba(0,0,0,0.06)',
    dgVertBorderColor: dgWidget
      ? (getVal(dgWidget, 'DataGridStyle.InnerVerticalBorder.Color.Color', 'rgba(0,0,0,0.04)') as string)
      : 'rgba(0,0,0,0.04)',

    indValueFontSize: indicatorWidget
      ? (getVal(indicatorWidget, 'ValueSettings.TextStyle.FontSize', 52) as number)
      : 52,
    indValueBold: indicatorWidget
      ? (getVal(indicatorWidget, 'ValueSettings.TextStyle.IsBold', false) as boolean)
      : false,
    indNeutralColor: indicatorWidget
      ? (getVal(indicatorWidget, 'TrendSettings.NeutralTrendDetails.Color', 'rgb(199,152,7)') as string)
      : 'rgb(199,152,7)',
  };
}

type WidgetStyles = ReturnType<typeof useWidgetStyles>;

/* ================================================================
   WIDGET CARD — shared shell wrapper
   ================================================================ */

const WidgetCard: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  headerRight?: React.ReactNode;
}> = ({ title, subtitle, children, style, headerRight }) => {
  const s = useWidgetStyles();

  return (
    <div
      className="dash-widget"
      style={{
        background: s.bgColor,
        border: s.frameEnabled ? `1px solid ${s.frameColor}` : '1px solid rgba(0,0,0,0.08)',
        borderRadius: s.frameRadius,
        boxShadow:
          s.shadowBlur > 0
            ? `${s.shadowX}px ${s.shadowY}px ${s.shadowBlur}px ${s.shadowColor}`
            : 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        outline: s.showGrid ? '1px dashed rgba(40,238,150,0.3)' : 'none',
        ...style,
      }}
    >
      {s.titleEnabled !== false && (
        <div
          style={{
            padding: '6px 10px 2px',
            background: s.titleBgEnabled ? s.titleBgColor : 'transparent',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: s.titleColor,
                fontFamily: s.titleFont,
                fontSize: Math.min(s.titleSize * 0.55, 13),
                fontWeight: s.titleBold ? 700 : 400,
                fontStyle: s.titleItalic ? 'italic' : 'normal',
                textAlign: s.titleAlign === 0 ? 'left' : s.titleAlign === 2 ? 'right' : 'center',
                lineHeight: 1.3,
              }}
            >
              {title}
            </div>
            {subtitle && <div style={{ color: s.axisLabelColor, fontSize: 9, marginTop: 1 }}>{subtitle}</div>}
          </div>
          {headerRight}
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>{children}</div>
    </div>
  );
};

/* ================================================================
   DASHBOARD HEADER
   ================================================================ */

const DashHeader: React.FC = () => {
  const s = useWidgetStyles();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 14px',
        background: s.bgColor,
        border: s.frameEnabled ? `1px solid ${s.frameColor}` : '1px solid rgba(0,0,0,0.08)',
        borderRadius: s.frameRadius,
        flexShrink: 0,
        outline: s.showGrid ? '1px dashed rgba(40,238,150,0.3)' : 'none',
      }}
    >
      <div
        style={{
          width: 4,
          alignSelf: 'stretch',
          background: s.paletteColors[0],
          borderRadius: 2,
          marginRight: 12,
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: s.titleColor, fontFamily: s.titleFont, lineHeight: 1.2 }}>
          Дашборд отдела продаж
        </div>
        <div style={{ fontSize: 10.5, color: s.axisLabelColor, marginTop: 2 }}>
          Контроль выручки, плана, сделок и эффективности команды
        </div>
      </div>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: s.paletteColors[0],
          border: `2px solid ${s.paletteColors[0]}`,
          borderRadius: 3,
          padding: '3px 8px',
          lineHeight: 1.4,
          textAlign: 'center',
          letterSpacing: 0.5,
        }}
      >
        FatData
      </div>
    </div>
  );
};

/* ================================================================
   FILTER BAR
   ================================================================ */

const FilterField: React.FC<{ label: string; children: React.ReactNode; style?: React.CSSProperties }> = ({
  label,
  children,
  style,
}) => {
  const s = useWidgetStyles();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, ...style }}>
      <span style={{ fontSize: 9, color: s.axisLabelColor, fontWeight: 600, letterSpacing: 0.2 }}>{label}</span>
      {children}
    </div>
  );
};

function useControlStyle(s: WidgetStyles): React.CSSProperties {
  return {
    background: s.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
    color: s.titleColor,
    border: `1px solid ${s.frameEnabled ? s.frameColor : 'rgba(0,0,0,0.12)'}`,
    borderRadius: s.frameRadius,
    fontFamily: s.dataFont,
    fontSize: 11,
    padding: '5px 7px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };
}

const Dropdown: React.FC<{
  value: string;
  options: string[];
  onChange: (v: string) => void;
}> = ({ value, options, onChange }) => {
  const s = useWidgetStyles();
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={useControlStyle(s)}>
      <option value="Все">Все</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
};

const FilterBar: React.FC<{
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}> = ({ filters, setFilters }) => {
  const s = useWidgetStyles();
  const ctrl = useControlStyle(s);
  const upd = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 12,
        padding: '8px 14px',
        background: s.bgColor,
        border: s.frameEnabled ? `1px solid ${s.frameColor}` : '1px solid rgba(0,0,0,0.08)',
        borderRadius: s.frameRadius,
        flexShrink: 0,
        outline: s.showGrid ? '1px dashed rgba(40,238,150,0.3)' : 'none',
      }}
    >
      <FilterField label="ПЕРИОД ПРОДАЖ" style={{ flex: 2.2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="date"
            value={filters.dateFrom}
            min={DATA_MIN}
            max={filters.dateTo}
            onChange={(e) => upd({ dateFrom: e.target.value })}
            style={ctrl}
          />
          <span style={{ color: s.axisLabelColor, fontSize: 11 }}>—</span>
          <input
            type="date"
            value={filters.dateTo}
            min={filters.dateFrom}
            max={DATA_MAX}
            onChange={(e) => upd({ dateTo: e.target.value })}
            style={ctrl}
          />
        </div>
      </FilterField>

      <FilterField label="РЕГИОН" style={{ flex: 1 }}>
        <Dropdown value={filters.region} options={REGIONS} onChange={(v) => upd({ region: v })} />
      </FilterField>

      <FilterField label="МЕНЕДЖЕР" style={{ flex: 1 }}>
        <Dropdown value={filters.manager} options={MANAGERS} onChange={(v) => upd({ manager: v })} />
      </FilterField>

      <FilterField label="КАНАЛ ПРОДАЖ" style={{ flex: 1 }}>
        <Dropdown value={filters.channel} options={CHANNELS} onChange={(v) => upd({ channel: v })} />
      </FilterField>

      <button
        type="button"
        onClick={() =>
          setFilters({ dateFrom: '2025-01-01', dateTo: DATA_MAX, region: 'Все', manager: 'Все', channel: 'Все' })
        }
        style={{
          ...ctrl,
          width: 'auto',
          cursor: 'pointer',
          color: s.paletteColors[0],
          fontWeight: 600,
          background: withAlpha(s.paletteColors[0] || 'rgb(40,238,150)', 0.1),
          borderColor: s.paletteColors[0],
        }}
      >
        Сбросить
      </button>
    </div>
  );
};

/* ================================================================
   KPI ROW — Выручка / Кол-во сделок / Выполнение плана (gauge)
   ================================================================ */

const KpiShell: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const s = useWidgetStyles();
  return (
    <div
      style={{
        flex: 1,
        background: s.bgColor,
        border: s.frameEnabled ? `1px solid ${s.frameColor}` : '1px solid rgba(0,0,0,0.08)',
        borderRadius: s.frameRadius,
        boxShadow: s.shadowBlur > 0 ? `${s.shadowX}px ${s.shadowY}px ${s.shadowBlur}px ${s.shadowColor}` : 'none',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        outline: s.showGrid ? '1px dashed rgba(40,238,150,0.3)' : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const DeltaBadge: React.FC<{ pct: number | null }> = ({ pct }) => {
  const s = useWidgetStyles();
  if (pct === null) {
    return <span style={{ fontSize: 9, color: s.axisLabelColor }}>нет данных за пред. период</span>;
  }
  const pos = pct >= 0;
  const color = pos ? s.indPositiveColor : s.indNegativeColor;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color }}>
      {pos ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%{' '}
      <span style={{ color: s.axisLabelColor, fontWeight: 400, fontSize: 9 }}>к прошлому периоду</span>
    </span>
  );
};

const KpiRow: React.FC<{ model: SalesModel }> = ({ model }) => {
  const s = useWidgetStyles();
  const pc = s.paletteColors;

  const gaugeOption = useMemo(
    () => ({
      series: [
        {
          type: 'gauge',
          startAngle: 210,
          endAngle: -30,
          min: 0,
          max: 120,
          radius: '92%',
          center: ['50%', '60%'],
          progress: { show: true, width: 9, itemStyle: { color: model.completion >= 100 ? s.indPositiveColor : pc[0] } },
          axisLine: { lineStyle: { width: 9, color: [[1, withAlpha(pc[0] || 'rgb(40,238,150)', 0.13)]] } },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          anchor: { show: false },
          pointer: { show: false },
          detail: {
            valueAnimation: false,
            formatter: '{value}%',
            color: s.titleColor,
            fontSize: 22,
            fontWeight: 700,
            fontFamily: s.titleFont,
            offsetCenter: [0, '2%'],
          },
          title: { offsetCenter: [0, '42%'], fontSize: 9, color: s.axisLabelColor, fontFamily: s.dataFont },
          data: [{ value: model.completion, name: `план ${fmtMln(model.planTotal)} млн ₽` }],
        },
      ],
      tooltip: { show: false },
    }),
    [model.completion, model.planTotal, pc, s.titleColor, s.titleFont, s.axisLabelColor, s.dataFont, s.indPositiveColor],
  );

  return (
    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
      {/* Выручка */}
      <KpiShell>
        <div style={{ fontSize: 10, color: s.axisLabelColor, fontWeight: 600 }}>Выручка</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 30, fontWeight: 700, color: pc[0], fontFamily: s.titleFont, lineHeight: 1.1 }}>
            {fmtMln(model.revenue)}
          </span>
          <span style={{ fontSize: 13, color: s.indValueColor, fontWeight: 600 }}>млн ₽</span>
        </div>
        <DeltaBadge pct={deltaPct(model.revenue, model.prevRevenue)} />
      </KpiShell>

      {/* Количество сделок */}
      <KpiShell>
        <div style={{ fontSize: 10, color: s.axisLabelColor, fontWeight: 600 }}>Количество сделок</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 30, fontWeight: 700, color: s.titleColor, fontFamily: s.titleFont, lineHeight: 1.1 }}>
            {fmt(model.dealCount)}
          </span>
          <span style={{ fontSize: 13, color: s.indValueColor, fontWeight: 600 }}>шт.</span>
        </div>
        <DeltaBadge pct={deltaPct(model.dealCount, model.prevDealCount)} />
      </KpiShell>

      {/* Выполнение плана gauge */}
      <KpiShell style={{ flex: 1.1, padding: '4px 10px' }}>
        <div style={{ fontSize: 10, color: s.axisLabelColor, fontWeight: 600, position: 'absolute', padding: '6px 0 0 4px' }}>
          Выполнение плана
        </div>
        <EChart option={gaugeOption} style={{ width: '100%', height: 96 }} />
      </KpiShell>
    </div>
  );
};

/* ================================================================
   LEGEND PLACEMENT HELPER
   ================================================================ */

function legendPlacement(pos: number): Record<string, unknown> {
  switch (pos) {
    case 2: return { bottom: 0, left: 'center', orient: 'horizontal' };
    case 1: return { left: 0, top: 'middle', orient: 'vertical' };
    case 3: return { right: 0, top: 'middle', orient: 'vertical' };
    default: return { top: 0, right: 0, orient: 'horizontal' };
  }
}

/* ================================================================
   REVENUE vs PLAN — line + plan area
   ================================================================ */

const RevenuePlanChart: React.FC<{ model: SalesModel }> = ({ model }) => {
  const s = useWidgetStyles();
  const pc = s.paletteColors;

  const option = useMemo(() => {
    const labels = model.months.map((m) => m.label);
    const interval = labels.length > 14 ? Math.ceil(labels.length / 12) : 0;
    return {
      grid: { top: 28, bottom: 26, left: 46, right: 16 },
      tooltip: {
        trigger: 'axis',
        valueFormatter: (v: number) => `${fmtMln(v)} млн ₽`,
      },
      legend: s.legendEnabled
        ? {
            show: true,
            ...legendPlacement(s.legendPosition),
            textStyle: { color: s.legendColor, fontSize: Math.min(s.legendFontSize * 0.6, 10), fontFamily: s.dataFont },
          }
        : { show: false },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          color: s.xAxisLabelColor,
          fontSize: Math.min(s.xAxisLabelSize * 0.55, 9),
          interval,
          rotate: s.xAxisRotation,
          fontFamily: s.dataFont,
        },
        axisLine: { show: s.xAxisLineEnabled, lineStyle: { color: 'rgba(0,0,0,0.1)' } },
        axisTick: { show: false },
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        show: s.yAxisEnabled,
        axisLabel: {
          color: s.axisLabelColor,
          fontSize: Math.min(s.yAxisLabelSize * 0.6, 9),
          formatter: (v: number) => `${Math.round(v / 1_000_000)}М`,
          fontFamily: s.dataFont,
        },
        splitLine: { show: s.gridEnabled, lineStyle: { color: 'rgba(0,0,0,0.06)' } },
        axisLine: { show: s.yAxisLineEnabled },
      },
      series: [
        {
          name: 'Выручка',
          type: 'line',
          data: model.revByMonth,
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { color: pc[0], width: 2.5 },
          itemStyle: { color: pc[0] },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: withAlpha(pc[0], 0.25) },
                { offset: 1, color: withAlpha(pc[0], 0.02) },
              ],
            },
          },
          label: {
            show: s.dataLabelsEnabled,
            color: s.dataLabelsColor,
            fontSize: 8,
            fontFamily: s.dataFont,
            formatter: (p: { value: number }) => fmtMln(p.value),
          },
        },
        {
          name: 'План',
          type: 'line',
          data: model.planByMonth,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: pc[1] || pc[0], width: 1.8, type: 'dashed' },
          itemStyle: { color: pc[1] || pc[0] },
        },
      ],
    };
  }, [
    model.months, model.revByMonth, model.planByMonth, pc, s.axisLabelColor, s.xAxisLabelColor, s.dataFont,
    s.gridEnabled, s.legendEnabled, s.legendColor, s.yAxisEnabled, s.yAxisLineEnabled, s.yAxisLabelSize,
    s.xAxisLineEnabled, s.xAxisLabelSize, s.xAxisRotation, s.legendFontSize, s.legendPosition,
    s.dataLabelsEnabled, s.dataLabelsColor,
  ]);

  return (
    <WidgetCard title="Динамика выручки и плана" subtitle="По месяцам, млн ₽" style={{ flex: 1 }}>
      <EChart option={option} style={{ position: 'absolute', inset: 0 }} />
    </WidgetCard>
  );
};

/* ================================================================
   REVENUE STRUCTURE — donut by region
   ================================================================ */

const StructurePieChart: React.FC<{ model: SalesModel }> = ({ model }) => {
  const s = useWidgetStyles();
  const pc = s.paletteColors;

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: 'item',
        formatter: (p: { name: string; value: number; percent: number }) =>
          `${p.name}<br/><b>${fmtMln(p.value)} млн ₽</b> (${p.percent.toFixed(1)}%)`,
      },
      legend: {
        show: true,
        type: 'scroll',
        orient: 'vertical',
        right: 4,
        top: 'middle',
        itemWidth: 9,
        itemHeight: 9,
        textStyle: { color: s.legendColor, fontSize: 9, fontFamily: s.dataFont },
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['36%', '52%'],
          data: model.byRegion.map((d, i) => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: pc[i % pc.length] },
          })),
          label: { show: false },
          emphasis: { scale: true, scaleSize: 4 },
        },
      ],
    }),
    [model.byRegion, pc, s.legendColor, s.dataFont],
  );

  return (
    <WidgetCard title="Структура выручки" subtitle="По регионам" style={{ flex: 1 }}>
      <EChart option={option} style={{ position: 'absolute', inset: 0 }} />
    </WidgetCard>
  );
};

/* ================================================================
   REVENUE BY MANAGER — horizontal bar (click to filter)
   ================================================================ */

const ManagerBarChart: React.FC<{
  model: SalesModel;
  onPick: (name: string) => void;
}> = ({ model, onPick }) => {
  const s = useWidgetStyles();
  const pc = s.paletteColors;

  const option = useMemo(() => {
    const data = [...model.byManager].reverse();
    return {
      grid: { top: 6, bottom: 6, left: 78, right: 56 },
      xAxis: { type: 'value', show: false },
      yAxis: {
        type: 'category',
        data: data.map((d) => d.name),
        axisLabel: { color: s.axisLabelColor, fontSize: 9, fontFamily: s.dataFont },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      tooltip: {
        trigger: 'item',
        formatter: (p: { name: string; value: number }) => `${p.name}<br/><b>${fmtMln(p.value)} млн ₽</b>`,
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => d.value),
          itemStyle: { color: pc[0], borderRadius: [0, 3, 3, 0] },
          barWidth: Math.max(8, Math.min(s.columnWidth * 0.4, 18)),
          label: {
            show: true,
            position: 'right',
            formatter: (p: { value: number }) => `${fmtMln(p.value)}М`,
            fontSize: 9,
            color: s.dataLabelsEnabled ? s.dataLabelsColor : pc[0],
            fontFamily: s.dataFont,
          },
        },
      ],
    };
  }, [model.byManager, pc, s.axisLabelColor, s.dataFont, s.columnWidth, s.dataLabelsEnabled, s.dataLabelsColor]);

  return (
    <WidgetCard title="Выручка по менеджерам" subtitle="Клик — фильтр по менеджеру" style={{ flex: 1 }}>
      <EChart
        option={option}
        style={{ position: 'absolute', inset: 0 }}
        onClick={(p) => p.name && onPick(p.name)}
      />
    </WidgetCard>
  );
};

/* ================================================================
   REVENUE BY CATEGORY / PRODUCT — treemap
   ================================================================ */

const CategoryTreemap: React.FC<{ model: SalesModel }> = ({ model }) => {
  const s = useWidgetStyles();

  const option = useMemo(
    () => ({
      tooltip: {
        formatter: (p: { name: string; value: number }) => `${p.name}<br/><b>${fmtMln(p.value)} млн ₽</b>`,
      },
      series: [
        {
          type: 'treemap',
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          width: '100%',
          height: '100%',
          top: 2, left: 2, right: 2, bottom: 2,
          label: {
            show: true,
            color: '#fff',
            fontSize: 9,
            fontFamily: s.dataFont,
            formatter: (p: { name: string; value: number }) => `${p.name}\n${fmtMln(p.value)}М`,
          },
          upperLabel: {
            show: true,
            height: 16,
            color: '#fff',
            fontSize: 9.5,
            fontWeight: 700,
            fontFamily: s.dataFont,
          },
          levels: [
            { itemStyle: { borderColor: s.bgColor, borderWidth: 2, gapWidth: 2 } },
            { itemStyle: { borderColor: s.bgColor, borderWidth: 1, gapWidth: 1 }, upperLabel: { show: true } },
          ],
          data: model.treemap,
        },
      ],
    }),
    [model.treemap, s.dataFont, s.bgColor],
  );

  return (
    <WidgetCard title="Выручка по категориям и продуктам" subtitle="Диаграмма-дерево" style={{ flex: 1 }}>
      <EChart option={option} style={{ position: 'absolute', inset: 0 }} />
    </WidgetCard>
  );
};

/* ================================================================
   DEALS TABLE
   ================================================================ */

const StatusPill: React.FC<{ status: Status }> = ({ status }) => {
  const s = useWidgetStyles();
  const color =
    status === 'Закрыта' ? s.indPositiveColor : status === 'В работе' ? s.indNeutralColor : s.indNegativeColor;
  return (
    <span
      style={{
        color,
        background: withAlpha(color, 0.13),
        border: `1px solid ${withAlpha(color, 0.4)}`,
        borderRadius: 10,
        padding: '1px 7px',
        fontSize: 8.5,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
};

const DealsTable: React.FC<{ model: SalesModel }> = ({ model }) => {
  const s = useWidgetStyles();
  const rows = model.curDeals;

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '5px 8px',
    color: s.dgHeaderColor,
    fontWeight: 600,
    fontSize: Math.min(s.dgHeaderFontSize * 0.62, 10),
    position: 'sticky',
    top: 0,
    background: s.dgHeaderBg,
    whiteSpace: 'nowrap',
    zIndex: 1,
  };
  const tdStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '4px 8px',
    color: s.dgBodyColor,
    fontSize: Math.min(s.dgBodyFontSize * 0.62, 10),
    whiteSpace: 'nowrap',
  };

  return (
    <WidgetCard
      title="Реестр сделок"
      subtitle={`Найдено сделок: ${fmt(rows.length)}`}
      style={{ flex: 1 }}
    >
      <div
        style={{
          overflow: 'auto',
          height: '100%',
          padding: '0 4px 4px',
          border: `1px solid ${s.dgOuterBorderColor}`,
          borderRadius: s.frameRadius,
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: s.dataFont }}>
          <thead>
            <tr>
              <th style={thStyle}>Дата</th>
              <th style={thStyle}>Клиент</th>
              <th style={thStyle}>Менеджер</th>
              <th style={thStyle}>Регион</th>
              <th style={thStyle}>Канал</th>
              <th style={thStyle}>Продукт</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Сумма сделки</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Статус</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.id}
                style={{
                  borderBottom: `1px solid ${s.dgHorizBorderColor}`,
                  background: s.dgRowAltEnabled && i % 2 === 1 ? s.dgRowAltColor : 'transparent',
                }}
              >
                <td style={tdStyle}>{r.dateStr}</td>
                <td style={tdStyle}>{r.client}</td>
                <td style={tdStyle}>{r.manager}</td>
                <td style={tdStyle}>{r.region}</td>
                <td style={tdStyle}>{r.channel}</td>
                <td style={tdStyle}>{r.product}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: s.indValueColor }}>
                  {fmt(r.amount)} ₽
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <StatusPill status={r.status} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: 'center', padding: 24, color: s.axisLabelColor }}>
                  Нет сделок по выбранным фильтрам
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </WidgetCard>
  );
};

/* ================================================================
   ECHARTS SHEET — главный лист дашборда отдела продаж
   ================================================================ */

const EChartsSheet: React.FC = () => {
  const { palette } = useThemeStore();
  const paletteColors = palette.map((c) => c.value);

  const [filters, setFilters] = useState<Filters>({
    dateFrom: '2025-01-01',
    dateTo: DATA_MAX,
    region: 'Все',
    manager: 'Все',
    channel: 'Все',
  });

  const model = useMemo(() => buildModel(filters, paletteColors), [filters, paletteColors]);

  const pickManager = (name: string) =>
    setFilters((f) => ({ ...f, manager: f.manager === name ? 'Все' : name }));

  return (
    <div
      className="dash-preview"
      style={{
        width: 1200,
        height: 780,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: 6,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: 12,
      }}
    >
      <DashHeader />
      <FilterBar filters={filters} setFilters={setFilters} />
      <KpiRow model={model} />

      <div style={{ height: 158, display: 'flex', flexShrink: 0 }}>
        <RevenuePlanChart model={model} />
      </div>

      <div style={{ height: 176, display: 'flex', gap: 6, flexShrink: 0 }}>
        <StructurePieChart model={model} />
        <ManagerBarChart model={model} onPick={pickManager} />
        <CategoryTreemap model={model} />
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <DealsTable model={model} />
      </div>
    </div>
  );
};

/* ================================================================
   VISAPI SHEET — iframe live preview (unchanged)
   ================================================================ */

const VisApiSheet: React.FC = () => {
  const s = useWidgetStyles();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { theme, palette, globalTokens, themeName, getExportTheme, visApiUrl, visApiTargetOrigin } = useThemeStore();

  useEffect(() => {
    if (!iframeRef.current?.contentWindow || !visApiUrl) return;
    iframeRef.current.contentWindow.postMessage(
      {
        type: 'VIS_THEME_UPDATE',
        source: 'fd-visiology-theme-generator',
        themeName,
        payload: getExportTheme(),
      },
      visApiTargetOrigin || '*',
    );
  }, [theme, palette, globalTokens, themeName, getExportTheme, visApiUrl, visApiTargetOrigin]);

  return (
    <div
      className="dash-preview"
      style={{
        width: 1200,
        height: 780,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 12,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: 12,
      }}
    >
      <div
        style={{
          background: s.bgColor,
          border: s.frameEnabled ? `1px solid ${s.frameColor}` : '1px solid rgba(0,0,0,0.08)',
          borderRadius: s.frameRadius,
          padding: '10px 12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ color: s.titleColor, fontFamily: s.titleFont, fontWeight: 700, fontSize: Math.min(s.titleSize * 0.65, 16) }}>
              Лист VisAPI — просмотр
            </div>
            <div style={{ color: s.axisLabelColor, fontSize: 10, marginTop: 2 }}>
              {visApiUrl || 'URL не настроен'}
            </div>
          </div>
          {visApiUrl && (
            <div style={{
              background: 'rgba(255,200,50,0.12)',
              border: '1px solid rgba(255,200,50,0.3)',
              borderRadius: 5,
              padding: '4px 10px',
              fontSize: 9,
              color: '#ffc832',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              ⚠️ Тема не синхронизируется live — экспортируй JSON
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          background: s.bgColor,
          border: s.frameEnabled ? `1px solid ${s.frameColor}` : '1px solid rgba(0,0,0,0.08)',
          borderRadius: s.frameRadius,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: s.showGrid ? '1px dashed rgba(40,238,150,0.3)' : 'none',
        }}
      >
        {visApiUrl ? (
          <iframe
            ref={iframeRef}
            title="VisAPI Preview"
            src={visApiUrl}
            onLoad={() => {
              if (!iframeRef.current?.contentWindow) return;
              iframeRef.current.contentWindow.postMessage(
                {
                  type: 'VIS_THEME_UPDATE',
                  source: 'fd-visiology-theme-generator',
                  themeName,
                  payload: getExportTheme(),
                },
                visApiTargetOrigin || '*',
              );
            }}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: s.frameRadius,
              background: 'transparent',
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', maxWidth: 700, padding: '20px 24px' }}>
            <div style={{ fontSize: 44, marginBottom: 10, color: s.paletteColors[0] }}>◈</div>
            <div style={{ color: s.titleColor, fontFamily: s.titleFont, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
              VisAPI iframe не настроен
            </div>
            <div style={{ color: s.axisLabelColor, fontSize: 11, lineHeight: 1.7, marginBottom: 16 }}>
              Введи URL дашборда Visiology в блоке <b>Theme → VisAPI — просмотр дашборда</b>.
            </div>
            <div style={{ display: 'flex', gap: 10, textAlign: 'left' }}>
              {[
                {
                  icon: '🎨',
                  title: 'Режим дизайна',
                  desc: 'Оставайся на листе ECharts, настраивай цвета, шрифты, виджеты — всё обновляется в реальном времени.',
                },
                {
                  icon: '📤',
                  title: 'Экспорт в Visiology',
                  desc: 'Нажми Экспорт JSON → загрузи файл в Admin Panel Visiology (Appearance → Themes). Это единственный способ применить тему.',
                },
                {
                  icon: '📥',
                  title: 'Импорт из Visiology',
                  desc: 'Используй кнопку «Получить тему из Visiology API» в Theme → Импорт или загрузи JSON файл вручную.',
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 5 }}>{icon}</div>
                  <div style={{ color: s.titleColor, fontWeight: 600, fontSize: 11, marginBottom: 4 }}>{title}</div>
                  <div style={{ color: s.axisLabelColor, fontSize: 10, lineHeight: 1.6 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ================================================================
   SHEET SWITCHER
   ================================================================ */

export const DashboardPreview: React.FC = () => {
  const { activeSheet } = useThemeStore();
  return activeSheet === 'visapi' ? <VisApiSheet /> : <EChartsSheet />;
};
