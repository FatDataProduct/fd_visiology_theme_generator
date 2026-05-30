import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useIsMobile } from './hooks/useIsMobile';
import { DesktopShell } from './layouts/DesktopShell';
import { MobileLayout } from './layouts/MobileLayout';
import { useThemeStore } from './store/themeStore';

const toasterOptions = {
  duration: 3000,
  style: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '12px',
    background: 'rgba(20,20,35,0.95)',
    color: 'rgba(255,255,255,0.9)',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(16px)',
  },
} as const;

const App: React.FC = () => {
  const isMobile = useIsMobile();
  const setActiveSheet = useThemeStore((s) => s.setActiveSheet);
  const setMobileMenuOpen = useThemeStore((s) => s.setMobileMenuOpen);

  const setPreviewScale = useThemeStore((s) => s.setPreviewScale);

  useEffect(() => {
    if (isMobile) {
      setActiveSheet('echarts');
      setMobileMenuOpen(false);
      setPreviewScale(100);
    }
  }, [isMobile, setActiveSheet, setMobileMenuOpen, setPreviewScale]);

  return (
    <div className="app-layout">
      <Toaster
        position={isMobile ? 'top-center' : 'top-right'}
        toastOptions={toasterOptions}
      />
      {isMobile ? <MobileLayout /> : <DesktopShell />}
    </div>
  );
};

export default App;
