import React, { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { useThemeStore, DEFAULT_THEME_NAME } from '../store/themeStore';

type ThemeNameEditorProps = {
  variant?: 'desktop' | 'mobile';
};

export const ThemeNameEditor: React.FC<ThemeNameEditorProps> = ({ variant = 'desktop' }) => {
  const { themeName, setThemeName } = useThemeStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(themeName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(themeName);
  }, [themeName, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    setThemeName(trimmed || DEFAULT_THEME_NAME);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(themeName);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        className={`theme-name-editor__input theme-name-editor__input--${variant}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') cancel();
        }}
        aria-label="Название темы"
      />
    );
  }

  return (
    <div className={`theme-name-editor theme-name-editor--${variant}`}>
      <span className="theme-name-editor__label" title={themeName}>
        {themeName}
      </span>
      <button
        type="button"
        className="theme-name-editor__edit-btn"
        onClick={() => setEditing(true)}
        title="Изменить название темы"
        aria-label="Изменить название темы"
      >
        <Pencil size={variant === 'mobile' ? 14 : 12} />
      </button>
    </div>
  );
};
