'use client';

import { useTranslations } from 'next-intl';
import { Box, Center, Container, FloatingIndicator, Paper, Tabs } from '@mantine/core';
import { useEffect, useState } from 'react';
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

export interface CommunityPageUserInfo {
  id: string | null;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  level?: number;
}

export default function Page() {
  const t = useTranslations();
  const [userInfos, setUserInfos] = useState<CommunityPageUserInfo[]>([]);
  const [achievements, setAchievements] = useState<IAchievement[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [rootRef, setRootRef] = useState<HTMLElement | null>(null);
  const [value, setValue] = useState<string | null>('1');
  const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLElement | null>>({});

  const setControlRef = (val: string) => (node: HTMLElement | null) => {
    controlsRefs[val] = node;
    setControlsRefs(controlsRefs);
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
      setUserInfos(usersData);
      return usersData;
    } catch (error) {
      handleApiError(error, 'fetching users');
      throw error;
    }
  };

  useEffect(() => {
    const fetchDataAndProcess = async () => {
      setLoadingUsers(true);
      try {
        const [fetchedUsers, fetchedAchievements] = await Promise.all([
          fetchAllUsers(),
          fetchAllAchievements()
        ]);

        const usersWithLevelInfo = fetchedUsers
          .map((user) => {
            const userXP = fetchedAchievements.filter(a => a.userId === user.id).reduce((acc, ach) => acc + ach.totalXP, 0);
            const level = calculateLevel(userXP);
            return { ...user, level };
          })
          .sort((a, b) => {
            return a.firstName.localeCompare(b.firstName);
          });

        setUserInfos(usersWithLevelInfo);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchDataAndProcess();
  }, []);

  return (
    <>
      <Paper className={classes.tabsBar}>
        <Center w={'100%'}>
          <Container size={'sm'} p={0} w={'100%'}>
            <Tabs variant='none' value={value} onChange={setValue}>
              <Tabs.List ref={setRootRef} className={classes.list}>
                <Tabs.Tab value="1" className={classes.tab} flex={1}>
                  <Center h={'100%'} w={'100%'}>
                    <Box ref={setControlRef('1')} pos={'absolute'} h={'100%'} w={'50%'} top={0}></Box>
                  </Center>
                  {t('CommunityPage.Anglers')}
                </Tabs.Tab>
                <Tabs.Tab value="2" className={classes.tab} flex={1}>
                  <Center h={'100%'} w={'100%'}>
                    <Box ref={setControlRef('2')} pos={'absolute'} h={'100%'} w={'50%'} top={0}></Box>
                  </Center>
                  {t('CommunityPage.Events')}
                </Tabs.Tab>
                <FloatingIndicator
                  target={value ? controlsRefs[value] : null}
                  parent={rootRef}
                  className={classes.indicator}
                />
              </Tabs.List>
            </Tabs>
          </Container>
        </Center>
      </Paper>

      <Container size={'sm'} h={'100%'} p={0} className={classes.tabContainer}>
        {value === '1' ? (
          <AnglersTab userInfos={userInfos} loadingUsers={loadingUsers} />
        ) : (
          <EventsTab />
        )}
      </Container>
    </>
  );
}