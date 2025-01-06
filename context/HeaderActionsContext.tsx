import React, { createContext, useContext, useState } from 'react';

interface HeaderActionsState {
  actions: React.ReactNode;
  setActions: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  actionsDisabled: boolean;
  setActionsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const HeaderActionsContext = createContext<HeaderActionsState | undefined>(undefined);

export const HeaderActionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [actions, setActions] = useState<React.ReactNode>(null);
  const [actionsDisabled, setActionsDisabled] = useState<boolean>(false);

  return (
    <HeaderActionsContext.Provider value={{ actions, setActions, actionsDisabled, setActionsDisabled }}>
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