import React from 'react';
import { useThemeStore } from '../../../store/themeStore';
import { rgbaToHex, hexToRgba } from '../../../lib/paletteGen';

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <div className={`detail-toggle ${value ? 'detail-toggle--on' : ''}`} onClick={() => onChange(!value)}>
    <div className="detail-toggle__thumb" />
  </div>
);

const ColorPicker: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const hex = rgbaToHex(value);
  return (
    <div className="detail-color-swatch" style={{ backgroundColor: value }}>
      <input type="color" value={hex} onChange={(e) => onChange(hexToRgba(e.target.value))} />
    </div>
  );
};

export const ChartStylerTab: React.FC = () => {
  const { theme, updateWidgetBase } = useThemeStore();
  const chartWidget = theme.WidgetStyles.$values.find(
    (w) => w.Type === 'BarChart' || w.Type === 'ColumnChart'
  );

  if (!chartWidget) return <div style={{ padding: 16, color: '#999' }}>No chart widget found</div>;

  const yAxis = (chartWidget as Record<string, unknown>).YAxis as Record<string, unknown> | undefined;
  const xAxis = (chartWidget as Record<string, unknown>).XAxis as Record<string, unknown> | undefined;
  const legend = (chartWidget as Record<string, unknown>).Legend as Record<string, unknown> | undefined;
  const dataLabels = (chartWidget as Record<string, unknown>).DataLabels as Record<string, unknown> | undefined;
  const tooltip = (chartWidget as Record<string, unknown>).Tooltip as Record<string, unknown> | undefined;
  const column = (chartWidget as Record<string, unknown>).Column as Record<string, unknown> | undefined;

  const getVal = (obj: Record<string, unknown> | undefined, path: string, def: unknown = '') => {
    if (!obj) return def;
    const keys = path.split('.');
    let cur: unknown = obj;
    for (const k of keys) {
      if (cur == null || typeof cur !== 'object') return def;
      cur = (cur as Record<string, unknown>)[k];
    }
    return cur ?? def;
  };

  return (
    <>
      <div className="detail-section">
        <div className="detail-section__title">Y Axis</div>
        <div className="detail-row">
          <span className="detail-label">Enabled</span>
          <Toggle
            value={getVal(yAxis, 'Enabled', true) as boolean}
            onChange={(v) => updateWidgetBase('YAxis.Enabled', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Show line</span>
          <Toggle
            value={getVal(yAxis, 'LineEnabled', true) as boolean}
            onChange={(v) => updateWidgetBase('YAxis.LineEnabled', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Label color</span>
          <ColorPicker
            value={getVal(yAxis, 'Labels.TextStyle.Color', 'rgb(108,117,125)') as string}
            onChange={(v) => updateWidgetBase('YAxis.Labels.TextStyle.Color', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Label size</span>
          <input
            type="range" className="detail-slider" min={8} max={18}
            value={getVal(yAxis, 'Labels.TextStyle.FontSize', 12) as number}
            onChange={(e) => updateWidgetBase('YAxis.Labels.TextStyle.FontSize', Number(e.target.value))}
            style={{ width: '120px' }}
          />
          <span className="control-value">{getVal(yAxis, 'Labels.TextStyle.FontSize', 12) as number}px</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Grid</span>
          <Toggle
            value={getVal(yAxis, 'Grid.Enabled', true) as boolean}
            onChange={(v) => updateWidgetBase('YAxis.Grid.Enabled', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Zoom slider</span>
          <Toggle
            value={getVal(yAxis, 'ZoomEnabled', false) as boolean}
            onChange={(v) => updateWidgetBase('YAxis.ZoomEnabled', v)}
          />
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section__title">X Axis</div>
        <div className="detail-row">
          <span className="detail-label">Show line</span>
          <Toggle
            value={getVal(xAxis, 'LineEnabled', true) as boolean}
            onChange={(v) => updateWidgetBase('XAxis.LineEnabled', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Label color</span>
          <ColorPicker
            value={getVal(xAxis, 'Labels.TextStyle.Color', 'rgb(108,117,125)') as string}
            onChange={(v) => updateWidgetBase('XAxis.Labels.TextStyle.Color', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Label size</span>
          <input
            type="range" className="detail-slider" min={8} max={18}
            value={getVal(xAxis, 'Labels.TextStyle.FontSize', 12) as number}
            onChange={(e) => updateWidgetBase('XAxis.Labels.TextStyle.FontSize', Number(e.target.value))}
            style={{ width: '120px' }}
          />
          <span className="control-value">{getVal(xAxis, 'Labels.TextStyle.FontSize', 12) as number}px</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Rotation</span>
          <div className="align-buttons">
            {[0, 45, 90].map((angle) => (
              <button
                key={angle}
                className={`align-btn ${(getVal(xAxis, 'Labels.RotationAngle', 0) as number) === angle ? 'align-btn--active' : ''}`}
                onClick={() => updateWidgetBase('XAxis.Labels.RotationAngle', angle)}
              >
                {angle}°
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section__title">Legend</div>
        <div className="detail-row">
          <span className="detail-label">Enabled</span>
          <Toggle
            value={getVal(legend, 'Enabled', true) as boolean}
            onChange={(v) => updateWidgetBase('Legend.Enabled', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Text color</span>
          <ColorPicker
            value={getVal(legend, 'TextStyle.Color', 'rgb(108,117,125)') as string}
            onChange={(v) => updateWidgetBase('Legend.TextStyle.Color', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Font size</span>
          <input
            type="range" className="detail-slider" min={8} max={18}
            value={getVal(legend, 'TextStyle.FontSize', 12) as number}
            onChange={(e) => updateWidgetBase('Legend.TextStyle.FontSize', Number(e.target.value))}
            style={{ width: '120px' }}
          />
          <span className="control-value">{getVal(legend, 'TextStyle.FontSize', 12) as number}px</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Position</span>
          <div className="align-buttons">
            {[{ v: 0, l: 'Top' }, { v: 2, l: 'Bottom' }, { v: 1, l: 'Left' }, { v: 3, l: 'Right' }].map((p) => (
              <button
                key={p.v}
                className={`align-btn ${(getVal(legend, 'VerticalAlign', 2) as number) === p.v ? 'align-btn--active' : ''}`}
                onClick={() => updateWidgetBase('Legend.VerticalAlign', p.v)}
              >
                {p.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section__title">Data Labels</div>
        <div className="detail-row">
          <span className="detail-label">Enabled</span>
          <Toggle
            value={getVal(dataLabels, 'Enabled', false) as boolean}
            onChange={(v) => updateWidgetBase('DataLabels.Enabled', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Color</span>
          <ColorPicker
            value={getVal(dataLabels, 'TextStyle.Color', 'rgb(73,80,87)') as string}
            onChange={(v) => updateWidgetBase('DataLabels.TextStyle.Color', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Allow overlap</span>
          <Toggle
            value={getVal(dataLabels, 'AllowOverlap', false) as boolean}
            onChange={(v) => updateWidgetBase('DataLabels.AllowOverlap', v)}
          />
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section__title">Tooltip</div>
        <div className="detail-row">
          <span className="detail-label">Text color</span>
          <ColorPicker
            value={getVal(tooltip, 'TextStyle.Color', 'rgb(73,80,87)') as string}
            onChange={(v) => updateWidgetBase('Tooltip.TextStyle.Color', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Show header</span>
          <Toggle
            value={getVal(tooltip, 'HeaderEnabled', true) as boolean}
            onChange={(v) => updateWidgetBase('Tooltip.HeaderEnabled', v)}
          />
        </div>
      </div>

      {column && (
        <div className="detail-section">
          <div className="detail-section__title">Column / Bar</div>
          <div className="detail-row">
            <span className="detail-label">Width</span>
            <input
              type="range" className="detail-slider" min={5} max={80}
              value={getVal(column, 'Width', 20) as number}
              onChange={(e) => updateWidgetBase('Column.Width', Number(e.target.value))}
              style={{ width: '120px' }}
            />
            <span className="control-value">{getVal(column, 'Width', 20) as number}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Padding</span>
            <input
              type="range" className="detail-slider" min={0} max={30}
              value={getVal(column, 'Padding', 10) as number}
              onChange={(e) => updateWidgetBase('Column.Padding', Number(e.target.value))}
              style={{ width: '120px' }}
            />
            <span className="control-value">{getVal(column, 'Padding', 10) as number}</span>
          </div>
        </div>
      )}
    </>
  );
};
