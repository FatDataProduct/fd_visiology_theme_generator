import React from 'react';
import { Star, Lock, Unlock } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { rgbaToHex, hexToRgba } from '../../lib/paletteGen';

export const PaletteBar: React.FC = () => {
  const {
    palette, updatePaletteColor,
    seedIndex, setSeedIndex,
    lockedIndices, toggleLock,
    generatePalette,
  } = useThemeStore();

  return (
    <div className="palette-bar">
      {palette.map((color, index) => {
        const hex = rgbaToHex(color.value);
        const isSeed = index === seedIndex;
        const isLocked = lockedIndices.has(index);

        return (
          <div key={color.id} className="palette-slot">
            <div
              className={[
                'palette-slot__swatch',
                isSeed && 'palette-slot__swatch--seed',
                isLocked && 'palette-slot__swatch--locked',
              ].filter(Boolean).join(' ')}
              style={{ backgroundColor: color.value }}
            >
              <input
                type="color"
                value={hex}
                onChange={(e) => updatePaletteColor(index, hexToRgba(e.target.value))}
              />
            </div>
            <span className="palette-slot__hex">{hex}</span>
            <div className="palette-slot__icons">
              <button
                className={`palette-slot__icon-btn ${isSeed ? 'palette-slot__icon-btn--active' : ''}`}
                onClick={() => setSeedIndex(index)}
                title="Set as seed color"
              >
                <Star size={10} fill={isSeed ? 'currentColor' : 'none'} />
              </button>
              <button
                className={`palette-slot__icon-btn ${isLocked ? 'palette-slot__icon-btn--active' : ''}`}
                onClick={() => toggleLock(index)}
                title={isLocked ? 'Unlock' : 'Lock'}
              >
                {isLocked ? <Lock size={10} /> : <Unlock size={10} />}
              </button>
            </div>
          </div>
        );
      })}

      <button className="palette-bar__gen-btn" onClick={generatePalette}>
        Сгенерировать
      </button>
    </div>
  );
};
