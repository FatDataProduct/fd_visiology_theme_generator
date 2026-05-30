import React from 'react';
import { Star, Lock, Unlock } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { rgbaToHex, hexToRgba } from '../../lib/paletteGen';

interface PaletteBarProps {
  variant?: 'horizontal' | 'vertical';
}

export const PaletteBar: React.FC<PaletteBarProps> = ({ variant = 'horizontal' }) => {
  const {
    palette, updatePaletteColor,
    seedIndex, setSeedIndex,
    lockedIndices, toggleLock,
    generatePalette,
  } = useThemeStore();

  if (variant === 'vertical') {
    return (
      <div className="palette-list">
        <div className="palette-list__header">
          <h2 className="palette-list__title">Палитра</h2>
          <button type="button" className="palette-bar__gen-btn" onClick={generatePalette}>
            Сгенерировать
          </button>
        </div>
        <div className="palette-list__items">
          {palette.map((color, index) => {
            const hex = rgbaToHex(color.value);
            const isSeed = index === seedIndex;
            const isLocked = lockedIndices.has(index);

            return (
              <div key={color.id} className="palette-list__row">
                <div
                  className={[
                    'palette-list__swatch',
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
                <div className="palette-list__info">
                  <span className="palette-list__index">#{index + 1}</span>
                  <span className="palette-list__hex">{hex}</span>
                </div>
                <div className="palette-list__actions">
                  <button
                    type="button"
                    className={`palette-list__action-btn ${isSeed ? 'palette-list__action-btn--active' : ''}`}
                    onClick={() => setSeedIndex(index)}
                    title="Set as seed color"
                    aria-label="Сделать seed-цветом"
                  >
                    <Star size={18} fill={isSeed ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    type="button"
                    className={`palette-list__action-btn ${isLocked ? 'palette-list__action-btn--active' : ''}`}
                    onClick={() => toggleLock(index)}
                    title={isLocked ? 'Unlock' : 'Lock'}
                    aria-label={isLocked ? 'Разблокировать' : 'Заблокировать'}
                  >
                    {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

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
                type="button"
                className={`palette-slot__icon-btn ${isSeed ? 'palette-slot__icon-btn--active' : ''}`}
                onClick={() => setSeedIndex(index)}
                title="Set as seed color"
              >
                <Star size={10} fill={isSeed ? 'currentColor' : 'none'} />
              </button>
              <button
                type="button"
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

      <button type="button" className="palette-bar__gen-btn" onClick={generatePalette}>
        Сгенерировать
      </button>
    </div>
  );
};
