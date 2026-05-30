import React from 'react';
import { TopBar } from '../components/TopBar';
import { ColorPanel } from '../components/panels/ColorPanel';
import { LivePreview } from '../components/preview/LivePreview';
import { PaletteBar } from '../components/panels/PaletteBar';
import { DetailStyler } from '../components/panels/DetailStyler';
import { Footer } from '../components/Footer';

export const DesktopLayout: React.FC = () => (
  <div className="app-layout">
    <TopBar />
    <div className="main-content">
      <ColorPanel />
      <LivePreview />
      <DetailStyler />
    </div>
    <PaletteBar />
    <Footer />
  </div>
);
