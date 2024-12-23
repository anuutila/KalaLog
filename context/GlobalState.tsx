'use client';

import { ICatch } from '@/lib/types/catch';
import { JwtUser } from '@/lib/types/jwtUser';
import { CatchesResponse, ErrorResponse, UserInfoResponse } from '@/lib/types/responses';
import { IUser } from '@/lib/types/user';
import { sortByDate, sortByTime } from '@/lib/utils/utils';
import { set } from 'mongoose';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface GlobalState {
  isLoggedIn: boolean;
  jwtUser: JwtUser | null;
  catches: ICatch[];
  catchesError: string | null;
  loadingCatches: boolean;
  setJwtUser: (user: JwtUser) => void;
  fetchCatches: () => Promise<void>;
  logout: () => Promise<void>;
}

const GlobalContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [jwtUser, setJwtUser] = useState<JwtUser | null>(null);
  const [catches, setCatches] = useState<ICatch[]>([]);
  const [catchesError, setCatchesError] = useState<string | null>(null);
  const [loadingCatches, setLoadingCatches] = useState(false);

  // Fetch login status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoadingCatches(true);
        const response = await fetch('/api/userInfo');
        if (response.ok) {
          const userInfoResponse: UserInfoResponse = await response.json();
          console.log(userInfoResponse.message);
          console.log('User info:', userInfoResponse.data?.jwtUser);
          setIsLoggedIn(userInfoResponse.data.loggedIn);
          setJwtUser(userInfoResponse.data.jwtUser);
        } else {
          const errorResponse: ErrorResponse = await response.json();
          console.error('Error:', errorResponse.message, errorResponse.details);
          setIsLoggedIn(false);
          setJwtUser(null);
        }
      } catch (error) {
        console.error('Unexpected error fetching user info:', error);
        alert('An unexpected error occurred while fetching user info. Please try again.');
        setIsLoggedIn(false);
        setJwtUser(null);
      } finally {
        setLoadingCatches(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch catches information
  const fetchCatches = async () => {
    try {
      const response = await fetch('/api/catches');
      if (response.ok) {
        const catchesResponse: CatchesResponse = await response.json();
        const sortedCatches = sortByDate(sortByTime(catchesResponse.data)).reverse();
        setCatches(sortedCatches);
        setCatchesError(null);
      } else {
        const errorResponse: ErrorResponse = await response.json();
        console.error('Error:', errorResponse.message, errorResponse.details);
        // alert(`Error: ${errorData.message}`);
        setCatchesError(errorResponse.message);
      }
    } catch (error) {
      console.error('Unexpected error fetching catches:', error);
      alert('An unexpected error occurred while fetching catches. Please try again.');
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
        setJwtUser(null);
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
        jwtUser,
        catches,
        catchesError,
        loadingCatches,
        setJwtUser,
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
