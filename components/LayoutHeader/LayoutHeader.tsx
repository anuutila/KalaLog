import { Tab } from "@/app/layout";
import { useHeaderActions } from "@/context/HeaderActionsContext";
import { AppShell, Group, Text, Title } from "@mantine/core";
import CustomTab from "../CustomTab/CustomTab";
import classes from "./LayoutHeader.module.css";

export default function LayoutHeader({ tabs, pathname }: { tabs: Tab[]; pathname: string }) {
  const { actions } = useHeaderActions();

  return (
    <AppShell.Header withBorder={false} className={classes.header}>
      <Group classNames={{ root: classes.logo_container }}>
        <Title order={1} classNames={{ root: classes.logo_title }}>
          <Text inherit fs={'italic'} c="rgba(0, 157, 255, 1)" component="span">
            Kala
          </Text>
          <Text inherit fs={'italic'} c="var(--mantine-color-gray-2)" component="span">
            Log
          </Text>
        </Title>
      </Group>
      <Group className={classes.page_header_content} w={'100%'} h={'100%'} pl={'var(--mantine-spacing-xs)'} pr={'var(--mantine-spacing-xs)'} grow align='center' c={'white'}>
        <Group justify="start">{actions}</Group>
        <Group justify="center">
          <Text inherit fw={600}>
            {tabs.find((tab) => tab.path === pathname)?.label}
          </Text>
        </Group>
        <Group justify="end"></Group>
      </Group>
      <Group classNames={{ root: classes.tabs_group_header }}>
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
  );
}
