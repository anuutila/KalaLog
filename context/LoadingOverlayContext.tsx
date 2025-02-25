import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { LoadingOverlay } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import classes from './LoadingOverlayContext.module.css';

interface LoadingOverlayContextProps {
  showLoading: () => void;
  hideLoading: () => void;
}

const LoadingOverlayContext = createContext<LoadingOverlayContextProps | undefined>(undefined);

export const LoadingOverlayProvider = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);

  const showLoading = () => setVisible(true);
  const hideLoading = () => setVisible(false);

  const isSmallScreen = useMediaQuery('(max-width: 64em)');

  const scrollPositionRef = useRef(0);

  useEffect(() => {
    if (!isSmallScreen) {
      if (visible) {
        // Disable scrolling
        document.documentElement.style.overflow = 'hidden';
      } else {
        document.documentElement.style.overflow = '';
      }
      return () => {
        document.documentElement.style.overflow = '';
      };
    }
  }, [visible]);

  useEffect(() => {
    if (isSmallScreen) {
      if (visible) {
        // Save the current scroll position
        scrollPositionRef.current = window.scrollY;
        // Disable scrolling
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed'; // Prevent content shift on mobile
        document.body.style.top = `-${scrollPositionRef.current}px`; // Keep scroll position
      } else {
        // Restore scrolling
        document.body.style.position = '';
        document.body.style.top = '';
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        // Restore scroll position
        window.scrollTo(0, scrollPositionRef.current);
      }
      return () => {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
      };
    }
  }, [visible]);

  return (
    <LoadingOverlayContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      <LoadingOverlay
        visible={visible}
        classNames={{ root: classes.loading_overlay_root, loader: classes.loading_overlay_loader }}
        overlayProps={{ blur: 2, zIndex: 2000, bg: 'rgba(0,0,0,0.5)', w: '100dvw', h: '100dvh', fixed: true }}
        w={'100dvw'}
        h={'100dvh'}
      />
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
