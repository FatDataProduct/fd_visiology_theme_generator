import React, { useState } from 'react';
import { Star, Lock, Unlock } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { rgbaToHex, hexToRgba } from '../../lib/paletteGen';

import { ThemeTab }     from './tabs/ThemeTab';
import { WidgetShellTab }   from './tabs/WidgetShellTab';
import { ChartStylerTab }   from './tabs/ChartStylerTab';
import { TableStylerTab }   from './tabs/TableStylerTab';
import { IndicatorStylerTab } from './tabs/IndicatorStylerTab';
import { FilterStylerTab }  from './tabs/FilterStylerTab';

type BottomTab = 'theme' | 'shell' | 'chart' | 'table' | 'indicator' | 'filter';

const TABS: Array<{ id: BottomTab; label: string }> = [
  { id: 'theme',     label: '🎨 Тема' },
  { id: 'shell',     label: 'Widget' },
  { id: 'chart',     label: 'Chart' },
  { id: 'table',     label: 'Table' },
  { id: 'indicator', label: 'KPI' },
  { id: 'filter',    label: 'Filter' },
];

export const BottomBar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BottomTab>('theme');
  const {
    palette, updatePaletteColor,
    seedIndex, setSeedIndex,
    lockedIndices, toggleLock,
    generatePalette,
    resetToDefault,
  } = useThemeStore();

  return (
    <div className="left-sidebar">
      {/* Tab navigation */}
      <div className="bottom-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`bottom-tab ${activeTab === t.id ? 'bottom-tab--active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}

        {/* Reset button pushed to the right */}
        <div style={{ marginLeft: 'auto' }}>
          <button
            className="bottom-tab"
            onClick={resetToDefault}
            title="Сбросить всё к умолчаниям"
            style={{ color: 'rgba(255,90,90,0.6)', fontSize: 10 }}
          >
            ↺ Сброс
          </button>
        </div>
      </div>

      {/* Settings area */}
      <div className="bottom-settings">
        {activeTab === 'theme'     && <ThemeTab />}
        {activeTab === 'shell'     && <WidgetShellTab />}
        {activeTab === 'chart'     && <ChartStylerTab />}
        {activeTab === 'table'     && <TableStylerTab />}
        {activeTab === 'indicator' && <IndicatorStylerTab />}
        {activeTab === 'filter'    && <FilterStylerTab />}
      </div>

      {/* Palette row */}
      <div className="palette-row palette-row--sidebar">
        {palette.map((color, index) => {
          const hex = rgbaToHex(color.value);
          const isSeed   = index === seedIndex;
          const isLocked = lockedIndices.has(index);

          return (
            <div key={color.id} className="palette-slot">
              <div
                className={[
                  'palette-slot__swatch',
                  isSeed   && 'palette-slot__swatch--seed',
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
                  className={`palette-slot__icon-btn ${isSeed ? 'palette-slot__icon-btn--active' : ''}`}
                  onClick={() => setSeedIndex(index)}
                  title="Сделать seed-цветом"
                >
                  <Star size={9} fill={isSeed ? 'currentColor' : 'none'} />
                </button>
                <button
                  className={`palette-slot__icon-btn ${isLocked ? 'palette-slot__icon-btn--active' : ''}`}
                  onClick={() => toggleLock(index)}
                  title={isLocked ? 'Разблокировать' : 'Заблокировать'}
                >
                  {isLocked ? <Lock size={9} /> : <Unlock size={9} />}
                </button>
              </div>
            </div>
          );
        })}

        {/* Shuffle button */}
        <div className="palette-row__actions palette-row__actions--sidebar">
          <button
            className="palette-row__btn palette-row__btn--accent"
            onClick={generatePalette}
            title="Сгенерировать новую вариацию"
          >
            ↻ Перемешать
          </button>
        </div>
      </div>
    </div>
  );
};
