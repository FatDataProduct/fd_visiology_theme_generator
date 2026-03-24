import React from 'react';
import { useThemeStore, type DetailTab } from '../../store/themeStore';
import { WidgetShellTab } from './tabs/WidgetShellTab';
import { ChartStylerTab } from './tabs/ChartStylerTab';
import { TableStylerTab } from './tabs/TableStylerTab';
import { IndicatorStylerTab } from './tabs/IndicatorStylerTab';
import { FilterStylerTab } from './tabs/FilterStylerTab';

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'shell', label: 'Widget' },
  { id: 'chart', label: 'Chart' },
  { id: 'table', label: 'Table' },
  { id: 'indicator', label: 'KPI' },
  { id: 'filter', label: 'Filter' },
];

export const DetailStyler: React.FC = () => {
  const { activeDetailTab, setActiveDetailTab } = useThemeStore();

  return (
    <div className="panel-right">
      <div className="detail-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`detail-tab ${activeDetailTab === tab.id ? 'detail-tab--active' : ''}`}
            onClick={() => setActiveDetailTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="detail-content">
        {activeDetailTab === 'shell' && <WidgetShellTab />}
        {activeDetailTab === 'chart' && <ChartStylerTab />}
        {activeDetailTab === 'table' && <TableStylerTab />}
        {activeDetailTab === 'indicator' && <IndicatorStylerTab />}
        {activeDetailTab === 'filter' && <FilterStylerTab />}
      </div>
    </div>
  );
};
