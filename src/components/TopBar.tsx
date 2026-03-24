import React, { useRef } from 'react';
import { Upload, Download, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useThemeStore } from '../store/themeStore';
import { importThemeFromJson, readFileAsText } from '../lib/importer';
import { validateTheme, downloadTheme, applyPaletteToTheme } from '../lib/exporter';

export const TopBar: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    themeName, setThemeName, mode, toggleMode,
    getExportTheme, importTheme,
  } = useThemeStore();

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
        result.name || 'Imported Theme'
      );
      toast.success(`Theme "${result.name}" imported`);
    } catch (err) {
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

    const fileName = themeName || 'visiology-theme';
    downloadTheme(theme, fileName);
    toast.success('Theme exported!');
  };

  return (
    <div className="top-bar">
      <div className="top-bar__logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span>VTB</span>
      </div>

      <input
        type="text"
        className="top-bar__name-input"
        placeholder="Название темы"
        value={themeName}
        onChange={(e) => setThemeName(e.target.value)}
      />

      <div className="top-bar__spacer" />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />

      <button
        className="top-bar__btn top-bar__btn--outlined"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={16} />
        Import JSON
      </button>

      <button
        className="top-bar__toggle"
        onClick={toggleMode}
        title={mode === 'light' ? 'Switch to Dark' : 'Switch to Light'}
      >
        <Sun size={16} className={mode === 'light' ? 'top-bar__toggle-active' : ''} />
        <Moon size={16} className={mode === 'dark' ? 'top-bar__toggle-active' : ''} />
      </button>

      <button
        className="top-bar__btn top-bar__btn--accent"
        onClick={handleExport}
      >
        <Download size={16} />
        Export JSON
      </button>
    </div>
  );
};
