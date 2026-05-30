import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useIsMobile } from './hooks/useIsMobile';
import { DesktopLayout } from './layouts/DesktopLayout';
import { MobileLayout } from './layouts/MobileLayout';

const App: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <Toaster
        position={isMobile ? 'bottom-center' : 'top-right'}
        toastOptions={{
          duration: 3000,
          style: { fontFamily: 'Inter, sans-serif', fontSize: '13px' },
        }}
      />
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </>
  );
};

export default App;
