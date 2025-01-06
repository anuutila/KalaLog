'use client';

import { showNotification } from '@/lib/notifications/notifications';
import { ICatch } from '@/lib/types/catch';
import { JwtUserInfo } from '@/lib/types/jwtUserInfo';
import { CatchesResponse, ErrorResponse, UserInfoResponse } from '@/lib/types/responses';
import { defaultSort, sortByDate, sortByTime } from '@/lib/utils/utils';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface GlobalState {
  isLoggedIn: boolean;
  jwtUserInfo: JwtUserInfo | null;
  catches: ICatch[];
  setCatches: React.Dispatch<React.SetStateAction<ICatch[]>>;
  catchesError: string | null;
  loadingCatches: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setJwtUserInfo: React.Dispatch<React.SetStateAction<JwtUserInfo | null>>;
  fetchCatches: () => Promise<void>;
  logout: () => Promise<void>;
}

const GlobalContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [jwtUserInfo, setJwtUserInfo] = useState<JwtUserInfo | null>(null);
  const [catches, setCatches] = useState<ICatch[]>([]);
  const [catchesError, setCatchesError] = useState<string | null>(null);
  const [loadingCatches, setLoadingCatches] = useState(false);

  // Fetch login status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/userInfo');
        if (response.ok) {
          const userInfoResponse: UserInfoResponse = await response.json();
          console.log(userInfoResponse.message);
          console.log('User info:', userInfoResponse.data?.jwtUserInfo);
          setIsLoggedIn(userInfoResponse.data.loggedIn);
          setJwtUserInfo(userInfoResponse.data.jwtUserInfo);
        } else {
          const errorResponse: ErrorResponse = await response.json();
          console.error('Error:', errorResponse.message, errorResponse.details);
          showNotification('error', errorResponse.message, { withTitle: true });
          setIsLoggedIn(false);
          setJwtUserInfo(null);
        }
      } catch (error) {
        console.error('Unexpected error fetching user info:', error);
        showNotification('error', 'An unexpected error occurred while fetching user info.', { withTitle: true });
        setIsLoggedIn(false);
        setJwtUserInfo(null);
      }
    };

    checkAuth();
  }, []);

  // Fetch all catches from the server
  const fetchCatches = async () => {
    try {
      setLoadingCatches(true);
      const response = await fetch('/api/catches');
      if (response.ok) {
        const catchesResponse: CatchesResponse = await response.json();
        const sortedCatches = defaultSort(catchesResponse.data);
        setCatches(sortedCatches);
        setCatchesError(null);
        if (catchesResponse.message.includes('validation')) {
          showNotification('warning', catchesResponse.message, { withTitle: true });
        }
      } else {
        const errorResponse: ErrorResponse = await response.json();
        console.error('Error:', errorResponse.message, errorResponse.details);
        showNotification('error', errorResponse.message, { withTitle: true });
        setCatchesError(errorResponse.message);
      }
    } catch (error) {
      console.error('Unexpected error fetching catches:', error);
      showNotification('error', 'An unexpected error occurred while fetching catches. Please try again.', {
        withTitle: true,
      });
    } finally {
      setLoadingCatches(false);
    }
  };

  // Load catches once on initial load
  useEffect(() => {
    fetchCatches();
  }, []);

  const logout = async () => {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) {
        // Clear global state
        setIsLoggedIn(false);
        setJwtUserInfo(null);
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.message, errorData.details);
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Unexpected error logging out:', error);
      alert('An unexpected error occurred while logging out.');
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        jwtUserInfo,
        catches,
        setCatches,
        catchesError,
        loadingCatches,
        setIsLoggedIn,
        setJwtUserInfo,
        fetchCatches,
        logout,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
