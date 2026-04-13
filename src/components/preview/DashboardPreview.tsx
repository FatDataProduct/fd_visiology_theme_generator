import React, { useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
import { useThemeStore } from '../../store/themeStore';

/* ================================================================
   MOCK DATA — stable module-level constants
   ================================================================ */

const TOP_SALES = [
  { name: 'Copiers', value: 239090 },
  { name: 'Bookcases', value: 216491 },
  { name: 'Phones', value: 213216 },
  { name: 'Storage', value: 209136 },
  { name: 'Appliances', value: 172735 },
  { name: 'Machines', value: 138944 },
  { name: 'Chairs', value: 131641 },
  { name: 'Accessories', value: 106273 },
  { name: 'Art', value: 95794 },
  { name: 'Tables', value: 67755 },
];

const MONTHS = [
  '01 дек. 17', '01 нояб. 18', '01 дек. 18',
  '01 янв. 18', '01 фев. 18', '01 мар. 18', '01 апр. 18', '01 май 18',
  '01 июн. 18', '01 июл. 18', '01 авг. 18', '01 сен. 18', '01 окт. 18', '01 нояб. 18',
  '01 дек. 18', '01 янв. 19', '01 фев. 19', '01 мар. 19', '01 апр. 19', '01 май 19',
  '01 июн. 19', '01 июл. 19', '01 авг. 19', '01 сен. 19', '01 окт. 19', '01 нояб. 19',
  '01 дек. 19',
];

const SALES_MONTHLY = [
  820, 880, 750, 900, 1100, 980, 850, 920, 1050, 1200, 1350, 1150, 1400,
  980, 1100, 1250, 1380, 1150, 1050, 1200, 1350, 1500, 1650, 1580, 1758, 1700, 1758,
];

const PROFIT_PCT = [
  5, 8, -3, 8, 12, -5, 2, 15, -8, 10, 7, -12, 18,
  3, -7, 11, 9, -2, 6, 14, -10, 8, 5, -15, 12, 7, 10,
];

const HEATMAP_CATS = [
  'Accessories', 'Appliances', 'Art', 'Binders', 'Bookcases', 'Chairs', 'Copiers',
  'Envelopes', 'Fasteners', 'Furnishings', 'Labels', 'Machines', 'Paper', 'Phones',
  'Storage', 'Supplies', 'Tables',
];

const HEATMAP_DATA: [number, number, number][] = (() => {
  const d: [number, number, number][] = [];
  for (let cat = 0; cat < HEATMAP_CATS.length; cat++) {
    for (let m = 0; m < MONTHS.length; m++) {
      const val = Math.round(
        Math.sin(cat * 3.7 + m * 1.3) * 40 + Math.cos(cat * 2.1 - m * 0.8) * 15,
      );
      d.push([m, cat, Math.max(-50, Math.min(50, val))]);
    }
  }
  return d;
})();

const REGIONS = [
  { name: 'Abruzzi', count: 56, sales: 4740, profit: 469, pct: 10, spark: [3, 5, 4, 6, 3, 5, 7, 4, 6, 5, 8, 6] },
  { name: 'Alsace-Champ..', count: 413, sales: 32464, profit: 2615, pct: 8, spark: [10, 12, 8, 15, 10, 14, 12, 16, 11, 14, 13, 15] },
  { name: 'Andalusia', count: 214, sales: 23897, profit: 5200, pct: 22, spark: [8, 10, 12, 9, 14, 12, 15, 13, 16, 15, 18, 17] },
  { name: 'Antwerp', count: 105, sales: 10121, profit: 1931, pct: 19, spark: [4, 6, 5, 7, 8, 6, 9, 7, 10, 8, 11, 9] },
  { name: 'Apulia', count: 160, sales: 13337, profit: 1170, pct: 9, spark: [6, 5, 7, 4, 8, 6, 5, 7, 6, 8, 7, 9] },
  { name: 'Aquitaine-Lim..', count: 495, sales: 40689, profit: 6092, pct: 15, spark: [15, 18, 16, 20, 17, 22, 19, 24, 21, 23, 25, 22] },
  { name: 'Asturias', count: 42, sales: 4625, profit: 1446, pct: 31, spark: [2, 3, 4, 3, 5, 4, 6, 5, 7, 6, 5, 8] },
  { name: 'Auvergne-Rhô..', count: 584, sales: 50920, profit: 8676, pct: 17, spark: [20, 22, 18, 25, 21, 28, 24, 30, 26, 28, 32, 29] },
  { name: 'Baden-Württe..', count: 344, sales: 30413, profit: 6125, pct: 20, spark: [12, 14, 11, 16, 13, 18, 15, 20, 17, 19, 22, 18] },
  { name: 'Balearic Islands', count: 51, sales: 6062, profit: 1310, pct: 22, spark: [2, 3, 2, 4, 3, 5, 4, 6, 5, 4, 7, 5] },
  { name: 'Basel-Stadt', count: 24, sales: 2434, profit: 994, pct: 41, spark: [1, 2, 1, 3, 2, 4, 3, 2, 4, 3, 5, 3] },
];

const BOXPLOT_ITEMS = [
  { name: 'Furniture', median: 511, stats: [50, 200, 511, 800, 1800] as [number, number, number, number, number] },
  { name: 'Office Supplies', median: 161, stats: [10, 60, 161, 300, 800] as [number, number, number, number, number] },
  { name: 'Technology', median: 585, stats: [30, 250, 585, 900, 2100] as [number, number, number, number, number] },
];

const SCATTER_PTS: [number, number][] = [
  [120, 0], [250, 0], [350, 0], [420, 0], [550, 0], [620, 0], [700, 0], [900, 0],
  [1050, 0], [1200, 0], [1400, 0], [1600, 0], [1800, 0],
  [25, 1], [50, 1], [80, 1], [130, 1], [200, 1], [300, 1], [400, 1], [600, 1], [700, 1],
  [80, 2], [150, 2], [350, 2], [550, 2], [700, 2], [850, 2], [1200, 2], [1500, 2], [2000, 2],
];

const KPI_SPARK = [
  56000, 52000, 48000, 55000, 61000, 58000, 63000, 72000, 68000, 65000, 74000, 80000,
  85000, 78000, 82000, 90000, 95000, 88000, 92000, 100000, 105000, 110000, 115000, 123990,
];

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

function withAlpha(color: string, alpha: number): string {
  const m = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) return `rgba(${m[1]},${m[2]},${m[3]},${alpha})`;
  if (color.startsWith('#') && color.length >= 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
}

/* ================================================================
   ECHART WRAPPER — lightweight React wrapper around ECharts
   ================================================================ */

interface EChartProps {
  option: Record<string, unknown>;
  style?: React.CSSProperties;
}

const EChart = React.memo<EChartProps>(({ option, style }) => {
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

  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true, lazyUpdate: true });
  }, [option]);

  return <div ref={containerRef} style={style} />;
});

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
    bgColor: base?.Background?.Enabled
      ? (base.Background?.Color?.Color ?? (mode === 'dark' ? 'rgba(30,30,46,0.95)' : 'rgba(255,255,255,0.95)'))
      : (mode === 'dark' ? 'rgba(30,30,46,0.95)' : 'rgba(255,255,255,0.95)'),
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
  };
}

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
      <div style={{ padding: '6px 10px 2px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <div
            style={{
              color: s.titleColor,
              fontFamily: s.titleFont,
              fontSize: Math.min(s.titleSize * 0.55, 13),
              fontWeight: s.titleBold ? 700 : 400,
              lineHeight: 1.3,
            }}
          >
            {title}
          </div>
          {subtitle && <div style={{ color: s.axisLabelColor, fontSize: 9, marginTop: 1 }}>{subtitle}</div>}
        </div>
        {headerRight}
      </div>
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
        padding: '6px 12px',
        background: s.bgColor,
        border: s.frameEnabled ? `1px solid ${s.frameColor}` : '1px solid rgba(0,0,0,0.08)',
        borderRadius: s.frameRadius,
        flexShrink: 0,
        outline: s.showGrid ? '1px dashed rgba(40,238,150,0.3)' : 'none',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: s.titleColor, fontFamily: s.titleFont }}>
          Продажи отдела
        </div>
        <div style={{ fontSize: 9, color: s.axisLabelColor }}>
          Дашборд для отслеживания продаж офисной мебели
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
        <span style={{ fontSize: 10, color: s.axisLabelColor, fontWeight: 600 }}>Год</span>
        <select
          style={{
            fontSize: 10,
            padding: '2px 8px',
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.15)',
            background: 'transparent',
            color: s.axisLabelColor,
          }}
        >
          <option>(Multiple values)</option>
        </select>
      </div>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: s.paletteColors[0],
          border: `2px solid ${s.paletteColors[0]}`,
          borderRadius: 3,
          padding: '3px 6px',
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 10 }}>ВС·13</div>
        <div style={{ fontSize: 7, letterSpacing: 1 }}>СТАНД</div>
        <div style={{ fontSize: 7, letterSpacing: 1 }}>АРТ</div>
      </div>
    </div>
  );
};

/* ================================================================
   KPI ROW
   ================================================================ */

const KPIRow: React.FC = () => {
  const s = useWidgetStyles();
  const pc = s.paletteColors;

  const sparkOption = useMemo(
    () => ({
      grid: { top: 5, bottom: 18, left: 5, right: 5 },
      xAxis: {
        type: 'category',
        data: KPI_SPARK.map((_, i) => i),
        show: false,
        boundaryGap: false,
      },
      yAxis: { type: 'value', show: false },
      series: [
        {
          type: 'line',
          data: KPI_SPARK,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: pc[1] || pc[0], width: 1.5 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: withAlpha(pc[1] || pc[0], 0.25) },
                { offset: 1, color: withAlpha(pc[1] || pc[0], 0.02) },
              ],
            },
          },
        },
      ],
      tooltip: { show: false },
    }),
    [pc],
  );

  const progressOption = useMemo(
    () => ({
      grid: { top: 0, bottom: 0, left: 0, right: 0 },
      xAxis: { type: 'value', max: 100, show: false },
      yAxis: { type: 'category', data: [''], show: false },
      series: [
        {
          type: 'bar',
          data: [78],
          barWidth: 22,
          itemStyle: { color: pc[0], borderRadius: [0, 4, 4, 0] },
          z: 2,
        },
        {
          type: 'bar',
          data: [100],
          barWidth: 22,
          barGap: '-100%',
          itemStyle: { color: 'rgba(0,0,0,0.06)', borderRadius: 4 },
          z: 1,
        },
      ],
      tooltip: { show: false },
    }),
    [pc],
  );

  const cardBorder = s.frameEnabled ? `1px solid ${s.frameColor}` : '1px solid rgba(0,0,0,0.08)';

  return (
    <div
      style={{
        display: 'flex',
        background: s.bgColor,
        border: cardBorder,
        borderRadius: s.frameRadius,
        overflow: 'hidden',
        flexShrink: 0,
        outline: s.showGrid ? '1px dashed rgba(40,238,150,0.3)' : 'none',
      }}
    >
      {/* Sales */}
      <div style={{ flex: 5, padding: '8px 12px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: s.axisLabelColor }}>Продажи</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: pc[0], fontFamily: s.titleFont, whiteSpace: 'nowrap' }}>
            1 807 645 ₽
          </div>
          <div style={{ fontSize: 8, color: s.axisLabelColor, lineHeight: 1.4 }}>
            всего за период
            <br />
            <span style={{ color: pc[0], fontWeight: 600 }}>56 851 ₽</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: s.axisLabelColor, marginBottom: 1 }}>
            <span>01 янв. 18</span>
            <span>
              <span style={{ fontWeight: 600, color: s.indValueColor, marginRight: 12 }}>01 дек. 19</span>
              <span style={{ fontWeight: 600, color: s.indValueColor }}>123 990 ₽</span>
            </span>
          </div>
          <EChart option={sparkOption} style={{ width: '100%', height: 48 }} />
        </div>
      </div>

      <div style={{ width: 1, background: 'rgba(0,0,0,0.06)', flexShrink: 0 }} />

      {/* Plan completion */}
      <div style={{ flex: 3, padding: '8px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 9, color: s.axisLabelColor }}>Выполнение плана</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: s.indValueColor, fontFamily: s.titleFont }}>78%</div>
        <EChart option={progressOption} style={{ width: '100%', height: 24 }} />
      </div>

      <div style={{ width: 1, background: 'rgba(0,0,0,0.06)', flexShrink: 0 }} />

      {/* Profitability */}
      <div style={{ flex: 2, padding: '8px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
        <div style={{ fontSize: 9, color: s.axisLabelColor }}>Доходность</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: s.titleColor, fontFamily: s.titleFont }}>12%</div>
        <div style={{ fontSize: 9, color: s.indNegativeColor }}>▼ .7% YoY</div>
      </div>
    </div>
  );
};

/* ================================================================
   TOP SALES — horizontal bar chart
   ================================================================ */

const TopSalesChart: React.FC = () => {
  const s = useWidgetStyles();

  const option = useMemo(
    () => ({
      grid: { top: 2, bottom: 2, left: 80, right: 70 },
      xAxis: { type: 'value', show: false },
      yAxis: {
        type: 'category',
        data: [...TOP_SALES].reverse().map((d) => d.name),
        axisLabel: { color: s.axisLabelColor, fontSize: 9, fontFamily: s.dataFont },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: [...TOP_SALES].reverse().map((d) => d.value),
          itemStyle: { color: s.paletteColors[0] },
          barWidth: 14,
          label: {
            show: true,
            position: 'right',
            formatter: (p: { value: number }) => fmt(p.value) + ' ₽',
            fontSize: 8,
            color: s.paletteColors[0],
            fontFamily: s.dataFont,
          },
        },
      ],
      tooltip: { show: false },
    }),
    [s.paletteColors, s.axisLabelColor, s.dataFont],
  );

  return (
    <WidgetCard title="Топ продаж, ₽" subtitle="По категориям" style={{ flex: 1 }}>
      <EChart option={option} style={{ position: 'absolute', inset: 0 }} />
    </WidgetCard>
  );
};

/* ================================================================
   SALES LINE CHART
   ================================================================ */

const SalesLineChart: React.FC = () => {
  const s = useWidgetStyles();
  const pc = s.paletteColors;

  const option = useMemo(
    () => ({
      grid: { top: 25, bottom: 30, left: 40, right: 15 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: MONTHS,
        axisLabel: { color: s.xAxisLabelColor, fontSize: 7, interval: 5, fontFamily: s.dataFont },
        axisLine: { lineStyle: { color: 'rgba(0,0,0,0.1)' } },
        axisTick: { show: false },
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 2000,
        axisLabel: { color: s.axisLabelColor, fontSize: 8, fontFamily: s.dataFont },
        splitLine: { show: s.gridEnabled, lineStyle: { color: 'rgba(0,0,0,0.06)' } },
        axisLine: { show: false },
      },
      legend: s.legendEnabled
        ? {
            show: true,
            top: 0,
            right: 0,
            textStyle: { color: s.legendColor, fontSize: 8, fontFamily: s.dataFont },
          }
        : { show: false },
      series: [
        {
          name: 'Продажи',
          type: 'line',
          data: SALES_MONTHLY,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: pc[0], width: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: withAlpha(pc[0], 0.2) },
                { offset: 1, color: withAlpha(pc[0], 0.02) },
              ],
            },
          },
        },
        {
          name: 'Тренд',
          type: 'line',
          data: SALES_MONTHLY.map((_, i) => 700 + i * 40),
          smooth: true,
          symbol: 'none',
          lineStyle: { color: pc[1] || pc[0], width: 1.5, type: 'dashed' },
        },
      ],
    }),
    [pc, s.axisLabelColor, s.xAxisLabelColor, s.dataFont, s.gridEnabled, s.legendEnabled, s.legendColor],
  );

  return (
    <WidgetCard
      title="Продажи, шт."
      subtitle="По месяцам"
      style={{ flex: 3 }}
      headerRight={
        <div style={{ fontSize: 8, color: s.axisLabelColor, textAlign: 'right', flexShrink: 0 }}>
          <span>01 дек. 19</span>
          <br />
          <span style={{ fontWeight: 700, fontSize: 12, color: s.titleColor }}>1 758</span>
        </div>
      }
    >
      <EChart option={option} style={{ position: 'absolute', inset: 0 }} />
    </WidgetCard>
  );
};

/* ================================================================
   PROFITABILITY BAR CHART
   ================================================================ */

const ProfitBarChart: React.FC = () => {
  const s = useWidgetStyles();

  const option = useMemo(
    () => ({
      grid: { top: 10, bottom: 25, left: 35, right: 10 },
      xAxis: {
        type: 'category',
        data: MONTHS,
        axisLabel: { color: s.xAxisLabelColor, fontSize: 7, interval: 5, fontFamily: s.dataFont },
        axisLine: { lineStyle: { color: 'rgba(0,0,0,0.1)' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: s.axisLabelColor, fontSize: 8, formatter: '{value}%', fontFamily: s.dataFont },
        splitLine: { show: s.gridEnabled, lineStyle: { color: 'rgba(0,0,0,0.06)' } },
        axisLine: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: PROFIT_PCT.map((v) => ({
            value: v,
            itemStyle: { color: v >= 0 ? s.indPositiveColor : s.indNegativeColor },
          })),
          barWidth: '60%',
        },
      ],
      tooltip: {
        trigger: 'axis',
        formatter: (params: { name: string; value: number }[]) => {
          const p = Array.isArray(params) ? params[0] : params;
          return `${p.name}: ${p.value}%`;
        },
      },
    }),
    [s.paletteColors, s.axisLabelColor, s.xAxisLabelColor, s.dataFont, s.gridEnabled, s.indPositiveColor, s.indNegativeColor],
  );

  return (
    <WidgetCard title="Доходность" subtitle="По месяцам" style={{ flex: 3 }}>
      <EChart option={option} style={{ position: 'absolute', inset: 0 }} />
    </WidgetCard>
  );
};

/* ================================================================
   PROFITABILITY HEATMAP
   ================================================================ */

const ProfitHeatmap: React.FC = () => {
  const s = useWidgetStyles();

  const option = useMemo(
    () => ({
      grid: { top: 22, bottom: 25, left: 75, right: 5 },
      xAxis: {
        type: 'category',
        data: MONTHS,
        axisLabel: { color: s.axisLabelColor, fontSize: 6, interval: 11, fontFamily: s.dataFont, rotate: 0 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitArea: { show: false },
      },
      yAxis: {
        type: 'category',
        data: HEATMAP_CATS,
        axisLabel: { color: s.axisLabelColor, fontSize: 6, fontFamily: s.dataFont },
        axisLine: { show: false },
        axisTick: { show: false },
        splitArea: { show: false },
      },
      visualMap: {
        min: -50,
        max: 50,
        show: true,
        orient: 'horizontal',
        left: 'center',
        top: 0,
        itemWidth: 8,
        itemHeight: 60,
        text: ['50%', '-50%'],
        textStyle: { color: s.axisLabelColor, fontSize: 7 },
        inRange: {
          color: [s.indNegativeColor, '#E8E8E8', s.indPositiveColor],
        },
      },
      series: [
        {
          type: 'heatmap',
          data: HEATMAP_DATA,
          label: { show: false },
          emphasis: {
            itemStyle: { shadowBlur: 4, shadowColor: 'rgba(0,0,0,0.2)' },
          },
        },
      ],
      tooltip: {
        formatter: (p: { value: [number, number, number] }) =>
          `${HEATMAP_CATS[p.value[1]]}<br/>${MONTHS[p.value[0]]}: <b>${p.value[2]}%</b>`,
      },
    }),
    [s.axisLabelColor, s.dataFont, s.indPositiveColor, s.indNegativeColor],
  );

  return (
    <WidgetCard title="Доходность, %" subtitle="По категориям и месяцам" style={{ flex: 1 }}>
      <EChart option={option} style={{ position: 'absolute', inset: 0 }} />
    </WidgetCard>
  );
};

/* ================================================================
   AVERAGE CHECK — boxplot + scatter
   ================================================================ */

const AvgCheckChart: React.FC = () => {
  const s = useWidgetStyles();
  const pc = s.paletteColors;

  const option = useMemo(
    () => ({
      grid: { top: 10, bottom: 25, left: 110, right: 15 },
      tooltip: { trigger: 'item' },
      xAxis: {
        type: 'value',
        axisLabel: { color: s.axisLabelColor, fontSize: 8, fontFamily: s.dataFont },
        splitLine: { show: s.gridEnabled, lineStyle: { color: 'rgba(0,0,0,0.06)' } },
        axisLine: { show: false },
      },
      yAxis: {
        type: 'category',
        data: BOXPLOT_ITEMS.map((d) => `${d.name}   ${d.median} ₽`),
        axisLabel: { color: s.axisLabelColor, fontSize: 8, fontFamily: s.dataFont },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: 'boxplot',
          data: BOXPLOT_ITEMS.map((d) => d.stats),
          itemStyle: { color: withAlpha(pc[0], 0.2), borderColor: pc[0] },
          boxWidth: [10, 18],
        },
        {
          type: 'scatter',
          data: SCATTER_PTS,
          itemStyle: { color: withAlpha(pc[0], 0.35) },
          symbolSize: 4,
        },
      ],
    }),
    [pc, s.axisLabelColor, s.dataFont, s.gridEnabled],
  );

  return (
    <WidgetCard title="Средний чек, ₽" subtitle="По категориям, каждая точка — один заказ" style={{ flex: 3 }}>
      <EChart option={option} style={{ position: 'absolute', inset: 0 }} />
    </WidgetCard>
  );
};

/* ================================================================
   SPARKLINE SVG — tiny inline sparkline for table rows
   ================================================================ */

const SparklineSVG: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const w = 60;
  const h = 16;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(' ');

  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1} />
    </svg>
  );
};

/* ================================================================
   REGIONS TABLE
   ================================================================ */

const RegionsTable: React.FC = () => {
  const s = useWidgetStyles();

  const thStyle: React.CSSProperties = {
    textAlign: 'right',
    padding: '4px 5px',
    color: s.dgHeaderColor,
    fontWeight: 600,
    fontSize: Math.min(s.dgHeaderFontSize * 0.6, 9),
    position: 'sticky',
    top: 0,
    background: s.dgHeaderBg,
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    textAlign: 'right',
    padding: '3px 5px',
    color: s.dgBodyColor,
    fontSize: Math.min(s.dgBodyFontSize * 0.6, 9),
    whiteSpace: 'nowrap',
  };

  return (
    <WidgetCard
      title="Регионы"
      subtitle="Детальная таблица"
      style={{ flex: 1 }}
      headerRight={
        <div style={{ display: 'flex', gap: 6, fontSize: 8, flexShrink: 0 }}>
          <div>
            <span style={{ color: s.axisLabelColor, fontSize: 8 }}>Регион </span>
            <select style={{ fontSize: 8, border: '1px solid rgba(0,0,0,0.15)', borderRadius: 2, padding: '1px 4px', background: 'transparent', color: s.titleColor }}>
              <option>(All)</option>
            </select>
          </div>
          <div>
            <span style={{ color: s.axisLabelColor, fontSize: 8 }}>Категория </span>
            <select style={{ fontSize: 8, border: '1px solid rgba(0,0,0,0.15)', borderRadius: 2, padding: '1px 4px', background: 'transparent', color: s.titleColor }}>
              <option>(All)</option>
            </select>
          </div>
        </div>
      }
    >
      <div style={{ overflow: 'auto', height: '100%', padding: '0 4px 4px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: s.dataFont }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, textAlign: 'left' }}>Регион</th>
              <th style={thStyle}>Кол-во</th>
              <th style={thStyle}>Продажи</th>
              <th style={thStyle}>Прибыль</th>
              <th style={thStyle}>Доходность</th>
              <th style={{ ...thStyle, fontSize: 7, textAlign: 'center' }}>(график по месяцам)</th>
            </tr>
          </thead>
          <tbody>
            {REGIONS.map((r, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  background: s.dgRowAltEnabled && i % 2 === 1 ? s.dgRowAltColor : 'transparent',
                }}
              >
                <td style={{ ...tdStyle, textAlign: 'left' }}>{r.name}</td>
                <td style={tdStyle}>{r.count}</td>
                <td style={tdStyle}>{fmt(r.sales)} ₽</td>
                <td style={tdStyle}>{fmt(r.profit)} ₽</td>
                <td style={tdStyle}>{r.pct}%</td>
                <td style={{ padding: '2px 4px' }}>
                  <SparklineSVG data={r.spark} color={s.paletteColors[0]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetCard>
  );
};

const EChartsSheet: React.FC = () => {
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
      <KPIRow />
      <div style={{ flex: 1, display: 'flex', gap: 6, minHeight: 0 }}>
        {/* Left column */}
        <div style={{ width: 270, display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          <TopSalesChart />
          <ProfitHeatmap />
        </div>
        {/* Center column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          <SalesLineChart />
          <ProfitBarChart />
          <AvgCheckChart />
        </div>
        {/* Right column */}
        <div style={{ width: 380, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <RegionsTable />
        </div>
      </div>
    </div>
  );
};

const VisApiSheet: React.FC = () => {
  const s = useWidgetStyles();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { theme, palette, globalTokens, themeName, getExportTheme } = useThemeStore();
  const visApiUrl = (import.meta.env.VITE_VISAPI_IFRAME_URL as string | undefined) ?? '';

  useEffect(() => {
    if (!iframeRef.current?.contentWindow || !visApiUrl) return;
    iframeRef.current.contentWindow.postMessage(
      {
        type: 'VIS_THEME_UPDATE',
        source: 'fd-visiology-theme-generator',
        themeName,
        payload: getExportTheme(),
      },
      '*',
    );
  }, [theme, palette, globalTokens, themeName, getExportTheme, visApiUrl]);

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
        <div style={{ color: s.titleColor, fontFamily: s.titleFont, fontWeight: 700, fontSize: Math.min(s.titleSize * 0.65, 16) }}>
          Лист VisAPI
        </div>
        <div style={{ color: s.axisLabelColor, fontSize: 10, marginTop: 2 }}>
          Реальный лист через iframe-интеграцию с VisAPI (live синхронизация темы).
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
                '*',
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
          <div style={{ textAlign: 'center', maxWidth: 660, padding: 20 }}>
            <div style={{ fontSize: 44, marginBottom: 8, color: s.paletteColors[0] }}>◈</div>
            <div style={{ color: s.titleColor, fontFamily: s.titleFont, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              VisAPI iframe not configured
            </div>
            <div style={{ color: s.axisLabelColor, fontSize: 12, lineHeight: 1.7 }}>
              Задай URL в переменной окружения <b>VITE_VISAPI_IFRAME_URL</b>, чтобы подключить
              live-рендер Visiology на этом листе. После этого тема будет отправляться в iframe
              через <b>window.postMessage</b> с событием <b>VIS_THEME_UPDATE</b>.
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
