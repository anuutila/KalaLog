'use client';

import { useTranslations } from 'next-intl';
import { Box, Center, Container, FloatingIndicator, Paper, Tabs } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import classes from '../statistics/page.module.css';
import AnglersTab from '@/components/communityPage/AnglersTab/AnglersTab';
import { IPublicUserProfile } from '@/lib/types/user';
import { handleApiError } from '@/lib/utils/handleApiError';
import { AllUserProfilesResponse } from '@/lib/types/responses';
import { getAllUsers } from '@/services/api/userService';
import EventsTab from '@/components/communityPage/EventsTab/EventsTab';
import { usePathname, useRouter } from 'next/navigation';
import { CatchUtils } from '@/lib/utils/catchUtils';
import { useGlobalState } from '@/context/GlobalState';

const TABS_CONFIG = [
  { value: 'anglers', labelKey: 'CommunityPage.Anglers' },
  { value: 'events', labelKey: 'CommunityPage.Events' },
];

const DEFAULT_TAB_VALUE = TABS_CONFIG[0].value;

export interface UnregisteredUserInfo {
  firstName: string;
}

export default function Page() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { catches } = useGlobalState();
  const [anglersUserInfos, setAnglersUserInfos] = useState<IPublicUserProfile[]>([]);
  const [eventsUserInfos, setEventsUserInfos] = useState<(IPublicUserProfile | UnregisteredUserInfo)[]>([]);
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

  const fetchAllUsers = async (): Promise<IPublicUserProfile[]> => {
    try {
      const usersResponse: AllUserProfilesResponse = await getAllUsers();
      const usersData = usersResponse?.data;
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
        const [fetchedUsers] = await Promise.all([
          fetchAllUsers(),
        ]);

        const unregisteredUsers: UnregisteredUserInfo[] = CatchUtils.getUniqueAnglers(catches)
          .filter((user) => !user.userId)
          .map((user) => ({ firstName: user.name }));

        const eventsUserInfos = [...fetchedUsers, ...unregisteredUsers];
        setEventsUserInfos(eventsUserInfos);

        const anglersTabUserInfos = fetchedUsers
          .toSorted((a, b) => {
            return a.firstName.localeCompare(b.firstName);
          });

        setAnglersUserInfos(anglersTabUserInfos);
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