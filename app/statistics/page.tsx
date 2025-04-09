'use client';

import { useTranslations } from 'next-intl';
import { Center, Container, FloatingIndicator, Paper, Tabs } from '@mantine/core';
import { useState } from 'react';
import classes from './page.module.css';
import OverviewTab from '@/components/statisticsPage/OverviewTab/OverviewTab';
import LeaderboardsTab from '@/components/statisticsPage/LeaderboardsTab/LeaderboardsTab';

export default function Page() {
  const t = useTranslations();
  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
  const [value, setValue] = useState<string | null>('1');
  const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLButtonElement | null>>({});
  const setControlRef = (val: string) => (node: HTMLButtonElement) => {
    controlsRefs[val] = node;
    setControlsRefs(controlsRefs);
  };

  return (
    <>
    <Paper className={classes.tabsBar}>
    <Center  w={'100%'}>
      <Container size={'sm'} p={0} w={'100%'}>
        <Tabs variant='none' value={value} onChange={setValue}>
          <Tabs.List ref={setRootRef} className={classes.list}>
            <Tabs.Tab value="1" ref={setControlRef('1')} className={classes.tab} flex={1}>
              {t('StatisticsPage.Overview')}
            </Tabs.Tab>
            <Tabs.Tab value="2" ref={setControlRef('2')} className={classes.tab} flex={1}>
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
      <Container size={'sm'} p={'md'} className={classes.tabContainer}>
        {value === '1' ? (
          <OverviewTab />
        ) : (
          <LeaderboardsTab />
        )}
      </Container>
    </>
  );
}