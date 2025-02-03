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
  isLoggedIn: boolean | null;
  jwtUserInfo: JwtUserInfo | null;
  catches: ICatch[];
  setCatches: React.Dispatch<React.SetStateAction<ICatch[]>>;
  catchesError: string | null;
  loadingCatches: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean | null>>;
  setJwtUserInfo: React.Dispatch<React.SetStateAction<JwtUserInfo | null>>;
  fetchCatches: () => Promise<void>;
  displayNameMap: { [userId: string]: string };
}

const GlobalContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [jwtUserInfo, setJwtUserInfo] = useState<JwtUserInfo | null>(null);
  const [catches, setCatches] = useState<ICatch[]>([]);
  const [catchesError, setCatchesError] = useState<string | null>(null);
  const [loadingCatches, setLoadingCatches] = useState(false);
  // Map of user IDs to display names that are used if there are duplicae names
  const [displayNameMap, setDisplayNameMap] = useState<{ [userId: string]: string }>({}); 

  // Fetch login status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking user info...');
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

  useEffect(() => {
    if (catches.length > 0) {
      const nameOccurrences: { [firstName: string]: Set<string | null> } = {};
      const idToDisplayNameMap: { [userId: string]: string } = {};
  
      // Collect names and their associated user IDs (null for unregistered users)
      catches.forEach((catchItem) => {
        const name = catchItem.caughtBy.name;
        const userId = catchItem.caughtBy.userId ?? null;
        if (!nameOccurrences[name]) {
          nameOccurrences[name] = new Set();
        }
        nameOccurrences[name].add(userId);
      });
  
      // Build display names based on conditions
      catches.forEach((catchItem) => {
        const { userId, name, username, lastName } = catchItem.caughtBy;
        const userIdsForName = nameOccurrences[name];
  
        // Only modify registered users
        if (userId) {
          const hasDuplicateRegisteredUsers = [...userIdsForName].filter(id => id).length > 1;
          const hasUnregisteredDuplicate = userIdsForName.has(null);
  
          if (hasDuplicateRegisteredUsers || hasUnregisteredDuplicate) {
            // Add the display name for registered users with duplicates
            const displayName = lastName
              ? `${name} ${lastName.charAt(0)}.`
              : `${name} (${username})`;
  
            idToDisplayNameMap[userId] = displayName;
          }
        }
      });
  
      setDisplayNameMap(idToDisplayNameMap);
    }
  }, [catches]);

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
        displayNameMap,
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
