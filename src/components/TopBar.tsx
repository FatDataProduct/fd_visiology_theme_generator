import React, { useRef } from 'react';
import { Upload, Download, Shuffle, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useThemeStore } from '../store/themeStore';
import { importThemeFromJson, readFileAsText } from '../lib/importer';
import { validateTheme, downloadTheme } from '../lib/exporter';

export const TopBar: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mode, toggleMode, getExportTheme, importTheme, generatePalette, themeName, setThemeName } = useThemeStore();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      const result = importThemeFromJson(text);
      if (!result.success || !result.theme) {
        toast.error(result.error || 'Failed to import theme');
        return;
      }
      importTheme(
        result.theme,
        result.palette || useThemeStore.getState().palette,
        result.name || 'Imported Theme',
      );
      toast.success(`Theme "${result.name}" imported`);
    } catch {
      toast.error('Failed to read file');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExport = () => {
    const theme = getExportTheme();
    const errors = validateTheme(theme);
    if (errors.length > 0) {
      toast.error(`Validation issues:\n${errors.slice(0, 3).join('\n')}`);
    }
    downloadTheme(theme, themeName || 'visiology-theme');
    toast.success('Theme exported!');
  };

  return (
    <div className="top-bar">
      {/* Logo + branding */}
      <div className="top-bar__logo">
        <div className="top-bar__logo-icon">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M8 1.5L1.5 5l6.5 3.5L14.5 5 8 1.5z" />
            <path d="M1.5 11l6.5 3.5L14.5 11" />
            <path d="M1.5 8l6.5 3.5L14.5 8" />
          </svg>
        </div>
        <span className="top-bar__title">FatData Visiology Theme Generator</span>
      </div>

      {/* Theme name input */}
      <input
        type="text"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6,
          color: 'rgba(255,255,255,0.7)',
          fontSize: 11,
          padding: '4px 10px',
          width: 180,
          outline: 'none',
          transition: 'border-color 0.15s',
        }}
        placeholder="Название темы"
        value={themeName}
        onChange={(e) => setThemeName(e.target.value)}
        onFocus={(e) => (e.target.style.borderColor = 'rgba(40,238,150,0.5)')}
        onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
      />

      <div className="top-bar__spacer" />

      {/* Randomize */}
      <button
        className="top-bar__btn top-bar__btn--ghost"
        onClick={generatePalette}
        title="Перемешать палитру"
      >
        <Shuffle size={14} />
        Перемешать
      </button>

      {/* Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />
      <button
        className="top-bar__btn top-bar__btn--outline"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={14} />
        Import
      </button>

      {/* Light / Dark toggle */}
      <div className="top-bar__toggle" onClick={toggleMode} title="Toggle light/dark">
        <div className={`top-bar__toggle-icon ${mode === 'light' ? 'top-bar__toggle-icon--active' : ''}`}>
          <Sun size={14} />
        </div>
        <div className={`top-bar__toggle-icon ${mode === 'dark' ? 'top-bar__toggle-icon--active' : ''}`}>
          <Moon size={14} />
        </div>
      </div>

      {/* Export */}
      <button
        className="top-bar__btn top-bar__btn--accent"
        onClick={handleExport}
      >
        <Download size={14} />
        Export JSON
      </button>
    </div>
  );
};
