import React from 'react';
import { useTranslations } from 'next-intl';
import { AppShell, Box, Container, Group, Text, Title } from '@mantine/core';
import LanguageSwitcher from '@/components/LanguageSwitcher/LanguageSwitcher';
import { Page, Tab } from '@/components/layout/AppShellWrapper/AppShellWrapper';
import { useHeaderActions } from '@/context/HeaderActionsContext';
import CustomTab from '../../CustomTab/CustomTab';
import classes from './LayoutHeader.module.css';
import { getPageLabelKey } from '@/lib/utils/utils';

export default function LayoutHeader({ pages, tabs, pathname }: { pages: Page[]; tabs: Tab[]; pathname: string }) {
  const t = useTranslations();
  const { actions, actionsDisabled, pageTitle } = useHeaderActions();

  const defaultLabelKey = getPageLabelKey(pathname);
  const titleToDisplay = pageTitle || t(defaultLabelKey);

  return (
    <AppShell.Header withBorder={false} className={classes.header} bg="var(--header-background-color)" w="100%">
      <Group p={0} m={0} h="100%" w="100%" justify="center" align="center">
        <Container p={0} m={0} h="100%" w="100%" size="xl">
          <Group p={0} m={0} h="100%" justify="space-between" align="center" w="100%">
            <Group visibleFrom="md" classNames={{ root: classes.logo_container }}>
              <Title order={1} classNames={{ root: classes.logo_title }}>
                <Text inherit fs="italic" c="rgba(0, 157, 255, 1)" component="span">
                  Kala
                </Text>
                <Text inherit fs="italic" c="var(--mantine-color-gray-2)" component="span">
                  Log
                </Text>
              </Title>
            </Group>
            <Group
              hiddenFrom="md"
              className={classes.page_header_content}
              w="100%"
              h="100%"
              pl="var(--mantine-spacing-xs)"
              pr="var(--mantine-spacing-xs)"
              align="center"
              c="white"
              gap={0}
            >
              <Box flex={1}>
                <Group justify="start">
                  {React.isValidElement(actions) &&
                    React.cloneElement(actions as React.ReactElement<{ disabled?: boolean }>, {
                      disabled: actionsDisabled,
                    })}
                </Group>
              </Box>
              <Box flex={3}>
                <Group justify="center" >
                  <Text inherit fw={600} style={{ textAlign: 'center' }}>
                    {titleToDisplay}
                  </Text>
                </Group>
              </Box>
              <Box flex={1}>
                <Group justify="end">
                  <LanguageSwitcher />
                </Group>
              </Box>
            </Group>
            <Group visibleFrom="md" classNames={{ root: classes.tabs_group_header }}>
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
          </Group>
        </Container>
      </Group>
    </AppShell.Header>
  );
}
