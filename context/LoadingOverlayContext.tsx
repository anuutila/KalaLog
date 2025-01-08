import { createContext, useContext, useEffect, useState } from 'react';
import { LoadingOverlay } from '@mantine/core';

interface LoadingOverlayContextProps {
  showLoading: () => void;
  hideLoading: () => void;
}

const LoadingOverlayContext = createContext<LoadingOverlayContextProps | undefined>(undefined);

export const LoadingOverlayProvider = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);

  const showLoading = () => setVisible(true);
  const hideLoading = () => setVisible(false);

  useEffect(() => {
    if (visible) {
      document.documentElement.style.overflow = 'hidden'; // Prevent scrolling on <html>
      document.body.style.overflow = 'hidden'; // Prevent scrolling on <body>
      document.body.style.position = 'fixed'; // Prevent content shift on mobile
      // document.body.style.top = `-${window.scrollY}px`; // Keep scroll position
    } else {
      // const scrollY = document.body.style.top;
      document.body.style.position = '';
      // document.body.style.top = '';
      document.documentElement.style.overflow = ''; // Restore scrolling on <html>
      document.body.style.overflow = ''; // Restore scrolling on <body>
      // window.scrollTo(0, parseInt(scrollY || '0') * -1); // Restore scroll position
    }
  
    return () => {
      document.documentElement.style.overflow = ''; // Restore scrolling on <html>
      document.body.style.overflow = ''; // Restore scrolling on <body>
      document.body.style.position = ''; // Clean up on unmount
      // document.body.style.top = ''; // Reset top style
    }
  }, [visible]);

  return (
    <LoadingOverlayContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      <LoadingOverlay visible={visible} overlayProps={{ blur: 2, zIndex: 2000, bg: 'rgba(0,0,0,0.5', w: '100dvw', h: '100dvh'}} w={'100dvw'} h={'100dvh'}/>
    </LoadingOverlayContext.Provider>
  );
};

export const useLoadingOverlay = () => {
  const context = useContext(LoadingOverlayContext);
  if (!context) {
    throw new Error('useLoadingOverlay must be used within a LoadingOverlayProvider');
  }
  return context;
};
