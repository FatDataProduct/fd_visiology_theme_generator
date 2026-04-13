import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { DashboardPreview } from './DashboardPreview';

export const LivePreview: React.FC = () => {
  const {
    previewScale, setPreviewScale,
    previewBackground, setPreviewBackground,
    activeSheet, setActiveSheet,
  } = useThemeStore();

  const bgOptions: Array<{ id: 'white' | 'gray' | 'dark'; color: string; title: string }> = [
    { id: 'white', color: '#FFFFFF', title: 'Белый' },
    { id: 'gray',  color: '#E8E8E8', title: 'Серый' },
    { id: 'dark',  color: '#1E1E2E', title: 'Тёмный' },
  ];

  const bgColor = bgOptions.find((b) => b.id === previewBackground)?.color ?? '#FFFFFF';

  return (
    <div className="workspace">
      {/* Preview canvas — full width / height */}
      <div className="preview-canvas" style={{ backgroundColor: bgColor }}>
        <div
          className="preview-dashboard"
          style={{ transform: `scale(${previewScale / 100})` }}
        >
          <DashboardPreview />
        </div>
      </div>

      {/* Floating pill toolbar */}
      <div className="preview-pill">
        <button
          className="pill-btn"
          onClick={() => setPreviewScale(Math.max(25, previewScale - 25))}
          title="Уменьшить"
        >
          <Minus size={12} />
        </button>
        <span className="pill-label">{previewScale}%</span>
        <button
          className="pill-btn"
          onClick={() => setPreviewScale(Math.min(150, previewScale + 25))}
          title="Увеличить"
        >
          <Plus size={12} />
        </button>

        <div className="pill-sep" />

        <button
          className={`pill-sheet-btn ${activeSheet === 'echarts' ? 'pill-sheet-btn--active' : ''}`}
          onClick={() => setActiveSheet('echarts')}
          title="Лист ECharts"
        >
          ECharts
        </button>
        <button
          className={`pill-sheet-btn ${activeSheet === 'visapi' ? 'pill-sheet-btn--active' : ''}`}
          onClick={() => setActiveSheet('visapi')}
          title="Лист VisAPI"
        >
          VisAPI
        </button>

        <div className="pill-sep" />

        {bgOptions.map((bg) => (
          <div
            key={bg.id}
            className={`pill-bg-swatch ${previewBackground === bg.id ? 'pill-bg-swatch--active' : ''}`}
            style={{ backgroundColor: bg.color }}
            title={bg.title}
            onClick={() => setPreviewBackground(bg.id)}
          />
        ))}
      </div>
    </div>
  );
};
