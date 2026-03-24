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

export const TableStylerTab: React.FC = () => {
  const { theme, updateWidgetBase } = useThemeStore();

  const dgWidget = theme.WidgetStyles.$values.find((w) => w.Type === 'DataGrid') as Record<string, unknown> | undefined;
  const dgStyle = dgWidget?.DataGridStyle as Record<string, unknown> | undefined;

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
        <div className="detail-section__title">DataGrid — Header</div>
        <div className="detail-row">
          <span className="detail-label">Background</span>
          <ColorPicker
            value={getVal(dgStyle, 'Header.Background', 'rgb(234,246,249)') as string}
            onChange={(v) => updateWidgetBase('DataGridStyle.Header.Background', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Text color</span>
          <ColorPicker
            value={getVal(dgStyle, 'Header.TextStyle.Color', 'rgb(73,80,87)') as string}
            onChange={(v) => updateWidgetBase('DataGridStyle.Header.TextStyle.Color', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Font size</span>
          <input
            type="range" className="detail-slider" min={10} max={20}
            value={getVal(dgStyle, 'Header.TextStyle.FontSize', 15) as number}
            onChange={(e) => updateWidgetBase('DataGridStyle.Header.TextStyle.FontSize', Number(e.target.value))}
            style={{ width: '120px' }}
          />
          <span className="control-value">{getVal(dgStyle, 'Header.TextStyle.FontSize', 15) as number}px</span>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section__title">DataGrid — Body</div>
        <div className="detail-row">
          <span className="detail-label">Text color</span>
          <ColorPicker
            value={getVal(dgStyle, 'Body.TextStyle.Color', 'rgb(73,80,87)') as string}
            onChange={(v) => updateWidgetBase('DataGridStyle.Body.TextStyle.Color', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Font size</span>
          <input
            type="range" className="detail-slider" min={10} max={20}
            value={getVal(dgStyle, 'Body.TextStyle.FontSize', 15) as number}
            onChange={(e) => updateWidgetBase('DataGridStyle.Body.TextStyle.FontSize', Number(e.target.value))}
            style={{ width: '120px' }}
          />
          <span className="control-value">{getVal(dgStyle, 'Body.TextStyle.FontSize', 15) as number}px</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Row alternation</span>
          <Toggle
            value={getVal(dgStyle, 'Body.RowAlternationEnabled', false) as boolean}
            onChange={(v) => updateWidgetBase('DataGridStyle.Body.RowAlternationEnabled', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Alt row color</span>
          <ColorPicker
            value={getVal(dgStyle, 'Body.RowAlternationColor', 'rgb(234,246,249)') as string}
            onChange={(v) => updateWidgetBase('DataGridStyle.Body.RowAlternationColor', v)}
          />
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section__title">DataGrid — Borders</div>
        <div className="detail-row">
          <span className="detail-label">Outer border</span>
          <ColorPicker
            value={getVal(dgStyle, 'OuterBorder.Color.Color', 'rgba(101,210,228,0.5)') as string}
            onChange={(v) => updateWidgetBase('DataGridStyle.OuterBorder.Color.Color', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Horiz. border</span>
          <ColorPicker
            value={getVal(dgStyle, 'InnerHorizontalBorder.Color.Color', 'rgb(195,237,245)') as string}
            onChange={(v) => updateWidgetBase('DataGridStyle.InnerHorizontalBorder.Color.Color', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Vert. border</span>
          <ColorPicker
            value={getVal(dgStyle, 'InnerVerticalBorder.Color.Color', 'rgb(195,237,245)') as string}
            onChange={(v) => updateWidgetBase('DataGridStyle.InnerVerticalBorder.Color.Color', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Export enabled</span>
          <Toggle
            value={getVal(dgStyle, 'ExportEnabled', false) as boolean}
            onChange={(v) => updateWidgetBase('DataGridStyle.ExportEnabled', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Export icon color</span>
          <ColorPicker
            value={getVal(dgStyle, 'ExportIconColor', 'rgba(51,51,51,1)') as string}
            onChange={(v) => updateWidgetBase('DataGridStyle.ExportIconColor', v)}
          />
        </div>
      </div>
    </>
  );
};
