'use client';

import { useTranslations } from 'next-intl';
import { Box, Center, Container, FloatingIndicator, Paper, Tabs } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import classes from '../statistics/page.module.css';
import AnglersTab from '@/components/communityPage/AnglersTab/AnglersTab';
import { UserRole } from '@/lib/types/user';
import { handleApiError } from '@/lib/utils/handleApiError';
import { AllUsersResponse, UserAchievementsResponse } from '@/lib/types/responses';
import { getAllUsers } from '@/services/api/userService';
import { getAllUserAchievements } from '@/services/api/achievementService';
import { IAchievement } from '@/lib/types/achievement';
import { calculateLevel } from '@/lib/utils/levelUtils';
import EventsTab from '@/components/communityPage/EventsTab/EventsTab';
import { usePathname, useRouter } from 'next/navigation';
import { CatchUtils } from '@/lib/utils/catchUtils';
import { useGlobalState } from '@/context/GlobalState';

const TABS_CONFIG = [
  { value: 'anglers', labelKey: 'CommunityPage.Anglers' },
  { value: 'events', labelKey: 'CommunityPage.Events' },
];

const DEFAULT_TAB_VALUE = TABS_CONFIG[0].value;

export interface CommunityPageUserInfo {
  id?: string | null;
  username?: string;
  firstName: string;
  lastName?: string;
  role?: UserRole;
  level?: number;
}

export default function Page() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { catches } = useGlobalState();
  const [anglersUserInfos, setAnglersUserInfos] = useState<CommunityPageUserInfo[]>([]);
  const [eventsUserInfos, setEventsUserInfos] = useState<CommunityPageUserInfo[]>([]);
  const [achievements, setAchievements] = useState<IAchievement[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [rootRef, setRootRef] = useState<HTMLElement | null>(null);
  const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLElement | null>>({});

  const setControlRef = (val: string) => (node: HTMLElement | null) => {
    controlsRefs[val] = node;
    setControlsRefs(controlsRefs);
  };

  const getActiveTabFromHash = useCallback(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.substring(1);
      const currentTab = TABS_CONFIG.find(tab => tab.value === hash);
      return currentTab ? currentTab.value : DEFAULT_TAB_VALUE;
    }
    return DEFAULT_TAB_VALUE;
  }, []);

  const [activeTab, setActiveTab] = useState(getActiveTabFromHash());

  useEffect(() => {
    const handleHashChange = () => {
      setActiveTab(getActiveTabFromHash());
    };

    setActiveTab(getActiveTabFromHash());
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [getActiveTabFromHash]);

  const handleTabChange = (newTabValue: string | null) => {
    if (newTabValue && newTabValue !== activeTab) {
      setActiveTab(newTabValue);
      const newPath = `${pathname}#${newTabValue}`;

      // Update browser history correctly with hashes
      router.push(newPath, { scroll: false });
    }
  };

  const fetchAllAchievements = async (): Promise<IAchievement[]> => {
    try {
      const achievementsResponse: UserAchievementsResponse = await getAllUserAchievements();
      const achievementsData = achievementsResponse?.data;
      setAchievements(achievementsData);
      return achievementsData;
    } catch (error) {
      handleApiError(error, 'fetching achievements');
      throw error;
    }
  };

  const fetchAllUsers = async (): Promise<CommunityPageUserInfo[]> => {
    try {
      const usersResponse: AllUsersResponse = await getAllUsers();
      const usersData = usersResponse?.data?.users;
      setAnglersUserInfos(usersData);
      return usersData;
    } catch (error) {
      handleApiError(error, 'fetching users');
      throw error;
    }
  };

  useEffect(() => {
    const fetchDataAndProcess = async () => {
      setLoadingUsers(true);
      if (catches.length === 0) {
        return;
      }

      try {
        const [fetchedUsers, fetchedAchievements] = await Promise.all([
          fetchAllUsers(),
          fetchAllAchievements()
        ]);

        const unregisteredUsers: CommunityPageUserInfo[] = CatchUtils.getUniqueAnglers(catches)
          .filter((user) => !user.userId)
          .map((user) => ({ firstName: user.name }));

        const eventsUserInfos = [...fetchedUsers, ...unregisteredUsers];
        setEventsUserInfos(eventsUserInfos);

        const usersWithLevelInfo = fetchedUsers
          .map((user) => {
            const userXP = fetchedAchievements.filter(a => a.userId === user.id).reduce((acc, ach) => acc + ach.totalXP, 0);
            const level = calculateLevel(userXP);
            return { ...user, level };
          })
          .sort((a, b) => {
            return a.firstName.localeCompare(b.firstName);
          });

        

        setAnglersUserInfos(usersWithLevelInfo);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchDataAndProcess();
  }, [catches]);

  return (
    <>
      <Paper className={classes.tabsBar}>
        <Center w={'100%'}>
          <Container size={'sm'} p={0} w={'100%'}>
            <Tabs variant='none' value={activeTab} onChange={handleTabChange}>
              <Tabs.List ref={setRootRef} className={classes.list}>
                {TABS_CONFIG.map((tab) => (
                  <Tabs.Tab
                    key={tab.value}
                    value={tab.value}
                    className={classes.tab}
                    flex={1}
                  >
                    <Center h={'100%'} w={'100%'}>
                      <Box ref={setControlRef(tab.value)} pos={'absolute'} h={'100%'} w={'50%'} top={0}></Box>
                    </Center>
                    {t(tab.labelKey)}
                  </Tabs.Tab>
                ))}
                <FloatingIndicator
                  target={activeTab ? controlsRefs[activeTab] : null}
                  parent={rootRef}
                  className={classes.indicator}
                />
              </Tabs.List>
            </Tabs>
          </Container>
        </Center>
      </Paper>

      <Container size={'sm'} h={'100%'} p={0} className={classes.tabContainer}>
        {activeTab === TABS_CONFIG[0].value && (
          <AnglersTab userInfos={anglersUserInfos} loadingUsers={loadingUsers} />
        )}
        {activeTab === TABS_CONFIG[1].value && (
          <EventsTab allUsers={eventsUserInfos}/>
        )}
      </Container>
    </>
  );
}