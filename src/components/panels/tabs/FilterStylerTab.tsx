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

export const FilterStylerTab: React.FC = () => {
  const { theme, updateWidgetBase } = useThemeStore();
  const filterWidget = theme.WidgetStyles.$values.find((w) => w.Type === 'Filter') as Record<string, unknown> | undefined;

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
      <div
        className="detail-section"
        style={{ minWidth: 240, justifyContent: 'center', alignItems: 'center', background: 'rgba(255,200,50,0.05)', borderColor: 'rgba(255,200,50,0.2)' }}
      >
        <div style={{ fontSize: 9, color: 'rgba(255,200,50,0.7)', textAlign: 'center', padding: '4px 0', lineHeight: 1.5 }}>
          ⚠ Настройки фильтра сохраняются<br />в экспортируемый JSON,<br />но не отображаются в превью.
        </div>
      </div>
      <div className="detail-section">
        <div className="detail-section__title">Filter</div>
        <div className="detail-row">
          <span className="detail-label">Body background</span>
          <ColorPicker
            value={getVal(filterWidget, 'BodyBackgroundColor', 'rgba(255,255,255,1)') as string}
            onChange={(v) => updateWidgetBase('BodyBackgroundColor', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Text color</span>
          <ColorPicker
            value={getVal(filterWidget, 'FilterTextStyle.Color', 'rgb(73,80,87)') as string}
            onChange={(v) => updateWidgetBase('FilterTextStyle.Color', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Font size</span>
          <input
            type="range" className="detail-slider" min={10} max={18}
            value={getVal(filterWidget, 'FilterTextStyle.FontSize', 14) as number}
            onChange={(e) => updateWidgetBase('FilterTextStyle.FontSize', Number(e.target.value))}
            style={{ width: '120px' }}
          />
          <span className="control-value">{getVal(filterWidget, 'FilterTextStyle.FontSize', 14) as number}px</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Reset selection</span>
          <Toggle
            value={getVal(filterWidget, 'ResetSelectedValuesAllowed', true) as boolean}
            onChange={(v) => updateWidgetBase('ResetSelectedValuesAllowed', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Show search</span>
          <Toggle
            value={getVal(filterWidget, 'SearchEnabled', true) as boolean}
            onChange={(v) => updateWidgetBase('SearchEnabled', v)}
          />
        </div>
      </div>
    </>
  );
};
