'use client';

import { useTranslations } from 'next-intl';
import { Box, Center, Container, FloatingIndicator, Paper, Tabs } from '@mantine/core';
import { useState } from 'react';
import classes from './page.module.css';
import OverviewTab from '@/components/statisticsPage/OverviewTab/OverviewTab';
import LeaderboardsTab from '@/components/statisticsPage/LeaderboardsTab/LeaderboardsTab';
import { useGlobalState } from '@/context/GlobalState';

export default function Page() {
  const t = useTranslations();
  const { catches, jwtUserInfo, displayNameMap } = useGlobalState();
  const [rootRef, setRootRef] = useState<HTMLElement | null>(null);
  const [value, setValue] = useState<string | null>('1');
  const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLElement | null>>({});

  const setControlRef = (val: string) => (node: HTMLElement | null) => {
    controlsRefs[val] = node;
    setControlsRefs(controlsRefs);
  };

  return (
    <>
      <Paper className={classes.tabsBar}>
        <Center w={'100%'}>
          <Container size={'sm'} p={0} w={'100%'}>
            <Tabs variant='none' value={value} onChange={setValue}>
              <Tabs.List ref={setRootRef} className={classes.list}>
                <Tabs.Tab pos={'relative'} value="1" className={classes.tab} flex={1}>
                  <Center h={'100%'} w={'100%'}>
                    <Box ref={setControlRef('1')} pos={'absolute'} h={'100%'} w={'50%'} top={0}></Box>
                  </Center>
                  {t('StatisticsPage.Overview')}
                </Tabs.Tab>
                <Tabs.Tab value="2" className={classes.tab} flex={1}>
                  <Center h={'100%'} w={'100%'}>
                    <Box ref={setControlRef('2')} pos={'absolute'} h={'100%'} w={'50%'} top={0}></Box>
                  </Center>
                  {t('StatisticsPage.Leaderboards')}
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
          <OverviewTab catches={catches} />
        ) : (
          <LeaderboardsTab catches={catches} userInfo={jwtUserInfo} userDisplayNameMap={displayNameMap} />
        )}
      </Container>
    </>
  );
}