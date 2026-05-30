import React, { useEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useThemeStore, type PreviewSheet } from '../../store/themeStore';
import { PREVIEW_DASHBOARD_WIDTH } from '../../lib/previewConstants';
import { DashboardPreview } from './DashboardPreview';

interface LivePreviewProps {
  mobile?: boolean;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ mobile = false }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);

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

  useEffect(() => {
    if (!mobile || !canvasRef.current) return;

    const el = canvasRef.current;
    const updateFit = () => {
      const padding = 32;
      const available = el.clientWidth - padding;
      setFitScale(Math.min(1, Math.max(0.25, available / PREVIEW_DASHBOARD_WIDTH)));
    };

    updateFit();
    const ro = new ResizeObserver(updateFit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mobile]);

  const scale = mobile
    ? fitScale * (previewScale / 100)
    : previewScale / 100;

  return (
    <div className={`panel-center ${mobile ? 'panel-center--mobile' : ''}`}>
      <div className={`preview-toolbar ${mobile ? 'preview-toolbar--mobile' : ''}`}>
        <div className="preview-toolbar__group">
          <button
            type="button"
            className="preview-toolbar__btn"
            onClick={() => setPreviewScale(Math.max(50, previewScale - 25))}
            aria-label="Уменьшить масштаб"
          >
            <Minus size={mobile ? 16 : 12} />
          </button>
          <span className="preview-toolbar__label">
            {mobile ? `${Math.round(scale * 100)}%` : `${previewScale}%`}
          </span>
          <button
            type="button"
            className="preview-toolbar__btn"
            onClick={() => setPreviewScale(Math.min(150, previewScale + 25))}
            aria-label="Увеличить масштаб"
          >
            <Plus size={mobile ? 16 : 12} />
          </button>
        </div>

        {!mobile && (
          <>
            <div className="preview-toolbar__sep" />

            <div className="preview-toolbar__group">
              <span className="preview-toolbar__label">Фон:</span>
              {bgColors.map((bg) => (
                <div
                  key={bg.id}
                  className={`preview-bg-btn ${previewBackground === bg.id ? 'preview-bg-btn--active' : ''}`}
                  style={{ backgroundColor: bg.color }}
                  onClick={() => setPreviewBackground(bg.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setPreviewBackground(bg.id)}
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
          </>
        )}

        {mobile && (
          <>
            <div className="preview-toolbar__sep" />
            <div className="preview-toolbar__group preview-toolbar__group--bg-mobile">
              {bgColors.filter((bg) => bg.id !== 'gray').map((bg) => (
                <div
                  key={bg.id}
                  className={`preview-bg-btn preview-bg-btn--mobile ${previewBackground === bg.id ? 'preview-bg-btn--active' : ''}`}
                  style={{ backgroundColor: bg.color }}
                  onClick={() => setPreviewBackground(bg.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setPreviewBackground(bg.id)}
                  aria-label={`Фон: ${bg.id}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div
        ref={canvasRef}
        className={`preview-canvas ${mobile ? 'preview-canvas--mobile' : ''}`}
        style={{
          backgroundColor: bgColors.find((b) => b.id === previewBackground)?.color ?? '#FFFFFF',
        }}
      >
        <div
          className="preview-dashboard"
          style={{ transform: `scale(${scale})` }}
        >
          <DashboardPreview />
        </div>
      </div>

      <div className={`sheet-tabs ${mobile ? 'sheet-tabs--mobile' : ''}`}>
        {([1, 2, 3] as PreviewSheet[]).map((sheet) => (
          <button
            key={sheet}
            type="button"
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
