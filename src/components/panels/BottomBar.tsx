import React, { useState } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { PaletteEditor } from './PaletteEditor';

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
  const { resetToDefault } = useThemeStore();

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

      <PaletteEditor layout="sidebar" />
    </div>
  );
};
