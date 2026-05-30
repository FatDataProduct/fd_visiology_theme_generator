import React, { useRef } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { DashboardPreview } from './DashboardPreview';
import { useMobilePreviewScale } from '../../hooks/useMobilePreviewScale';

type LivePreviewProps = {
  variant?: 'desktop' | 'mobile';
};

export const LivePreview: React.FC<LivePreviewProps> = ({ variant = 'desktop' }) => {
  const isMobile = variant === 'mobile';
  const canvasRef = useRef<HTMLDivElement>(null);
  // Auto-fit is always active; previewScale is a multiplier on top (100 = 1×)
  const autoFitScale = useMobilePreviewScale(canvasRef, isMobile);

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

  // Final render scale = autoFit × user multiplier
  const displayScale = Math.round(autoFitScale * (previewScale / 100));

  return (
    <div className={`workspace ${isMobile ? 'workspace--mobile' : ''}`}>
      <div
        ref={canvasRef}
        className={`preview-canvas ${isMobile ? 'preview-canvas--mobile' : ''}`}
        style={{ backgroundColor: bgColor }}
      >
        <div
          className={`preview-dashboard ${isMobile ? 'preview-dashboard--mobile' : ''}`}
          style={{ transform: `scale(${displayScale / 100})` }}
        >
          <DashboardPreview />
        </div>
      </div>

      <div className={`preview-pill ${isMobile ? 'preview-pill--mobile' : ''}`}>
        <button
          type="button"
          className="pill-btn"
          onClick={() => setPreviewScale(Math.max(50, previewScale - 10))}
          title="Уменьшить"
        >
          <Minus size={isMobile ? 16 : 12} />
        </button>
        <span className="pill-label">{displayScale}%</span>
        <button
          type="button"
          className="pill-btn"
          onClick={() => setPreviewScale(Math.min(200, previewScale + 10))}
          title="Увеличить"
        >
          <Plus size={isMobile ? 16 : 12} />
        </button>

        {!isMobile && (
          <>
            <div className="pill-sep" />

            <button
              type="button"
              className={`pill-sheet-btn ${activeSheet === 'echarts' ? 'pill-sheet-btn--active' : ''}`}
              onClick={() => setActiveSheet('echarts')}
              title="Лист ECharts"
            >
              ECharts
            </button>
            <button
              type="button"
              className={`pill-sheet-btn ${activeSheet === 'visapi' ? 'pill-sheet-btn--active' : ''}`}
              onClick={() => setActiveSheet('visapi')}
              title="Лист VisAPI"
            >
              VisAPI
            </button>
          </>
        )}

        <div className="pill-sep" />

        {bgOptions.map((bg) => (
          <button
            key={bg.id}
            type="button"
            className={`pill-bg-swatch ${previewBackground === bg.id ? 'pill-bg-swatch--active' : ''}`}
            style={{ backgroundColor: bg.color }}
            title={bg.title}
            onClick={() => setPreviewBackground(bg.id)}
            aria-label={bg.title}
          />
        ))}
      </div>
    </div>
  );
};
