import React from 'react';
import { TopBar } from '../components/TopBar';
import { LivePreview } from '../components/preview/LivePreview';
import { BottomBar } from '../components/panels/BottomBar';
import { Footer } from '../components/Footer';

export const DesktopShell: React.FC = () => (
  <>
    <TopBar />
    <div className="main-shell">
      <BottomBar />
      <LivePreview />
    </div>
    <Footer />
  </>
);
