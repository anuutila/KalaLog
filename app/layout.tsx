'use client';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '../styles.css';

import React, { useState } from 'react';
import { IconChartBar, IconCirclePlus, IconFish, IconUserCircle, TablerIcon } from '@tabler/icons-react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AppShell, ColorSchemeScript, Group, MantineProvider, rem, Text, Title } from '@mantine/core';
import CustomTab from '../components/CustomTab/CustomTab';
import { theme } from '../theme';
import classes from './layout.module.css';
import { usePathname } from 'next/navigation';
import { GlobalStateProvider } from '@/context/GlobalState';
import { Notifications } from '@mantine/notifications';
import { HeaderActionsProvider, useHeaderActions } from '@/context/HeaderActionsContext';
import LayoutHeader from '@/components/LayoutHeader/LayoutHeader';

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
  { value: 'login', icon: IconUserCircle, label: 'Kirjaudu', path: '/login' },
];

export default function RootLayout({ children }: { children: any }) {
  const pathname = usePathname();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>KalaLog</title>
        <ColorSchemeScript defaultColorScheme="dark" forceColorScheme="dark" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no" />
      </head>
      <body>
        <GlobalStateProvider>
          <MantineProvider theme={theme} defaultColorScheme="dark" forceColorScheme="dark">
            <Notifications />
            <HeaderActionsProvider>
              <AppShell header={{ height: {base: rem(45), md: rem(60)} }} footer={{ height: rem(60) }} padding="0">
                <LayoutHeader 
                  tabs={tabs}
                  pathname={pathname}
                />
                <AppShell.Main>{children}</AppShell.Main>
                <AppShell.Footer hiddenFrom='md'>
                  <Group classNames={{ root: classes.tabs_group_footer }}>
                    {tabs.map((tab) => (
                      <CustomTab
                        key={tab.value}
                        path={tab.path}
                        icon={tab.icon}
                        label={tab.label}
                        isActive={pathname === tab.path}
                      />
                    ))}
                  </Group>
                </AppShell.Footer>
              </AppShell>
            </HeaderActionsProvider>
          </MantineProvider>
          <SpeedInsights />
          <Analytics />
        </GlobalStateProvider>
      </body>
    </html>
  );
}
