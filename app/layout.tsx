'use client';

import '@mantine/core/styles.css';
import '../styles.css';

import React, { useState } from 'react';
import { IconChartBar, IconCirclePlus, IconFish, IconUserCircle } from '@tabler/icons-react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AppShell, ColorSchemeScript, Group, MantineProvider, rem, Text, Title } from '@mantine/core';
import CustomTab from '../components/CustomTab/CustomTab';
import { theme } from '../theme';
import classes from './layout.module.css';
import { usePathname } from 'next/navigation';
import { GlobalStateProvider } from '@/context/GlobalState';

const tabs = [
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
            <AppShell header={{ height: rem(60) }} padding="0">
              <AppShell.Header withBorder={false} className={classes.header}>
                <Group classNames={{ root: classes.title_container }}>
                  <Title order={1} classNames={{ root: classes.title }}>
                    {/* <Text inherit fs={'italic'} variant="gradient" component="span" gradient={{ from: 'rgba(0, 136, 255, 1)', to: 'rgba(0, 255, 255, 1)', deg: 180 }}>
                    Kala
                  </Text> */}
                    <Text inherit fs={'italic'} c="rgba(0, 157, 255, 1)" component="span">
                      Kala
                    </Text>
                    <Text inherit fs={'italic'} c="var(--mantine-color-gray-2)" component="span">
                      Log
                    </Text>
                  </Title>
                </Group>
                <Group classNames={{ root: classes.tabs_group }}>
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
              </AppShell.Header>
              <AppShell.Main>{children}</AppShell.Main>
            </AppShell>
          </MantineProvider>
          <SpeedInsights />
          <Analytics />
        </GlobalStateProvider>
      </body>
    </html>
  );
}
