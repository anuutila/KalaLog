import React, { createContext, useContext, useState } from 'react';

interface HeaderActionsState {
  actions: React.ReactNode;
  setActions: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  test: string;
  setTest: React.Dispatch<React.SetStateAction<string>>;
}

const HeaderActionsContext = createContext<HeaderActionsState | undefined>(undefined);

export const HeaderActionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [actions, setActions] = useState<React.ReactNode>(null);
  const [test, setTest] = useState<string>('');

  return (
    <HeaderActionsContext.Provider value={{ actions, setActions, test, setTest }}>
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