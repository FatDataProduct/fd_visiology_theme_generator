import React from 'react';
import { MobileTopBar } from '../components/MobileTopBar';
import { MobileNav } from '../components/MobileNav';
import { LivePreview } from '../components/preview/LivePreview';
import { ThemeTab } from '../components/panels/tabs/ThemeTab';
import { MobileStylingPanel } from '../components/mobile/MobileStylingPanel';
import { MobilePalettePanel } from '../components/mobile/MobilePalettePanel';
import { MobilePanel } from '../components/mobile/MobilePanel';
import { useThemeStore } from '../store/themeStore';

export const MobileLayout: React.FC = () => {
  const { mobileActiveTab } = useThemeStore();

  return (
    <div className="app-layout mobile-layout">
      <MobileTopBar />
      <main className={`mobile-content ${mobileActiveTab === 'preview' ? 'mobile-content--preview' : ''}`}>
        {mobileActiveTab === 'preview' && <LivePreview variant="mobile" />}
        {mobileActiveTab === 'colors' && (
          <MobilePanel title="Цвета и типографика">
            <ThemeTab variant="mobile" />
          </MobilePanel>
        )}
        {mobileActiveTab === 'styling' && <MobileStylingPanel />}
        {mobileActiveTab === 'palette' && <MobilePalettePanel />}
      </main>
      <MobileNav />
    </div>
  );
};
