import { Page, Tab } from "@/components/layout/AppShellWrapper/AppShellWrapper";
import { useHeaderActions } from "@/context/HeaderActionsContext";
import { AppShell, Container, Group, Text, Title } from "@mantine/core";
import CustomTab from "../../CustomTab/CustomTab";
import classes from "./LayoutHeader.module.css";
import React from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher";
import { useTranslations } from "next-intl";

export default function LayoutHeader({ pages, tabs, pathname }: { pages: Page[]; tabs: Tab[]; pathname: string }) {
  const t = useTranslations();
  const { actions, actionsDisabled } = useHeaderActions();

  return (
    <AppShell.Header withBorder={false} className={classes.header} bg={'var(--header-background-color)'} w={'100%'}>
      <Group p={0} m={0} h={'100%'} w={'100%'} justify="center" align="center">
        <Container p={0} m={0} h={'100%'} w={'100%'} size={'xl'}>
          <Group p={0} m={0} h={'100%'} justify="space-between" align="center" w={'100%'}>
            <Group visibleFrom="md" classNames={{ root: classes.logo_container }}>
              <Title order={1} classNames={{ root: classes.logo_title }}>
                <Text inherit fs={'italic'} c="rgba(0, 157, 255, 1)" component="span">
                  Kala
                </Text>
                <Text inherit fs={'italic'} c="var(--mantine-color-gray-2)" component="span">
                  Log
                </Text>
              </Title>
            </Group>
            <Group hiddenFrom="md" className={classes.page_header_content} w={'100%'} h={'100%'} pl={'var(--mantine-spacing-xs)'} pr={'var(--mantine-spacing-xs)'} grow align='center' c={'white'}>
              <Group justify="start">
                {React.isValidElement(actions) &&
                  React.cloneElement(actions as React.ReactElement<{ disabled?: boolean }>, {
                    disabled: actionsDisabled,
                  })}
              </Group>
              <Group justify="center">
                <Text inherit fw={600}>
                  {t(pages.find((page) => page.path === pathname)?.label)}
                </Text>
              </Group>
              <Group justify="end">
                <LanguageSwitcher />
              </Group>
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
