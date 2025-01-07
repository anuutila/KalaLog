import { createContext, useContext, useState } from 'react';
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

  return (
    <LoadingOverlayContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      <LoadingOverlay visible={visible} overlayProps={{ blur: 2, zIndex: 2000, bg: 'rgba(0,0,0,0.5'}} />
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
