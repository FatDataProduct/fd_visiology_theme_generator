import React, { useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useThemeStore } from '../../../store/themeStore';
import { HARMONY_LABELS, type HarmonyMethod } from '../../../lib/paletteGen';
import type { VisiologyTheme } from '../../../types/visiology';
import { importThemeFromJson, readFileAsText } from '../../../lib/importer';

export const ThemeTab: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [fetchMsg, setFetchMsg] = useState('');

  const {
    seedColor, setSeedColor,
    harmonyMethod, setHarmonyMethod,
    paletteSize, setPaletteSize,
    refinement, setRefinement, resetRefinement,
    globalTokens, setGlobalTokens,
    visApiUrl, setVisApiUrl, setActiveSheet,
    importTheme,
  } = useThemeStore();

  /* ---- Import from JSON file ---------------------------------- */
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFileAsText(file)
      .then((text) => {
        const result = importThemeFromJson(text);
        if (!result.success || !result.theme) {
          throw new Error(result.error || 'Неизвестный формат JSON');
        }
        importTheme(
          result.theme,
          result.palette || useThemeStore.getState().palette,
          result.name || file.name.replace(/\.json$/i, ''),
        );
        setFetchStatus('ok');
        setFetchMsg(`Импортировано: «${result.name || file.name}»`);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        setFetchStatus('error');
        setFetchMsg(msg);
      });
    e.target.value = '';
  };

  /* ---- Fetch theme from Visiology REST API ------------------- */
  const handleFetchFromApi = async () => {
    if (!visApiUrl) {
      setFetchMsg('Сначала введи URL дашборда Visiology выше');
      setFetchStatus('error');
      return;
    }
    let base: string;
    try {
      base = new URL(visApiUrl).origin;
    } catch {
      setFetchMsg('Невалидный URL');
      setFetchStatus('error');
      return;
    }
    setFetchStatus('loading');
    setFetchMsg('Запрашиваем темы...');
    try {
      const res = await fetch(`${base}/api/v1.0/themes`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as unknown;
      // Visiology can return { $values: [...] } or plain array
      const arr: VisiologyTheme[] = Array.isArray(data)
        ? (data as VisiologyTheme[])
        : ((data as { $values?: VisiologyTheme[] })?.$values ?? [data as VisiologyTheme]);
      if (!arr.length) throw new Error('Список тем пуст');
      // Load first theme (most installations have one)
      const theme = arr[0] as VisiologyTheme;
      const result = importThemeFromJson(JSON.stringify(theme));
      if (!result.success || !result.theme) {
        throw new Error(result.error || 'Не удалось обработать тему из API');
      }
      importTheme(
        result.theme,
        result.palette || useThemeStore.getState().palette,
        result.name || 'Imported Theme',
      );
      setFetchStatus('ok');
      setFetchMsg(`Загружена: «${result.name || theme.Name}»`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isCors = msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('cors');
      if (isCors) {
        setFetchStatus('error');
        setFetchMsg(
          'CORS заблокировал запрос. Скачайте JSON вручную: ' +
          `${base}/api/v1.0/themes → и загрузите файлом ниже.`,
        );
      } else {
        setFetchStatus('error');
        setFetchMsg(`Ошибка: ${msg}`);
      }
    }
  };

  const fonts = ['Arial', 'Open Sans', 'Roboto', 'Inter', 'Segoe UI', 'Helvetica'];

  return (
    <>
      {/* Palette section */}
      <div className="detail-section" style={{ minWidth: 200 }}>
        <div className="detail-section__title">Seed Color &amp; Harmony</div>

        <div className="detail-row">
          <span className="detail-label">Seed</span>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <div className="seed-swatch" style={{ backgroundColor: seedColor }}>
              <input
                type="color"
                value={seedColor}
                onChange={(e) => setSeedColor(e.target.value)}
              />
            </div>
            <input
              type="text"
              className="seed-hex"
              value={seedColor}
              onChange={(e) => {
                if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setSeedColor(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="detail-row">
          <span className="detail-label">Harmony</span>
          <select
            className="ctrl-select"
            value={harmonyMethod}
            onChange={(e) => setHarmonyMethod(e.target.value as HarmonyMethod)}
          >
            {Object.entries(HARMONY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="detail-row">
          <span className="detail-label">Size</span>
          <div className="ctrl-stepper">
            <button className="ctrl-stepper__btn" onClick={() => setPaletteSize(paletteSize - 1)}>−</button>
            <span className="ctrl-stepper__val">{paletteSize}</span>
            <button className="ctrl-stepper__btn" onClick={() => setPaletteSize(paletteSize + 1)}>+</button>
          </div>
        </div>
      </div>

      {/* Refinement section */}
      <div className="detail-section" style={{ minWidth: 210 }}>
        <div className="detail-section__title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Refinement</span>
          <button
            onClick={resetRefinement}
            title="Reset refinement"
            style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, cursor: 'pointer' }}
          >
            <RotateCcw size={9} /> Reset
          </button>
        </div>

        <div className="detail-row">
          <span className="detail-label">Brightness</span>
          <input
            type="range" className="ctrl-slider" min={-50} max={50}
            value={refinement.brightness}
            onChange={(e) => setRefinement({ brightness: Number(e.target.value) })}
          />
          <span className="ctrl-value">{refinement.brightness}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Saturation</span>
          <input
            type="range" className="ctrl-slider" min={-50} max={50}
            value={refinement.saturation}
            onChange={(e) => setRefinement({ saturation: Number(e.target.value) })}
          />
          <span className="ctrl-value">{refinement.saturation}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Hue Shift</span>
          <input
            type="range" className="ctrl-slider" min={-180} max={180}
            value={refinement.hueShift}
            onChange={(e) => setRefinement({ hueShift: Number(e.target.value) })}
          />
          <span className="ctrl-value">{refinement.hueShift}°</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Temperature</span>
          <input
            type="range" className="ctrl-slider" min={-50} max={50}
            value={refinement.temperature}
            onChange={(e) => setRefinement({ temperature: Number(e.target.value) })}
          />
          <span className="ctrl-value">{refinement.temperature}</span>
        </div>
      </div>

      {/* Typography section */}
      <div className="detail-section" style={{ minWidth: 200 }}>
        <div className="detail-section__title">Typography</div>

        <div className="detail-row">
          <span className="detail-label">Title Font</span>
          <select
            className="ctrl-select"
            value={globalTokens.titleFontFamily}
            onChange={(e) => setGlobalTokens({ titleFontFamily: e.target.value })}
          >
            {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div className="detail-row">
          <span className="detail-label">Data Font</span>
          <select
            className="ctrl-select"
            value={globalTokens.dataFontFamily}
            onChange={(e) => setGlobalTokens({ dataFontFamily: e.target.value })}
          >
            {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div className="detail-row">
          <span className="detail-label">Title Size</span>
          <input
            type="range" className="ctrl-slider" min={12} max={28}
            value={globalTokens.titleFontSize}
            onChange={(e) => setGlobalTokens({ titleFontSize: Number(e.target.value) })}
          />
          <span className="ctrl-value">{globalTokens.titleFontSize}px</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Radius</span>
          <input
            type="range" className="ctrl-slider" min={0} max={16}
            value={globalTokens.borderRadius}
            onChange={(e) => setGlobalTokens({ borderRadius: Number(e.target.value) })}
          />
          <span className="ctrl-value">{globalTokens.borderRadius}px</span>
        </div>
      </div>

      {/* VisAPI iframe section */}
      <div className="detail-section" style={{ minWidth: 290 }}>
        <div className="detail-section__title">VisAPI — просмотр дашборда</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="detail-label" style={{ fontSize: 9 }}>
            URL дашборда Visiology (для просмотра в iframe)
          </span>
          <input
            type="url"
            className="detail-input"
            value={visApiUrl}
            placeholder="https://your-visapi-host/dashboard"
            onChange={(e) => setVisApiUrl(e.target.value)}
            style={{ width: '100%', textAlign: 'left', fontSize: 10, padding: '5px 7px', height: 28 }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="btn-sm btn-sm--primary"
              onClick={() => setActiveSheet('visapi')}
              style={{ flex: 1, padding: '5px 10px' }}
            >
              Открыть лист VisAPI
            </button>
            <button
              className="btn-sm btn-sm--ghost"
              onClick={() => setVisApiUrl('')}
              style={{ padding: '5px 10px' }}
            >
              Очистить
            </button>
          </div>
          {/* Explanation */}
          <div style={{
            background: 'rgba(255,200,50,0.08)',
            border: '1px solid rgba(255,200,50,0.25)',
            borderRadius: 6,
            padding: '7px 9px',
            fontSize: 9,
            lineHeight: 1.6,
            color: 'var(--text-muted)',
          }}>
            ⚠️ Iframe отображает дашборд статично — изменения темы в редакторе <b>не применяются</b> к нему автоматически
            (Visiology VisAPI не поддерживает PostMessage для тем).<br />
            <b>Правильный workflow:</b> настрой тему → Экспорт JSON → загрузи в Visiology.
          </div>
        </div>
      </div>

      {/* Import / Fetch theme section */}
      <div className="detail-section" style={{ minWidth: 290 }}>
        <div className="detail-section__title">Импорт темы из Visiology</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Auto-fetch via API */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span className="detail-label" style={{ fontSize: 9 }}>
              Автоматически — через REST API (нужна авторизация в браузере)
            </span>
            <button
              className="btn-sm btn-sm--primary"
              onClick={handleFetchFromApi}
              disabled={fetchStatus === 'loading'}
              style={{ padding: '6px 12px' }}
            >
              {fetchStatus === 'loading' ? '⏳ Загружаем...' : '⬇ Получить тему из Visiology API'}
            </button>
          </div>

          {fetchMsg && (
            <div style={{
              padding: '6px 9px',
              borderRadius: 5,
              fontSize: 9,
              lineHeight: 1.5,
              background: fetchStatus === 'ok'
                ? 'rgba(40,238,150,0.1)' : fetchStatus === 'error'
                ? 'rgba(255,80,80,0.1)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${fetchStatus === 'ok' ? 'rgba(40,238,150,0.3)' : fetchStatus === 'error' ? 'rgba(255,80,80,0.3)' : 'transparent'}`,
              color: fetchStatus === 'ok' ? '#28ee96' : fetchStatus === 'error' ? '#ff8080' : 'var(--text-muted)',
              wordBreak: 'break-word',
            }}>
              {fetchMsg}
            </div>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>или вручную</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Manual file import */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span className="detail-label" style={{ fontSize: 9 }}>
              Загрузить JSON темы или JSON дашборда (с авто-извлечением темы)
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={handleFileImport}
            />
            <button
              className="btn-sm btn-sm--ghost"
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: '6px 12px' }}
            >
              📂 Загрузить JSON (theme/dashboard)
            </button>
          </div>

          <div style={{
            fontSize: 9,
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            padding: '4px 0',
          }}>
            Как получить JSON из Visiology: Admin Panel → Appearance → Themes → Экспорт / скачать.
            Также можно загрузить экспорт дашборда: генератор попробует извлечь стили и цвета в редактируемую тему.
          </div>
        </div>
      </div>
    </>
  );
};
