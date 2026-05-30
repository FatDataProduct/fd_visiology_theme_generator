import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { HARMONY_LABELS, type HarmonyMethod } from '../../lib/paletteGen';

interface ColorPanelProps {
  mobile?: boolean;
}

export const ColorPanel: React.FC<ColorPanelProps> = ({ mobile = false }) => {
  const {
    seedColor, setSeedColor,
    harmonyMethod, setHarmonyMethod,
    paletteSize, setPaletteSize,
    refinement, setRefinement, resetRefinement,
    globalTokens, setGlobalTokens,
    generatePalette,
    resetToDefault,
  } = useThemeStore();

  const fonts = ['Arial', 'Open Sans', 'Roboto', 'Inter', 'Segoe UI', 'Helvetica'];

  const refinementSection = (
    <>
      <div className="ctrl-row">
        <span className="ctrl-label">Brightness</span>
        <input
          type="range"
          className="ctrl-slider"
          min={-50}
          max={50}
          value={refinement.brightness}
          onChange={(e) => setRefinement({ brightness: Number(e.target.value) })}
        />
        <span className="ctrl-value">{refinement.brightness}</span>
      </div>

      <div className="ctrl-row">
        <span className="ctrl-label">Saturation</span>
        <input
          type="range"
          className="ctrl-slider"
          min={-50}
          max={50}
          value={refinement.saturation}
          onChange={(e) => setRefinement({ saturation: Number(e.target.value) })}
        />
        <span className="ctrl-value">{refinement.saturation}</span>
      </div>

      <div className="ctrl-row">
        <span className="ctrl-label">Hue Shift</span>
        <input
          type="range"
          className="ctrl-slider"
          min={-180}
          max={180}
          value={refinement.hueShift}
          onChange={(e) => setRefinement({ hueShift: Number(e.target.value) })}
        />
        <span className="ctrl-value">{refinement.hueShift}°</span>
      </div>

      <div className="ctrl-row">
        <span className="ctrl-label">Temperature</span>
        <input
          type="range"
          className="ctrl-slider"
          min={-50}
          max={50}
          value={refinement.temperature}
          onChange={(e) => setRefinement({ temperature: Number(e.target.value) })}
        />
        <span className="ctrl-value">{refinement.temperature}</span>
      </div>

      <button type="button" className="btn-sm btn-sm--ghost" onClick={resetRefinement}>
        <RotateCcw size={10} style={{ marginRight: 4 }} />
        Reset
      </button>
    </>
  );

  const globalTokensSection = (
    <>
      <div className="ctrl-row">
        <span className="ctrl-label">Title Font</span>
        <select
          className="ctrl-select"
          value={globalTokens.titleFontFamily}
          onChange={(e) => setGlobalTokens({ titleFontFamily: e.target.value })}
        >
          {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="ctrl-row">
        <span className="ctrl-label">Data Font</span>
        <select
          className="ctrl-select"
          value={globalTokens.dataFontFamily}
          onChange={(e) => setGlobalTokens({ dataFontFamily: e.target.value })}
        >
          {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="ctrl-row">
        <span className="ctrl-label">Title Size</span>
        <input
          type="range" className="ctrl-slider" min={12} max={28}
          value={globalTokens.titleFontSize}
          onChange={(e) => setGlobalTokens({ titleFontSize: Number(e.target.value) })}
        />
        <span className="ctrl-value">{globalTokens.titleFontSize}px</span>
      </div>

      <div className="ctrl-row">
        <span className="ctrl-label">Line Height</span>
        <input
          type="range" className="ctrl-slider" min={1.0} max={2.0} step={0.1}
          value={globalTokens.lineHeight}
          onChange={(e) => setGlobalTokens({ lineHeight: Number(e.target.value) })}
        />
        <span className="ctrl-value">{globalTokens.lineHeight.toFixed(1)}</span>
      </div>

      <div className="ctrl-row">
        <span className="ctrl-label">Radius</span>
        <input
          type="range" className="ctrl-slider" min={0} max={16}
          value={globalTokens.borderRadius}
          onChange={(e) => setGlobalTokens({ borderRadius: Number(e.target.value) })}
        />
        <span className="ctrl-value">{globalTokens.borderRadius}px</span>
      </div>
    </>
  );

  return (
    <div className={`panel-left ${mobile ? 'panel-left--mobile' : ''}`}>
      <div className="panel-section">
        <div className="panel-section__title">Seed Color</div>
        <div className="seed-row">
          <div className="seed-swatch" style={{ backgroundColor: seedColor }}>
            <input
              type="color"
              value={seedColor}
              onChange={(e) => setSeedColor(e.target.value)}
            />
          </div>
          <input
            type="text"
            className="seed-hex"
            value={seedColor}
            onChange={(e) => {
              if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                setSeedColor(e.target.value);
              }
            }}
          />
        </div>
      </div>

      <div className="divider" />

      <div className="panel-section">
        <div className="panel-section__title">Harmony Method</div>
        <div className="ctrl-row">
          <select
            className="ctrl-select"
            value={harmonyMethod}
            onChange={(e) => setHarmonyMethod(e.target.value as HarmonyMethod)}
          >
            {Object.entries(HARMONY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="panel-section">
        <div className="ctrl-row">
          <span className="ctrl-label">Palette Size</span>
          <div className="ctrl-stepper">
            <button
              type="button"
              className="ctrl-stepper__btn"
              onClick={() => setPaletteSize(paletteSize - 1)}
            >
              −
            </button>
            <span className="ctrl-stepper__val">{paletteSize}</span>
            <button
              type="button"
              className="ctrl-stepper__btn"
              onClick={() => setPaletteSize(paletteSize + 1)}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="divider" />

      {mobile ? (
        <details className="mobile-collapsible panel-section">
          <summary className="mobile-collapsible__summary">Тонкая настройка</summary>
          <div className="mobile-collapsible__body">
            {refinementSection}
          </div>
        </details>
      ) : (
        <div className="panel-section">
          <div className="panel-section__title">Refinement</div>
          {refinementSection}
        </div>
      )}

      <div className="divider" />

      {mobile ? (
        <details className="mobile-collapsible panel-section">
          <summary className="mobile-collapsible__summary">Дополнительные настройки</summary>
          <div className="mobile-collapsible__body">
            {globalTokensSection}
          </div>
        </details>
      ) : (
        <div className="panel-section">
          <div className="panel-section__title">Global Tokens</div>
          {globalTokensSection}
        </div>
      )}

      {mobile ? (
        <div className="panel-section mobile-generate-wrap">
          <button type="button" className="btn-sm btn-sm--primary mobile-generate-btn" onClick={generatePalette}>
            Сгенерировать палитру
          </button>
        </div>
      ) : (
        <div className="panel-section" style={{ marginTop: 'auto' }}>
          <button type="button" className="btn-sm btn-sm--ghost" onClick={resetToDefault}>
            Reset All
          </button>
        </div>
      )}
    </div>
  );
};
