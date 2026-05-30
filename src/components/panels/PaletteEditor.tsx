import React from 'react';
import { Plus, Star, Lock, Unlock } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { rgbaToHex, hexToRgba } from '../../lib/paletteGen';
import { MAX_PALETTE_SIZE } from '../../lib/previewConstants';

type PaletteEditorProps = {
  layout?: 'sidebar' | 'grid';
};

export const PaletteEditor: React.FC<PaletteEditorProps> = ({ layout = 'sidebar' }) => {
  const {
    palette, updatePaletteColor,
    seedIndex, setSeedIndex,
    lockedIndices, toggleLock,
    addPaletteSlot,
    paletteSize,
  } = useThemeStore();

  const canAddColor = paletteSize < MAX_PALETTE_SIZE;

  const rowClass = layout === 'grid'
    ? 'palette-grid palette-grid--mobile'
    : 'palette-row palette-row--sidebar';

  return (
    <div className={rowClass}>
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
            <span className="palette-slot__hex">{hex.slice(0, 7)}</span>
            <div className="palette-slot__icons">
              <button
                type="button"
                className={`palette-slot__icon-btn ${isSeed ? 'palette-slot__icon-btn--active' : ''}`}
                onClick={() => setSeedIndex(index)}
                title="Сделать seed-цветом"
              >
                <Star size={layout === 'grid' ? 12 : 9} fill={isSeed ? 'currentColor' : 'none'} />
              </button>
              <button
                type="button"
                className={`palette-slot__icon-btn ${isLocked ? 'palette-slot__icon-btn--active' : ''}`}
                onClick={() => toggleLock(index)}
                title={isLocked ? 'Разблокировать' : 'Заблокировать'}
              >
                {isLocked ? <Lock size={layout === 'grid' ? 12 : 9} /> : <Unlock size={layout === 'grid' ? 12 : 9} />}
              </button>
            </div>
          </div>
        );
      })}

      {canAddColor && (
        <button
          type="button"
          className={`palette-add-slot ${layout === 'grid' ? 'palette-add-slot--grid' : 'palette-add-slot--sidebar'}`}
          onClick={addPaletteSlot}
          title={`Добавить цвет (${paletteSize}/${MAX_PALETTE_SIZE})`}
          aria-label="Добавить цвет в палитру"
        >
          <Plus size={layout === 'grid' ? 24 : 18} />
        </button>
      )}
    </div>
  );
};
