import React from 'react';
import { Eye, Palette, SlidersHorizontal, SwatchBook } from 'lucide-react';
import { useThemeStore, type MobileTab } from '../store/themeStore';

const NAV_ITEMS: { id: MobileTab; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { id: 'preview', label: 'Превью', Icon: Eye },
  { id: 'colors', label: 'Цвета', Icon: Palette },
  { id: 'styling', label: 'Стили', Icon: SlidersHorizontal },
  { id: 'palette', label: 'Палитра', Icon: SwatchBook },
];

export const MobileNav: React.FC = () => {
  const { mobileActiveTab, setMobileActiveTab } = useThemeStore();

  return (
    <nav className="mobile-nav" aria-label="Навигация">
      {NAV_ITEMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`mobile-nav__item ${mobileActiveTab === id ? 'mobile-nav__item--active' : ''}`}
          onClick={() => setMobileActiveTab(id)}
          aria-current={mobileActiveTab === id ? 'page' : undefined}
        >
          <Icon size={22} />
          <span className="mobile-nav__label">{label}</span>
        </button>
      ))}
    </nav>
  );
};
