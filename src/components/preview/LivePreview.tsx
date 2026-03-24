import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useThemeStore, type PreviewSheet } from '../../store/themeStore';
import { DashboardPreview } from './DashboardPreview';

export const LivePreview: React.FC = () => {
  const {
    previewScale, setPreviewScale,
    previewBackground, setPreviewBackground,
    showGrid, setShowGrid,
    activeSheet, setActiveSheet,
  } = useThemeStore();

  const bgColors: Array<{ id: 'white' | 'gray' | 'dark'; color: string }> = [
    { id: 'white', color: '#FFFFFF' },
    { id: 'gray', color: '#E8E8E8' },
    { id: 'dark', color: '#1E1E2E' },
  ];

  return (
    <div className="panel-center">
      <div className="preview-toolbar">
        <div className="preview-toolbar__group">
          <button
            className="preview-toolbar__btn"
            onClick={() => setPreviewScale(Math.max(50, previewScale - 25))}
          >
            <Minus size={12} />
          </button>
          <span className="preview-toolbar__label">{previewScale}%</span>
          <button
            className="preview-toolbar__btn"
            onClick={() => setPreviewScale(Math.min(150, previewScale + 25))}
          >
            <Plus size={12} />
          </button>
        </div>

        <div className="preview-toolbar__sep" />

        <div className="preview-toolbar__group">
          <span className="preview-toolbar__label">Фон:</span>
          {bgColors.map((bg) => (
            <div
              key={bg.id}
              className={`preview-bg-btn ${previewBackground === bg.id ? 'preview-bg-btn--active' : ''}`}
              style={{ backgroundColor: bg.color }}
              onClick={() => setPreviewBackground(bg.id)}
            />
          ))}
        </div>

        <div className="preview-toolbar__sep" />

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
          />
          Сетка
        </label>
      </div>

      <div
        className="preview-canvas"
        style={{
          backgroundColor: bgColors.find((b) => b.id === previewBackground)?.color ?? '#FFFFFF',
        }}
      >
        <div
          className="preview-dashboard"
          style={{ transform: `scale(${previewScale / 100})` }}
        >
          <DashboardPreview />
        </div>
      </div>

      <div className="sheet-tabs">
        {([1, 2, 3] as PreviewSheet[]).map((sheet) => (
          <button
            key={sheet}
            className={`sheet-tab ${activeSheet === sheet ? 'sheet-tab--active' : ''}`}
            onClick={() => setActiveSheet(sheet)}
          >
            Лист {sheet}
          </button>
        ))}
      </div>
    </div>
  );
};
