'use client';

import React, { createContext, use, useContext, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { showNotification } from '@/lib/notifications/notifications';
import { IAchievement } from '@/lib/types/achievement';
import { ICatch } from '@/lib/types/catch';
import { JwtUserInfo } from '@/lib/types/jwtUserInfo';
import { CatchesResponse, UserAchievementsResponse, UserInfoResponse } from '@/lib/types/responses';
import { recalculateUserAchievements } from '@/lib/utils/achievementUtils';
import { handleApiError } from '@/lib/utils/handleApiError';
import { getUserAchievements } from '@/services/api/achievementService';
import { getCatches } from '@/services/api/catchService';
import { getUserInfo } from '@/services/api/userService';
import { usePathname, useSearchParams } from 'next/navigation';
import useHash from '@/hooks/useHash';

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
  achievements: IAchievement[];
  previousPath: string | null;
}

const GlobalContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hash = useHash();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [jwtUserInfo, setJwtUserInfo] = useState<JwtUserInfo | null>(null);
  const [catches, setCatches] = useState<ICatch[]>([]);
  const [catchesError, setCatchesError] = useState<string | null>(null);
  const [loadingCatches, setLoadingCatches] = useState(false);
  // Map of user IDs to display names that are used if there are duplicae names
  const [displayNameMap, setDisplayNameMap] = useState<{ [userId: string]: string }>({});
  const [achievements, setAchievements] = useState<IAchievement[]>([]);

  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  const t = useTranslations();

  // Fetch login status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking user info...');
        const userInfoResponse: UserInfoResponse = await getUserInfo();
        console.log(userInfoResponse.message);
        console.log('User info:', userInfoResponse.data?.jwtUserInfo);
        console.log('Logged in:', userInfoResponse.data?.loggedIn);
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

  async function fetchAchievements() {
    let currentAchievements: IAchievement[] = [];
    try {
      const UserAchievementsResponse: UserAchievementsResponse = await getUserAchievements(jwtUserInfo?.userId ?? '');
      currentAchievements = UserAchievementsResponse.data;
    } catch (error) {
      handleApiError(error, 'achievement fetching');
    }
    setAchievements(currentAchievements);
  }

  // Load catches once on initial load
  useEffect(() => {
    fetchCatches();
  }, []);

  // Load achievements when user is logged in
  useEffect(() => {
    if (jwtUserInfo?.userId) {
      fetchAchievements();
    }
  }, [jwtUserInfo]);

  useEffect(() => {
    resolveDisplayNames();
    if (catches.length > 0 && isLoggedIn) {
      // Recalculate achievements when catches change (catch added, removed or edited)
      resolveUserAchievements();
    }
  }, [catches, isLoggedIn]);

  async function resolveUserAchievements() {
    const { updates, count } = await recalculateUserAchievements(jwtUserInfo?.userId ?? '', catches, t, true);
    setAchievements(updates);
  }

  function resolveDisplayNames(): void {
    const nameOccurrences: { [firstName: string]: Set<string | null> } = {};
    const idToDisplayNameMap: { [userId: string]: string } = {};

    // Collect names and their associated user IDs (null for unregistered users)
    catches.forEach((catchItem) => {
      // Extract the first word from the name to ensure only the first name is stored
      const firstName = catchItem.caughtBy.name.split(' ')[0];
      const userId = catchItem.caughtBy.userId ?? null;

      if (!nameOccurrences[firstName]) {
        nameOccurrences[firstName] = new Set();
      }
      nameOccurrences[firstName].add(userId);
    });

    // Build display names based on conditions
    catches.forEach((catchItem) => {
      const { userId, name, username, lastName } = catchItem.caughtBy;
      const userIdsForName = nameOccurrences[name];

      // Only modify registered users
      if (userId) {
        const hasDuplicateRegisteredUsers = [...userIdsForName].filter((id) => id).length > 1;
        const hasUnregisteredDuplicate = userIdsForName.has(null);

        if (hasDuplicateRegisteredUsers || hasUnregisteredDuplicate) {
          // Add the display name for registered users with duplicates
          const displayName = lastName ? `${name} ${lastName.charAt(0)}.` : `${name} (${username})`;

          idToDisplayNameMap[userId] = displayName;
        }
      }
    });

    setDisplayNameMap(idToDisplayNameMap);
  }

  useEffect(() => {
    const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '') + hash;

    // Avoid updating the path with the hash if the pathname is '/catches' or '/user/<username>'
    // Otherwise, the #map or #events will remain in the URL and mess up the navigation
    if ((pathname === '/catches' || pathname.startsWith('/user/')) && fullPath && hash) {
      return;
    }

    if (fullPath !== currentPath) {
      const nonHistoryPaths = ['/login', '/signup'];
      if (currentPath && !nonHistoryPaths.includes(currentPath)) {
          setPreviousPath(currentPath);
      }
      setCurrentPath(fullPath);
    }
  }, [pathname, searchParams, hash, currentPath, setCurrentPath, setPreviousPath]);

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
        achievements,
        previousPath,
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
