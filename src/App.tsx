import React from 'react';
import { Toaster } from 'react-hot-toast';
import { TopBar } from './components/TopBar';
import { ColorPanel } from './components/panels/ColorPanel';
import { LivePreview } from './components/preview/LivePreview';
import { PaletteBar } from './components/panels/PaletteBar';
import { DetailStyler } from './components/panels/DetailStyler';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="app-layout">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: 'Inter, sans-serif', fontSize: '13px' },
        }}
      />
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
};

export default App;
