import React from 'react';
import { useThemeStore } from '../../../store/themeStore';
import { rgbaToHex, hexToRgba } from '../../../lib/paletteGen';

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <div
    className={`detail-toggle ${value ? 'detail-toggle--on' : ''}`}
    onClick={() => onChange(!value)}
  >
    <div className="detail-toggle__thumb" />
  </div>
);

const ColorPicker: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const hex = rgbaToHex(value);
  return (
    <div className="detail-color-swatch" style={{ backgroundColor: value }}>
      <input
        type="color"
        value={hex}
        onChange={(e) => onChange(hexToRgba(e.target.value))}
      />
    </div>
  );
};

export const WidgetShellTab: React.FC = () => {
  const { theme, updateWidgetBase, globalTokens, setGlobalTokens } = useThemeStore();

  const base = theme.WidgetStyles.$values[0];
  if (!base) return null;

  const titleEnabled = base.Title?.Enabled ?? true;
  const titleColor = base.Title?.TextStyle?.Color ?? 'rgba(0,0,0,1)';
  const titleFont = base.Title?.TextStyle?.FontFamily ?? 'Arial';
  const titleSize = base.Title?.TextStyle?.FontSize ?? 21;
  const titleBold = base.Title?.TextStyle?.IsBold ?? true;
  const titleItalic = base.Title?.TextStyle?.IsItalic ?? false;
  const titleAlign = base.Title?.TextStyle?.Align ?? 1;
  const titleBgEnabled = base.Title?.Background?.Enabled ?? false;
  const titleBgColor = base.Title?.Background?.Color?.Color ?? 'rgba(255,255,255,0)';
  const titleHeight = base.Title?.Size?.Height ?? 50;

  const frameEnabled = base.Frame?.Enabled ?? false;
  const frameColor = base.Frame?.Style?.Color ?? 'rgba(128,128,128,0.5)';
  const frameRadius = base.Frame?.Style?.Radius ?? 3;

  const bgEnabled = base.Background?.Enabled ?? false;
  const bgColor = base.Background?.Color?.Color ?? 'rgba(255,255,255,0)';

  const shadowColor = base.BoxShadow?.Color ?? 'rgba(0,0,0,0)';
  const shadowX = base.BoxShadow?.X ?? 0;
  const shadowY = base.BoxShadow?.Y ?? 0;
  const shadowBlur = base.BoxShadow?.Blur ?? 0;
  const shadowSpread = base.BoxShadow?.Spread ?? 0;

  const fonts = ['Arial', 'Open Sans', 'Roboto', 'Inter', 'Segoe UI', 'Helvetica'];

  return (
    <>
      {/* Title section */}
      <div className="detail-section">
        <div className="detail-section__title">Title</div>

        <div className="detail-row">
          <span className="detail-label">Show title</span>
          <Toggle value={titleEnabled} onChange={(v) => updateWidgetBase('Title.Enabled', v)} />
        </div>

        <div className="detail-row">
          <span className="detail-label">Text color</span>
          <ColorPicker
            value={titleColor}
            onChange={(v) => updateWidgetBase('Title.TextStyle.Color', v)}
          />
        </div>

        <div className="detail-row">
          <span className="detail-label">Font</span>
          <select
            className="control-select"
            value={globalTokens.titleFontFamily}
            onChange={(e) => setGlobalTokens({ titleFontFamily: e.target.value })}
          >
            {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div className="detail-row">
          <span className="detail-label">Size</span>
          <input
            type="range"
            className="detail-slider"
            min={12}
            max={32}
            value={globalTokens.titleFontSize}
            onChange={(e) => setGlobalTokens({ titleFontSize: Number(e.target.value) })}
            style={{ width: '120px' }}
          />
          <span className="control-value">{globalTokens.titleFontSize}px</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Style</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className={`align-btn ${titleBold ? 'align-btn--active' : ''}`}
              onClick={() => updateWidgetBase('Title.TextStyle.IsBold', !titleBold)}
              style={{ fontWeight: 700 }}
            >
              B
            </button>
            <button
              className={`align-btn ${titleItalic ? 'align-btn--active' : ''}`}
              onClick={() => updateWidgetBase('Title.TextStyle.IsItalic', !titleItalic)}
              style={{ fontStyle: 'italic' }}
            >
              I
            </button>
          </div>
        </div>

        <div className="detail-row">
          <span className="detail-label">Alignment</span>
          <div className="align-buttons">
            {[{ v: 0, l: 'L' }, { v: 1, l: 'C' }, { v: 2, l: 'R' }].map((a) => (
              <button
                key={a.v}
                className={`align-btn ${titleAlign === a.v ? 'align-btn--active' : ''}`}
                onClick={() => updateWidgetBase('Title.TextStyle.Align', a.v)}
              >
                {a.l}
              </button>
            ))}
          </div>
        </div>

        <div className="detail-row">
          <span className="detail-label">Title background</span>
          <Toggle
            value={titleBgEnabled}
            onChange={(v) => updateWidgetBase('Title.Background.Enabled', v)}
          />
          <ColorPicker
            value={titleBgColor}
            onChange={(v) => updateWidgetBase('Title.Background.Color.Color', v)}
          />
        </div>

        <div className="detail-row">
          <span className="detail-label">Title height</span>
          <input
            type="range"
            className="detail-slider"
            min={30}
            max={80}
            value={titleHeight}
            onChange={(e) => updateWidgetBase('Title.Size.Height', Number(e.target.value))}
            style={{ width: '120px' }}
          />
          <span className="control-value">{titleHeight}px</span>
        </div>
      </div>

      {/* Frame section */}
      <div className="detail-section">
        <div className="detail-section__title">Frame</div>

        <div className="detail-row">
          <span className="detail-label">Show frame</span>
          <Toggle value={frameEnabled} onChange={(v) => updateWidgetBase('Frame.Enabled', v)} />
        </div>

        <div className="detail-row">
          <span className="detail-label">Border color</span>
          <ColorPicker
            value={frameColor}
            onChange={(v) => updateWidgetBase('Frame.Style.Color', v)}
          />
        </div>

        <div className="detail-row">
          <span className="detail-label">Border radius</span>
          <input
            type="range"
            className="detail-slider"
            min={0}
            max={16}
            value={globalTokens.borderRadius}
            onChange={(e) => setGlobalTokens({ borderRadius: Number(e.target.value) })}
            style={{ width: '120px' }}
          />
          <span className="control-value">{globalTokens.borderRadius}px</span>
        </div>
      </div>

      {/* Background section */}
      <div className="detail-section">
        <div className="detail-section__title">Background</div>

        <div className="detail-row">
          <span className="detail-label">Enable background</span>
          <Toggle value={bgEnabled} onChange={(v) => updateWidgetBase('Background.Enabled', v)} />
        </div>

        <div className="detail-row">
          <span className="detail-label">Background color</span>
          <ColorPicker
            value={bgColor}
            onChange={(v) => updateWidgetBase('Background.Color.Color', v)}
          />
        </div>
      </div>

      {/* Box Shadow section */}
      <div className="detail-section">
        <div className="detail-section__title">Shadow</div>

        <div className="detail-row">
          <span className="detail-label">Color</span>
          <ColorPicker
            value={shadowColor}
            onChange={(v) => updateWidgetBase('BoxShadow.Color', v)}
          />
        </div>

        <div className="detail-row">
          <span className="detail-label">X offset</span>
          <input
            type="range"
            className="detail-slider"
            min={-20}
            max={20}
            value={shadowX}
            onChange={(e) => updateWidgetBase('BoxShadow.X', Number(e.target.value))}
            style={{ width: '120px' }}
          />
          <span className="control-value">{shadowX}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Y offset</span>
          <input
            type="range"
            className="detail-slider"
            min={-20}
            max={20}
            value={shadowY}
            onChange={(e) => updateWidgetBase('BoxShadow.Y', Number(e.target.value))}
            style={{ width: '120px' }}
          />
          <span className="control-value">{shadowY}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Blur</span>
          <input
            type="range"
            className="detail-slider"
            min={0}
            max={40}
            value={shadowBlur}
            onChange={(e) => updateWidgetBase('BoxShadow.Blur', Number(e.target.value))}
            style={{ width: '120px' }}
          />
          <span className="control-value">{shadowBlur}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Spread</span>
          <input
            type="range"
            className="detail-slider"
            min={-10}
            max={20}
            value={shadowSpread}
            onChange={(e) => updateWidgetBase('BoxShadow.Spread', Number(e.target.value))}
            style={{ width: '120px' }}
          />
          <span className="control-value">{shadowSpread}</span>
        </div>
      </div>
    </>
  );
};
