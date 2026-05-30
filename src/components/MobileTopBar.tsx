import React, { useEffect, useRef } from 'react';
import { Download, MoreVertical, RotateCcw, Sun, Moon, Upload, Shuffle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useThemeStore } from '../store/themeStore';
import { importThemeFromJson, readFileAsText } from '../lib/importer';
import { validateTheme, downloadTheme } from '../lib/exporter';

export const MobileTopBar: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    themeName, setThemeName, mode, toggleMode,
    getExportTheme, importTheme, resetToDefault,
    mobileMenuOpen, setMobileMenuOpen, generatePalette,
  } = useThemeStore();

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen, setMobileMenuOpen]);

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
    } catch {
      toast.error('Failed to read file');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
    setMobileMenuOpen(false);
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
    setMobileMenuOpen(false);
  };

  const handleReset = () => {
    resetToDefault();
    toast.success('Theme reset to defaults');
    setMobileMenuOpen(false);
  };

  return (
    <header className="mobile-top-bar">
      <div className="mobile-top-bar__row">
        <div className="mobile-top-bar__logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span className="mobile-top-bar__brand">FatData</span>
        </div>

        <div className="mobile-top-bar__actions">
          <div className="top-bar__toggle" onClick={toggleMode} title={mode === 'light' ? 'Switch to Dark' : 'Switch to Light'} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleMode(); }} aria-label="Переключить светлую/тёмную тему">
            <div className={`top-bar__toggle-icon ${mode === 'light' ? 'top-bar__toggle-icon--active' : ''}`}>
              <Sun size={14} />
            </div>
            <div className={`top-bar__toggle-icon ${mode === 'dark' ? 'top-bar__toggle-icon--active' : ''}`}>
              <Moon size={14} />
            </div>
          </div>

          <button
            type="button"
            className="top-bar__btn top-bar__btn--ghost"
            onClick={generatePalette}
            title="Перемешать палитру"
            aria-label="Перемешать палитру"
          >
            <Shuffle size={16} />
          </button>

          <button
            type="button"
            className="top-bar__btn top-bar__btn--accent mobile-top-bar__export-btn"
            onClick={handleExport}
          >
            <Download size={16} />
            <span>Export</span>
          </button>

          <div className="mobile-top-bar__menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="mobile-top-bar__menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Меню"
              aria-expanded={mobileMenuOpen}
            >
              <MoreVertical size={20} />
            </button>

            {mobileMenuOpen && (
              <div className="mobile-top-bar__dropdown">
                <button
                  type="button"
                  className="mobile-top-bar__dropdown-item"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} />
                  Import JSON
                </button>
                <button
                  type="button"
                  className="mobile-top-bar__dropdown-item mobile-top-bar__dropdown-item--danger"
                  onClick={handleReset}
                >
                  <RotateCcw size={16} />
                  Reset All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <input
        type="text"
        className="mobile-top-bar__name-input"
        placeholder="Название темы"
        value={themeName}
        onChange={(e) => setThemeName(e.target.value)}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />
    </header>
  );
};
