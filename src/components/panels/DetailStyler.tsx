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

interface DetailStylerProps {
  mobile?: boolean;
}

export const DetailStyler: React.FC<DetailStylerProps> = ({ mobile = false }) => {
  const { activeDetailTab, setActiveDetailTab } = useThemeStore();

  return (
    <div className={`panel-right ${mobile ? 'panel-right--mobile' : ''}`}>
      <div className={`detail-tabs ${mobile ? 'detail-tabs--mobile' : ''}`}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`detail-tab ${activeDetailTab === tab.id ? 'detail-tab--active' : ''}`}
            onClick={() => setActiveDetailTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={`detail-content ${mobile ? 'detail-content--mobile' : ''}`}>
        {activeDetailTab === 'shell' && <WidgetShellTab />}
        {activeDetailTab === 'chart' && <ChartStylerTab />}
        {activeDetailTab === 'table' && <TableStylerTab />}
        {activeDetailTab === 'indicator' && <IndicatorStylerTab />}
        {activeDetailTab === 'filter' && <FilterStylerTab />}
      </div>
    </div>
  );
};
