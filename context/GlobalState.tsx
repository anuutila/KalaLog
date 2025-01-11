'use client';

import { showNotification } from '@/lib/notifications/notifications';
import { ICatch } from '@/lib/types/catch';
import { JwtUserInfo } from '@/lib/types/jwtUserInfo';
import { CatchesResponse, ErrorResponse, UserInfoResponse } from '@/lib/types/responses';
import { handleApiError } from '@/lib/utils/handleApiError';
import { defaultSort, sortByDate, sortByTime } from '@/lib/utils/utils';
import { getCatches } from '@/services/api/catchService';
import { getUserInfo } from '@/services/api/userService';
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
        const userInfoResponse: UserInfoResponse = await getUserInfo();
        console.log(userInfoResponse.message);
        console.log('User info:', userInfoResponse.data?.jwtUserInfo);
        setIsLoggedIn(userInfoResponse.data.loggedIn);
        setJwtUserInfo(userInfoResponse.data.jwtUserInfo);
      } catch (error) {
        handleApiError(error, 'fetching user info');
        setIsLoggedIn(false);
        setJwtUserInfo(null);
      }
    };

    checkAuth();
  }, []);

  // Fetch all catches from the API
  const fetchCatches = async () => {
    setLoadingCatches(true);
    try {
      const catchesRespose: CatchesResponse = await getCatches();
      setCatches(catchesRespose.data);
      setCatchesError(null);
      if (catchesRespose.message.includes('validation')) {
        showNotification('warning', catchesRespose.message, { withTitle: true });
      }
    } catch (error) {
      handleApiError(error, 'fetching catches');
    } finally {
      setLoadingCatches(false);
    }
  };

  // Load catches once on initial load
  useEffect(() => {
    fetchCatches();
  }, []);

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
