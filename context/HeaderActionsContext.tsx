import React, { createContext, useContext, useState } from 'react';

interface HeaderActionsState {
  actions: React.ReactNode;
  setActions: React.Dispatch<React.SetStateAction<React.ReactNode>>;
}

const HeaderActionsContext = createContext<HeaderActionsState | undefined>(undefined);

export const HeaderActionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [actions, setActions] = useState<React.ReactNode>(null);

  return (
    <HeaderActionsContext.Provider value={{ actions, setActions }}>
      {children}
    </HeaderActionsContext.Provider>
  );
};

export const useHeaderActions = () => {
  const context = useContext(HeaderActionsContext);
  if (!context) {
    throw new Error('useHeaderActions must be used within a HeaderActionsProvider');
  }
  return context;
};