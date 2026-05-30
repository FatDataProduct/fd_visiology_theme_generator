import React from 'react';
import { MobileTopBar } from '../components/MobileTopBar';
import { MobileNav } from '../components/MobileNav';
import { ColorPanel } from '../components/panels/ColorPanel';
import { LivePreview } from '../components/preview/LivePreview';
import { PaletteBar } from '../components/panels/PaletteBar';
import { DetailStyler } from '../components/panels/DetailStyler';
import { useThemeStore } from '../store/themeStore';

export const MobileLayout: React.FC = () => {
  const { mobileActiveTab } = useThemeStore();

  return (
    <div className="app-layout mobile-layout">
      <MobileTopBar />
      <main className="mobile-content">
        {mobileActiveTab === 'preview' && <LivePreview mobile />}
        {mobileActiveTab === 'colors' && <ColorPanel mobile />}
        {mobileActiveTab === 'styling' && <DetailStyler mobile />}
        {mobileActiveTab === 'palette' && <PaletteBar variant="vertical" />}
      </main>
      <MobileNav />
    </div>
  );
};
