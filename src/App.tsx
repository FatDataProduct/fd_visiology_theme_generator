import React from 'react';
import { Toaster } from 'react-hot-toast';
import { TopBar } from './components/TopBar';
import { LivePreview } from './components/preview/LivePreview';
import { BottomBar } from './components/panels/BottomBar';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="app-layout">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            background: 'rgba(20,20,35,0.95)',
            color: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(16px)',
          },
        }}
      />
      <TopBar />
      <div className="main-shell">
        <BottomBar />
        <LivePreview />
      </div>
      <Footer />
    </div>
  );
};

export default App;
