import React from 'react';
import { useThemeStore } from '../../store/themeStore';

const CELL_W = 280;
const CELL_H = 200;
const GAP = 12;

interface WidgetProps {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  type: string;
}

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

const WidgetStub: React.FC<WidgetProps> = ({ x, y, w, h, title, type }) => {
  const { theme, palette, showGrid, mode, globalTokens } = useThemeStore();
  const base = theme.WidgetStyles.$values[0];
  if (!base) return null;

  const paletteColors = palette.map((c) => c.value);

  const titleEnabled = base.Title?.Enabled ?? true;
  const titleColor = base.Title?.TextStyle?.Color ?? (mode === 'dark' ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)');
  const titleFont = base.Title?.TextStyle?.FontFamily ?? globalTokens.titleFontFamily;
  const titleSize = base.Title?.TextStyle?.FontSize ?? globalTokens.titleFontSize;
  const titleBold = base.Title?.TextStyle?.IsBold ?? true;
  const titleBgEnabled = base.Title?.Background?.Enabled ?? false;
  const titleBgColor = base.Title?.Background?.Color?.Color ?? 'rgba(255,255,255,0)';

  const bgEnabled = base.Background?.Enabled ?? false;
  const bgColor = base.Background?.Color?.Color ?? (mode === 'dark' ? 'rgba(30,30,46,0.95)' : 'rgba(255,255,255,0.95)');
  const frameEnabled = base.Frame?.Enabled ?? false;
  const frameColor = base.Frame?.Style?.Color ?? 'rgba(128,128,128,0.5)';
  const frameRadius = base.Frame?.Style?.Radius ?? globalTokens.borderRadius;
  const shadowX = base.BoxShadow?.X ?? 0;
  const shadowY = base.BoxShadow?.Y ?? 0;
  const shadowBlur = base.BoxShadow?.Blur ?? 0;
  const shadowColor = base.BoxShadow?.Color ?? 'rgba(0,0,0,0)';

  const titleH = titleEnabled ? 28 : 4;
  const chartArea = { x: 8, y: titleH + 4, w: w - 16, h: h - titleH - 12 };
  const filterId = `sh-${x}-${y}`;

  const chartWidget = theme.WidgetStyles.$values.find((ww) =>
    ww.Type === 'BarChart' || ww.Type === 'ColumnChart' || ww.Type === 'Chart'
  );
  const legendEnabled = chartWidget ? (getVal(chartWidget, 'Legend.Enabled', true) as boolean) : true;
  const legendColor = chartWidget ? (getVal(chartWidget, 'Legend.TextStyle.Color', 'rgb(108,117,125)') as string) : 'rgb(108,117,125)';
  const legendSize = chartWidget ? (getVal(chartWidget, 'Legend.TextStyle.FontSize', 10) as number) : 10;
  const axisLabelColor = chartWidget ? (getVal(chartWidget, 'YAxis.Labels.TextStyle.Color', 'rgb(108,117,125)') as string) : 'rgb(108,117,125)';
  const gridEnabled = chartWidget ? (getVal(chartWidget, 'YAxis.Grid.Enabled', true) as boolean) : true;

  const indicatorWidget = theme.WidgetStyles.$values.find((ww) => ww.Type === 'Indicator');
  const indValueColor = indicatorWidget ? (getVal(indicatorWidget, 'ValueSettings.TextStyle.Color', 'rgb(73,80,87)') as string) : 'rgb(73,80,87)';
  const indValueSize = indicatorWidget ? (getVal(indicatorWidget, 'ValueSettings.TextStyle.FontSize', 52) as number) : 52;
  const indPositiveColor = indicatorWidget ? (getVal(indicatorWidget, 'TrendSettings.PositiveTrendDetails.Color', 'rgb(29,167,80)') as string) : 'rgb(29,167,80)';

  const dgWidget = theme.WidgetStyles.$values.find((ww) => ww.Type === 'DataGrid');
  const dgHeaderBg = dgWidget ? (getVal(dgWidget, 'DataGridStyle.Header.Background', 'rgb(234,246,249)') as string) : 'rgb(234,246,249)';
  const dgHeaderColor = dgWidget ? (getVal(dgWidget, 'DataGridStyle.Header.TextStyle.Color', 'rgb(73,80,87)') as string) : 'rgb(73,80,87)';
  const dgBodyColor = dgWidget ? (getVal(dgWidget, 'DataGridStyle.Body.TextStyle.Color', 'rgb(73,80,87)') as string) : 'rgb(73,80,87)';

  const renderContent = () => {
    switch (type) {
      case 'bar': return renderBarChart(chartArea, paletteColors, axisLabelColor, gridEnabled, legendEnabled, legendColor, legendSize);
      case 'column': return renderColumnChart(chartArea, paletteColors, axisLabelColor, gridEnabled, legendEnabled, legendColor, legendSize);
      case 'line': return renderLineChart(chartArea, paletteColors, axisLabelColor, gridEnabled, legendEnabled, legendColor, legendSize);
      case 'pie': return renderPieChart(chartArea, paletteColors, legendEnabled, legendColor, legendSize);
      case 'gauge': return renderGauge(chartArea, paletteColors);
      case 'indicator': return renderIndicator(chartArea, indValueColor, indValueSize, indPositiveColor, titleFont);
      case 'table': return renderTable(chartArea, paletteColors, dgHeaderBg, dgHeaderColor, dgBodyColor);
      case 'filter': return renderFilter(chartArea, paletteColors);
      case 'text': return renderText(chartArea, titleColor);
      case 'olap': return renderOlapTable(chartArea, paletteColors);
      case 'dateFilter': return renderDateFilter(chartArea, paletteColors);
      case 'kpi': return renderKPI(chartArea, paletteColors, indValueColor, indPositiveColor, titleFont);
      default: return null;
    }
  };

  return (
    <g transform={`translate(${x}, ${y})`}>
      {shadowBlur > 0 && (
        <defs>
          <filter id={filterId}>
            <feDropShadow dx={shadowX} dy={shadowY} stdDeviation={shadowBlur / 2} floodColor={shadowColor} floodOpacity={0.3} />
          </filter>
        </defs>
      )}
      <rect
        width={w} height={h} rx={frameRadius} ry={frameRadius}
        fill={bgEnabled ? bgColor : (mode === 'dark' ? 'rgba(30,30,46,0.95)' : 'rgba(255,255,255,0.95)')}
        stroke={frameEnabled ? frameColor : 'rgba(0,0,0,0.06)'}
        strokeWidth={frameEnabled ? 1 : 0.5}
        filter={shadowBlur > 0 ? `url(#${filterId})` : undefined}
      />
      {showGrid && (
        <rect width={w} height={h} rx={frameRadius} fill="none" stroke="rgba(40,238,150,0.3)" strokeWidth={1} strokeDasharray="4 2" />
      )}
      {titleEnabled && (
        <>
          {titleBgEnabled && (
            <rect x={0} y={0} width={w} height={titleH} rx={frameRadius} fill={titleBgColor} />
          )}
          <text x={10} y={titleH - 8} fill={titleColor} fontSize={Math.min(titleSize * 0.6, 13)} fontFamily={titleFont} fontWeight={titleBold ? 700 : 400}>
            {title}
          </text>
        </>
      )}
      {renderContent()}
    </g>
  );
};

// ============ CHART RENDERERS ============

interface Area { x: number; y: number; w: number; h: number }

function renderBarChart(area: Area, palette: string[], axisColor: string, grid: boolean, legend: boolean, legendColor: string, legendSize: number) {
  const bars = [0.7, 0.9, 0.5, 0.8, 0.6];
  const barH = (area.h - (bars.length - 1) * 4 - (legend ? 16 : 0)) / bars.length;
  return (
    <g transform={`translate(${area.x}, ${area.y})`}>
      {grid && Array.from({ length: 5 }).map((_, i) => (
        <line key={i} x1={area.w * (i / 4)} y1={0} x2={area.w * (i / 4)} y2={area.h - (legend ? 16 : 0)} stroke="rgba(0,0,0,0.05)" />
      ))}
      {bars.map((val, i) => (
        <rect key={i} x={0} y={i * (barH + 4)} width={area.w * val} height={barH} rx={2} fill={palette[i % palette.length]} opacity={0.85} />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <text key={`l${i}`} x={area.w * (i / 4)} y={area.h - (legend ? 20 : 4)} fontSize={8} fill={axisColor} textAnchor="middle">{i * 25}%</text>
      ))}
      {legend && (
        <text x={area.w / 2} y={area.h - 2} fontSize={Math.min(legendSize, 9)} fill={legendColor} textAnchor="middle">● Series A  ● Series B</text>
      )}
    </g>
  );
}

function renderColumnChart(area: Area, palette: string[], axisColor: string, grid: boolean, legend: boolean, legendColor: string, legendSize: number) {
  const cols = [0.6, 0.85, 0.4, 0.7, 0.55, 0.9];
  const colW = (area.w - (cols.length - 1) * 6) / cols.length;
  const chartH = area.h - (legend ? 16 : 0);
  return (
    <g transform={`translate(${area.x}, ${area.y})`}>
      {grid && Array.from({ length: 5 }).map((_, i) => (
        <line key={i} x1={0} y1={chartH * (i / 4)} x2={area.w} y2={chartH * (i / 4)} stroke="rgba(0,0,0,0.05)" />
      ))}
      {cols.map((val, i) => {
        const h = chartH * val;
        return <rect key={i} x={i * (colW + 6)} y={chartH - h} width={colW} height={h} rx={2} fill={palette[i % palette.length]} opacity={0.85} />;
      })}
      {cols.map((_, i) => (
        <text key={`x${i}`} x={i * (colW + 6) + colW / 2} y={chartH + 10} fontSize={8} fill={axisColor} textAnchor="middle">Q{i + 1}</text>
      ))}
      {legend && (
        <text x={area.w / 2} y={area.h - 2} fontSize={Math.min(legendSize, 9)} fill={legendColor} textAnchor="middle">● Revenue  ● Costs</text>
      )}
    </g>
  );
}

function renderLineChart(area: Area, palette: string[], axisColor: string, grid: boolean, legend: boolean, legendColor: string, legendSize: number) {
  const pts1 = [0.3, 0.6, 0.4, 0.8, 0.65, 0.9];
  const pts2 = [0.5, 0.3, 0.55, 0.4, 0.7, 0.6];
  const chartH = area.h - (legend ? 16 : 0);
  const dx = area.w / (pts1.length - 1);
  const toPath = (pts: number[]) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * dx} ${chartH * (1 - p)}`).join(' ');

  return (
    <g transform={`translate(${area.x}, ${area.y})`}>
      {grid && Array.from({ length: 5 }).map((_, i) => (
        <line key={i} x1={0} y1={chartH * (i / 4)} x2={area.w} y2={chartH * (i / 4)} stroke="rgba(0,0,0,0.05)" />
      ))}
      <path d={toPath(pts1)} fill="none" stroke={palette[0]} strokeWidth={2.5} opacity={0.85} />
      <path d={toPath(pts2)} fill="none" stroke={palette[1] ?? palette[0]} strokeWidth={2.5} opacity={0.85} />
      {pts1.map((p, i) => <circle key={i} cx={i * dx} cy={chartH * (1 - p)} r={3} fill={palette[0]} />)}
      {legend && (
        <text x={area.w / 2} y={area.h - 2} fontSize={Math.min(legendSize, 9)} fill={legendColor} textAnchor="middle">● Actual  ● Forecast</text>
      )}
    </g>
  );
}

function renderPieChart(area: Area, palette: string[], legend: boolean, legendColor: string, legendSize: number) {
  const values = [35, 25, 20, 12, 8];
  const total = values.reduce((a, b) => a + b, 0);
  const cx = area.w / 2;
  const cy = (area.h - (legend ? 16 : 0)) / 2;
  const r = Math.min(cx, cy) - 4;
  let startAngle = -Math.PI / 2;

  return (
    <g transform={`translate(${area.x}, ${area.y})`}>
      {values.map((val, i) => {
        const angle = (val / total) * Math.PI * 2;
        const endAngle = startAngle + angle;
        const la = angle > Math.PI ? 1 : 0;
        const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
        const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2} Z`;
        startAngle = endAngle;
        return <path key={i} d={d} fill={palette[i % palette.length]} opacity={0.85} />;
      })}
      <circle cx={cx} cy={cy} r={r * 0.35} fill="white" opacity={0.9} />
      {legend && (
        <text x={area.w / 2} y={area.h - 2} fontSize={Math.min(legendSize, 9)} fill={legendColor} textAnchor="middle">● A ● B ● C ● D ● E</text>
      )}
    </g>
  );
}

function renderGauge(area: Area, palette: string[]) {
  const cx = area.w / 2, cy = area.h * 0.7, r = Math.min(cx, cy) - 8;
  const arc = (startDeg: number, endDeg: number) => {
    const s = (startDeg * Math.PI) / 180, e = (endDeg * Math.PI) / 180;
    const la = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${cx + r * Math.cos(s)} ${cy + r * Math.sin(s)} A ${r} ${r} 0 ${la} 1 ${cx + r * Math.cos(e)} ${cy + r * Math.sin(e)}`;
  };
  return (
    <g transform={`translate(${area.x}, ${area.y})`}>
      <path d={arc(180, 360)} fill="none" stroke="#E0E0E0" strokeWidth={12} strokeLinecap="round" />
      <path d={arc(180, 180 + 180 * 0.72)} fill="none" stroke={palette[0]} strokeWidth={12} strokeLinecap="round" opacity={0.85} />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={18} fontWeight={700} fill={palette[0]}>72%</text>
    </g>
  );
}

function renderIndicator(area: Area, valueColor: string, valueSize: number, positiveColor: string, font: string) {
  const sz = Math.min(valueSize * 0.5, 28);
  return (
    <g transform={`translate(${area.x}, ${area.y})`}>
      <text x={area.w / 2} y={area.h * 0.4} textAnchor="middle" fontSize={sz} fontWeight={700} fill={valueColor} fontFamily={font}>1,234</text>
      <g transform={`translate(${area.w / 2 - 22}, ${area.h * 0.55})`}>
        <polygon points="6,0 12,10 0,10" fill={positiveColor} />
        <text x={18} y={9} fontSize={10} fill={positiveColor} fontFamily={font}>+12.5%</text>
      </g>
      <text x={area.w / 2} y={area.h * 0.82} textAnchor="middle" fontSize={9} fill="rgb(108,117,125)" fontFamily={font}>Цель: 1,500</text>
    </g>
  );
}

function renderKPI(area: Area, palette: string[], valueColor: string, positiveColor: string, font: string) {
  const sz = Math.min(22, area.h * 0.18);
  return (
    <g transform={`translate(${area.x}, ${area.y})`}>
      <text x={area.w / 2} y={area.h * 0.4} textAnchor="middle" fontSize={sz} fontWeight={700} fill={valueColor} fontFamily={font}>
        {(Math.random() * 10000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      </text>
      <g transform={`translate(${area.w / 2 - 18}, ${area.h * 0.58})`}>
        <polygon points="5,0 10,8 0,8" fill={positiveColor} />
        <text x={14} y={7} fontSize={9} fill={positiveColor} fontFamily={font}>+{(Math.random() * 20).toFixed(1)}%</text>
      </g>
    </g>
  );
}

function renderTable(area: Area, palette: string[], headerBg: string, headerColor: string, bodyColor: string) {
  const rows = 5, cols = 3;
  const rowH = area.h / (rows + 1);
  const colW = area.w / cols;
  return (
    <g transform={`translate(${area.x}, ${area.y})`}>
      <rect x={0} y={0} width={area.w} height={rowH} fill={headerBg} rx={2} />
      {Array.from({ length: cols }).map((_, c) => (
        <text key={`h${c}`} x={c * colW + colW / 2} y={rowH - 5} textAnchor="middle" fontSize={9} fill={headerColor} fontWeight={600}>Col {c + 1}</text>
      ))}
      {Array.from({ length: rows }).map((_, r) => (
        <g key={r}>
          {r % 2 === 0 && <rect x={0} y={(r + 1) * rowH} width={area.w} height={rowH} fill="rgba(0,0,0,0.02)" />}
          <line x1={0} y1={(r + 1) * rowH} x2={area.w} y2={(r + 1) * rowH} stroke="rgba(0,0,0,0.06)" />
          {Array.from({ length: cols }).map((_, c) => (
            <text key={`${r}-${c}`} x={c * colW + colW / 2} y={(r + 1) * rowH + rowH - 5} textAnchor="middle" fontSize={9} fill={bodyColor}>{(r * cols + c + 1) * 42}</text>
          ))}
        </g>
      ))}
    </g>
  );
}

function renderOlapTable(area: Area, palette: string[]) {
  const rows = 4, cols = 4;
  const rowH = area.h / (rows + 1), colW = area.w / cols;
  return (
    <g transform={`translate(${area.x}, ${area.y})`}>
      <rect width={area.w} height={rowH} fill={palette[0]} opacity={0.15} rx={2} />
      <rect width={colW} height={area.h} fill={palette[0]} opacity={0.08} />
      {Array.from({ length: rows + 1 }).map((_, r) => (
        <line key={r} x1={0} y1={r * rowH} x2={area.w} y2={r * rowH} stroke="rgba(0,0,0,0.08)" />
      ))}
      {Array.from({ length: cols }).map((_, c) => (
        <line key={c} x1={c * colW} y1={0} x2={c * colW} y2={area.h} stroke="rgba(0,0,0,0.08)" />
      ))}
      <text x={colW / 2} y={rowH - 5} textAnchor="middle" fontSize={8} fontWeight={600} fill="rgb(73,80,87)">Dim</text>
      {['Jan', 'Feb', 'Mar'].map((m, i) => (
        <text key={m} x={(i + 1) * colW + colW / 2} y={rowH - 5} textAnchor="middle" fontSize={8} fontWeight={600} fill="rgb(73,80,87)">{m}</text>
      ))}
    </g>
  );
}

function renderFilter(area: Area, palette: string[]) {
  const items = ['Регион А', 'Регион Б', 'Регион В', 'Регион Г'];
  const itemH = 22;
  return (
    <g transform={`translate(${area.x}, ${area.y})`}>
      <rect width={area.w} height={22} rx={4} fill="rgba(0,0,0,0.04)" stroke="rgba(0,0,0,0.1)" strokeWidth={0.5} />
      <text x={8} y={15} fontSize={9} fill="rgb(180,180,180)">Поиск...</text>
      {items.map((item, i) => (
        <g key={i} transform={`translate(0, ${26 + i * itemH})`}>
          <rect x={4} y={2} width={12} height={12} rx={2} fill={i < 2 ? palette[0] : 'none'} stroke={palette[0]} strokeWidth={1} opacity={0.7} />
          {i < 2 && <polyline points="6,8 9,11 14,5" fill="none" stroke="white" strokeWidth={1.5} />}
          <text x={22} y={12} fontSize={9} fill="rgb(73,80,87)">{item}</text>
        </g>
      ))}
    </g>
  );
}

function renderDateFilter(area: Area, palette: string[]) {
  return (
    <g transform={`translate(${area.x}, ${area.y})`}>
      <rect width={area.w} height={28} rx={4} fill="rgba(0,0,0,0.04)" stroke="rgba(0,0,0,0.1)" strokeWidth={0.5} />
      <text x={10} y={18} fontSize={10} fill="rgb(73,80,87)">01.01.2024 — 31.12.2024</text>
      <rect x={area.w - 28} y={4} width={20} height={20} rx={3} fill={palette[0]} opacity={0.2} />
      <text x={area.w - 18} y={18} textAnchor="middle" fontSize={10} fill={palette[0]}>▼</text>
    </g>
  );
}

function renderText(area: Area, color: string) {
  return (
    <g transform={`translate(${area.x}, ${area.y})`}>
      <text x={area.w / 2} y={area.h / 2 - 8} textAnchor="middle" fontSize={14} fontWeight={600} fill={color}>Текстовый блок</text>
      <text x={area.w / 2} y={area.h / 2 + 12} textAnchor="middle" fontSize={10} fill="rgb(108,117,125)">Произвольный контент</text>
    </g>
  );
}

// ============ SHEET LAYOUTS ============

type WidgetDef = { col: number; row: number; colSpan: number; rowSpan: number; title: string; type: string };

const SHEET_1: WidgetDef[] = [
  { col: 0, row: 0, colSpan: 1, rowSpan: 1, title: 'KPI Revenue', type: 'kpi' },
  { col: 1, row: 0, colSpan: 1, rowSpan: 1, title: 'KPI Profit', type: 'kpi' },
  { col: 2, row: 0, colSpan: 1, rowSpan: 1, title: 'KPI Growth', type: 'kpi' },
  { col: 3, row: 0, colSpan: 1, rowSpan: 1, title: 'KPI Users', type: 'kpi' },
  { col: 0, row: 1, colSpan: 2, rowSpan: 1, title: 'Column Chart', type: 'column' },
  { col: 2, row: 1, colSpan: 2, rowSpan: 1, title: 'Line Chart', type: 'line' },
];

const SHEET_2: WidgetDef[] = [
  { col: 0, row: 0, colSpan: 2, rowSpan: 1, title: 'Pie Chart', type: 'pie' },
  { col: 2, row: 0, colSpan: 2, rowSpan: 1, title: 'Bar Chart', type: 'bar' },
  { col: 0, row: 1, colSpan: 3, rowSpan: 1, title: 'Data Grid', type: 'table' },
  { col: 3, row: 1, colSpan: 1, rowSpan: 1, title: 'Gauge', type: 'gauge' },
];

const SHEET_3: WidgetDef[] = [
  { col: 0, row: 0, colSpan: 3, rowSpan: 1, title: 'OLAP Table', type: 'olap' },
  { col: 3, row: 0, colSpan: 1, rowSpan: 1, title: 'Indicator', type: 'indicator' },
  { col: 0, row: 1, colSpan: 1, rowSpan: 1, title: 'Filter', type: 'filter' },
  { col: 1, row: 1, colSpan: 1, rowSpan: 1, title: 'Date Filter', type: 'dateFilter' },
  { col: 2, row: 1, colSpan: 2, rowSpan: 1, title: 'Text Widget', type: 'text' },
];

const SHEETS = { 1: SHEET_1, 2: SHEET_2, 3: SHEET_3 };

export const DashboardPreview: React.FC = () => {
  const { activeSheet } = useThemeStore();
  const layout = SHEETS[activeSheet];
  const COLS = 4;
  const totalW = COLS * CELL_W + (COLS - 1) * GAP;
  const maxRow = Math.max(...layout.map((w) => w.row)) + 1;
  const totalH = maxRow * CELL_H + (maxRow - 1) * GAP;

  return (
    <svg
      width={totalW + 24}
      height={totalH + 24}
      viewBox={`0 0 ${totalW + 24} ${totalH + 24}`}
      style={{ borderRadius: 8 }}
    >
      {layout.map((item, i) => {
        const wx = 12 + item.col * (CELL_W + GAP);
        const wy = 12 + item.row * (CELL_H + GAP);
        const ww = item.colSpan * CELL_W + (item.colSpan - 1) * GAP;
        const wh = item.rowSpan * CELL_H + (item.rowSpan - 1) * GAP;
        return <WidgetStub key={i} x={wx} y={wy} w={ww} h={wh} title={item.title} type={item.type} />;
      })}
    </svg>
  );
};
