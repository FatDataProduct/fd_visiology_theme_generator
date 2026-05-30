import React from 'react';
import { useThemeStore, type DetailTab } from '../../store/themeStore';
import { WidgetShellTab } from '../panels/tabs/WidgetShellTab';
import { ChartStylerTab } from '../panels/tabs/ChartStylerTab';
import { TableStylerTab } from '../panels/tabs/TableStylerTab';
import { IndicatorStylerTab } from '../panels/tabs/IndicatorStylerTab';
import { FilterStylerTab } from '../panels/tabs/FilterStylerTab';
import { MobilePanel } from './MobilePanel';

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'shell', label: 'Widget' },
  { id: 'chart', label: 'Chart' },
  { id: 'table', label: 'Table' },
  { id: 'indicator', label: 'KPI' },
  { id: 'filter', label: 'Filter' },
];

export const MobileStylingPanel: React.FC = () => {
  const { activeDetailTab, setActiveDetailTab } = useThemeStore();

  return (
    <MobilePanel title="Стили виджетов">
      <div className="mobile-styling-tabs" role="tablist" aria-label="Тип виджета">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeDetailTab === tab.id}
            className={`mobile-styling-tabs__btn ${activeDetailTab === tab.id ? 'mobile-styling-tabs__btn--active' : ''}`}
            onClick={() => setActiveDetailTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mobile-styling-content">
        {activeDetailTab === 'shell' && <WidgetShellTab />}
        {activeDetailTab === 'chart' && <ChartStylerTab />}
        {activeDetailTab === 'table' && <TableStylerTab />}
        {activeDetailTab === 'indicator' && <IndicatorStylerTab />}
        {activeDetailTab === 'filter' && <FilterStylerTab />}
      </div>
    </MobilePanel>
  );
};
