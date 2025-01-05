'use client';

import React from 'react';
import { AppShell, Group, MantineProvider, rem } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { usePathname } from 'next/navigation';
import CustomTab from '@/components/CustomTab/CustomTab';
import LayoutHeader from '@/components/layout/LayoutHeader/LayoutHeader';
import classes from './AppShellWrapper.module.css';
import { theme } from '@/theme';
import { GlobalStateProvider } from '@/context/GlobalState';
import { HeaderActionsProvider } from '@/context/HeaderActionsContext';
import { IconChartBar, IconCirclePlus, IconFish, IconUserCircle, TablerIcon } from '@tabler/icons-react';

export interface Page {
  path: string;
  label: string;
}

const pages: Page[] = [
  {path: '/new_catch', label: 'Uusi saalis'},
  {path: '/catches', label: 'Saaliit'},
  {path: '/statistics', label: 'Tilastot'},
  {path: '/user', label: 'Käyttäjä'},
  {path: '/login', label: 'Käyttäjä'},
  {path: '/signup', label: 'Käyttäjä'},
];

export interface Tab {
  value: string;
  icon: TablerIcon;
  label: string;
  path: string;
}

const tabs: Tab[] = [
  { value: 'new_catch', icon: IconCirclePlus, label: 'Uusi saalis', path: '/new_catch' },
  { value: 'catches', icon: IconFish, label: 'Saaliit', path: '/catches' },
  { value: 'statistics', icon: IconChartBar, label: 'Tilastot', path: '/statistics' },
  { value: 'user', icon: IconUserCircle, label: 'Käyttäjä', path: '/user' },
];

export default function AppShellWrapper({ children }: { children: any }) {
  const pathname = usePathname();

  return (
    <GlobalStateProvider>
      <MantineProvider theme={theme} defaultColorScheme="dark" forceColorScheme="dark">
        <Notifications styles={{ root: { transform: 'translateY(-65px)' } }} />
        <HeaderActionsProvider>
          <AppShell header={{ height: { base: rem(45), md: rem(60) } }} footer={{ height: rem(60) }} padding="0">
            <LayoutHeader pages={pages} tabs={tabs} pathname={pathname} />
            <AppShell.Main style={{ color: 'var(--mantine-color-text)' }}>{children}</AppShell.Main>
            <AppShell.Footer hiddenFrom="md" className={classes.footer} style={{ background: 'var(--footer-background-color)' }}>
              <Group className={classes.tabs_group_footer}>
                {tabs.map((tab) => {
                  const isActive = pathname === tab.path || ((pathname.startsWith('/login') || pathname.startsWith('/signup')) && tab.path === '/user');
                  return (
                    <CustomTab
                      key={tab.value}
                      path={tab.path}
                      icon={tab.icon}
                      label={tab.label}
                      isActive={isActive}
                    />
                  );
                })}
              </Group>
            </AppShell.Footer>
          </AppShell>
        </HeaderActionsProvider>
      </MantineProvider>
    </GlobalStateProvider>
  );
}
