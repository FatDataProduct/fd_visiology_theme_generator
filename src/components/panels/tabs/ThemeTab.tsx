import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useThemeStore } from '../../../store/themeStore';
import { HARMONY_LABELS, type HarmonyMethod } from '../../../lib/paletteGen';

export const ThemeTab: React.FC = () => {
  const {
    seedColor, setSeedColor,
    harmonyMethod, setHarmonyMethod,
    paletteSize, setPaletteSize,
    refinement, setRefinement, resetRefinement,
    globalTokens, setGlobalTokens,
  } = useThemeStore();

  const fonts = ['Arial', 'Open Sans', 'Roboto', 'Inter', 'Segoe UI', 'Helvetica'];

  return (
    <>
      {/* Palette section */}
      <div className="detail-section" style={{ minWidth: 200 }}>
        <div className="detail-section__title">Seed Color &amp; Harmony</div>

        <div className="detail-row">
          <span className="detail-label">Seed</span>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
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
                if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setSeedColor(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="detail-row">
          <span className="detail-label">Harmony</span>
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

        <div className="detail-row">
          <span className="detail-label">Size</span>
          <div className="ctrl-stepper">
            <button className="ctrl-stepper__btn" onClick={() => setPaletteSize(paletteSize - 1)}>−</button>
            <span className="ctrl-stepper__val">{paletteSize}</span>
            <button className="ctrl-stepper__btn" onClick={() => setPaletteSize(paletteSize + 1)}>+</button>
          </div>
        </div>
      </div>

      {/* Refinement section */}
      <div className="detail-section" style={{ minWidth: 210 }}>
        <div className="detail-section__title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Refinement</span>
          <button
            onClick={resetRefinement}
            title="Reset refinement"
            style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, cursor: 'pointer' }}
          >
            <RotateCcw size={9} /> Reset
          </button>
        </div>

        <div className="detail-row">
          <span className="detail-label">Brightness</span>
          <input
            type="range" className="ctrl-slider" min={-50} max={50}
            value={refinement.brightness}
            onChange={(e) => setRefinement({ brightness: Number(e.target.value) })}
          />
          <span className="ctrl-value">{refinement.brightness}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Saturation</span>
          <input
            type="range" className="ctrl-slider" min={-50} max={50}
            value={refinement.saturation}
            onChange={(e) => setRefinement({ saturation: Number(e.target.value) })}
          />
          <span className="ctrl-value">{refinement.saturation}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Hue Shift</span>
          <input
            type="range" className="ctrl-slider" min={-180} max={180}
            value={refinement.hueShift}
            onChange={(e) => setRefinement({ hueShift: Number(e.target.value) })}
          />
          <span className="ctrl-value">{refinement.hueShift}°</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Temperature</span>
          <input
            type="range" className="ctrl-slider" min={-50} max={50}
            value={refinement.temperature}
            onChange={(e) => setRefinement({ temperature: Number(e.target.value) })}
          />
          <span className="ctrl-value">{refinement.temperature}</span>
        </div>
      </div>

      {/* Typography section */}
      <div className="detail-section" style={{ minWidth: 200 }}>
        <div className="detail-section__title">Typography</div>

        <div className="detail-row">
          <span className="detail-label">Title Font</span>
          <select
            className="ctrl-select"
            value={globalTokens.titleFontFamily}
            onChange={(e) => setGlobalTokens({ titleFontFamily: e.target.value })}
          >
            {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div className="detail-row">
          <span className="detail-label">Data Font</span>
          <select
            className="ctrl-select"
            value={globalTokens.dataFontFamily}
            onChange={(e) => setGlobalTokens({ dataFontFamily: e.target.value })}
          >
            {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div className="detail-row">
          <span className="detail-label">Title Size</span>
          <input
            type="range" className="ctrl-slider" min={12} max={28}
            value={globalTokens.titleFontSize}
            onChange={(e) => setGlobalTokens({ titleFontSize: Number(e.target.value) })}
          />
          <span className="ctrl-value">{globalTokens.titleFontSize}px</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Radius</span>
          <input
            type="range" className="ctrl-slider" min={0} max={16}
            value={globalTokens.borderRadius}
            onChange={(e) => setGlobalTokens({ borderRadius: Number(e.target.value) })}
          />
          <span className="ctrl-value">{globalTokens.borderRadius}px</span>
        </div>
      </div>
    </>
  );
};
