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
import { ModalsProvider } from '@mantine/modals';
import { LoadingOverlayProvider } from '@/context/LoadingOverlayContext';
import { useMediaQuery } from '@mantine/hooks';

export interface Page {
  path: string;
  label: string;
}

const pages: Page[] = [
  {path: '/new_catch', label: 'Pages.NewCatch'},
  {path: '/catches', label: 'Pages.Catches'},
  {path: '/statistics', label: 'Pages.Stats'},
  {path: '/user', label: 'Pages.Account'},
  {path: '/login', label: 'Pages.Account'},
  {path: '/signup', label: 'Pages.Account'},
];

export interface Tab {
  value: string;
  icon: TablerIcon;
  label: string;
  path: string;
}

const tabs: Tab[] = [
  { value: 'new_catch', icon: IconCirclePlus, label: 'Pages.NewCatch', path: '/new_catch' },
  { value: 'catches', icon: IconFish, label: 'Pages.Catches', path: '/catches' },
  { value: 'statistics', icon: IconChartBar, label: 'Pages.Stats', path: '/statistics' },
  { value: 'user', icon: IconUserCircle, label: 'Pages.Account', path: '/user' },
];

export default function AppShellWrapper({ children }: { children: any }) {
  const pathname = usePathname();
  const isSmallScreen = useMediaQuery('(max-width: 64em)');

  return (
    <GlobalStateProvider>
      <MantineProvider theme={theme} defaultColorScheme="dark" forceColorScheme="dark">
        <ModalsProvider>
          <Notifications styles={{ root: { transform: isSmallScreen ? 'translateY(calc(-65px - env(safe-area-inset-bottom))' : 'none' } }} />
          <LoadingOverlayProvider>
            <HeaderActionsProvider>
              <AppShell header={{ height: { base: rem(45), md: rem(60) } }} footer={{ height: rem(60) }} padding="0">
                <LayoutHeader pages={pages} tabs={tabs} pathname={pathname} />
                <AppShell.Main style={{ color: 'var(--mantine-color-text)' }} pb={{ base: "calc(var(--app-shell-footer-offset, 0rem) + var(--app-shell-padding) + env(safe-area-inset-bottom))", md: 0}}>{children}</AppShell.Main>
                <AppShell.Footer hiddenFrom="md" withBorder={false} className={classes.footer}>
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
          </LoadingOverlayProvider>
        </ModalsProvider>
      </MantineProvider>
    </GlobalStateProvider>
  );
}
