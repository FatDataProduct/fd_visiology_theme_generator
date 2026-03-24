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

export const IndicatorStylerTab: React.FC = () => {
  const { theme, updateWidgetBase } = useThemeStore();
  const indWidget = theme.WidgetStyles.$values.find((w) => w.Type === 'Indicator') as Record<string, unknown> | undefined;

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

  const valueSettings = indWidget?.ValueSettings as Record<string, unknown> | undefined;
  const trendSettings = indWidget?.TrendSettings as Record<string, unknown> | undefined;
  const targetSettings = indWidget?.TargetSettings as Record<string, unknown> | undefined;

  return (
    <>
      <div className="detail-section">
        <div className="detail-section__title">Main Value</div>
        <div className="detail-row">
          <span className="detail-label">Color</span>
          <ColorPicker
            value={getVal(valueSettings, 'TextStyle.Color', 'rgb(73,80,87)') as string}
            onChange={(v) => updateWidgetBase('ValueSettings.TextStyle.Color', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Font size</span>
          <input
            type="range" className="detail-slider" min={16} max={80}
            value={getVal(valueSettings, 'TextStyle.FontSize', 52) as number}
            onChange={(e) => updateWidgetBase('ValueSettings.TextStyle.FontSize', Number(e.target.value))}
            style={{ width: '120px' }}
          />
          <span className="control-value">{getVal(valueSettings, 'TextStyle.FontSize', 52) as number}px</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Bold</span>
          <Toggle
            value={getVal(valueSettings, 'TextStyle.IsBold', false) as boolean}
            onChange={(v) => updateWidgetBase('ValueSettings.TextStyle.IsBold', v)}
          />
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section__title">Trends</div>
        <div className="detail-row">
          <span className="detail-label">Positive trend</span>
          <ColorPicker
            value={getVal(trendSettings, 'PositiveTrendDetails.Color', 'rgb(29, 167, 80)') as string}
            onChange={(v) => updateWidgetBase('TrendSettings.PositiveTrendDetails.Color', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Neutral trend</span>
          <ColorPicker
            value={getVal(trendSettings, 'NeutralTrendDetails.Color', 'rgb(199, 152, 7)') as string}
            onChange={(v) => updateWidgetBase('TrendSettings.NeutralTrendDetails.Color', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Negative trend</span>
          <ColorPicker
            value={getVal(trendSettings, 'NegativeTrendDetails.Color', 'rgb(217, 52, 43)') as string}
            onChange={(v) => updateWidgetBase('TrendSettings.NegativeTrendDetails.Color', v)}
          />
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section__title">Target</div>
        <div className="detail-row">
          <span className="detail-label">Enabled</span>
          <Toggle
            value={getVal(targetSettings, 'Enabled', true) as boolean}
            onChange={(v) => updateWidgetBase('TargetSettings.Enabled', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Target value color</span>
          <ColorPicker
            value={getVal(targetSettings, 'TargetValueDetails.TextStyle.Color', 'rgb(108, 117, 125)') as string}
            onChange={(v) => updateWidgetBase('TargetSettings.TargetValueDetails.TextStyle.Color', v)}
          />
        </div>
        <div className="detail-row">
          <span className="detail-label">Distance color</span>
          <ColorPicker
            value={getVal(targetSettings, 'TargetDistanceDetails.TextStyle.Color', 'rgb(108, 117, 125)') as string}
            onChange={(v) => updateWidgetBase('TargetSettings.TargetDistanceDetails.TextStyle.Color', v)}
          />
        </div>
      </div>
    </>
  );
};
