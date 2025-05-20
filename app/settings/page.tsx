'use client';

import PushNotificationManager from '@/components/PushNotificationManager/PushNotificationManager';
import { useGlobalState } from '@/context/GlobalState';
import { useHeaderActions } from '@/context/HeaderActionsContext';
import { navigateBack } from '@/lib/utils/utils';
import { ActionIcon, Container, Paper, Stack, Title } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SettingsPage() {
  const t = useTranslations();
  const { isLoggedIn, jwtUserInfo } = useGlobalState();
  const { setActions, setPageTitle } = useHeaderActions();
  const router = useRouter();


  useEffect(() => {
    if (isLoggedIn === null) {
      return;
    } else if (!isLoggedIn || !jwtUserInfo?.username) {
      router.replace('/login');
    }
  }, [isLoggedIn, jwtUserInfo, router]);

  useEffect(() => {
    // Set the page title
    setPageTitle(t('Pages.Settings'));

    // Set Header Action (Back Button)
    setActions(
      <ActionIcon
        size="lg"
        variant="transparent"
        c="white"
        onClick={() => navigateBack(router, '/user')}
      >
        <IconChevronLeft style={{ width: '100%', height: '100%' }} />
      </ActionIcon>
    );

    return () => {
      setActions(null);
      setPageTitle(null);
    }
  }, [setActions, setPageTitle, t, router]);

  return (
    <Container p={'md'} size="sm">
      <Title c="white" order={2} mb="md" pl={4}>
        {t('SettingsPage.Title')}
      </Title>
      <Stack p={0} gap="sm" align="flex-start">
        <Paper p={'md'} w={'100%'} radius={'lg'} bg={"var(--my-ui-item-background-color)"}>
          <Stack p={0} gap={'md'}>
            <Title order={3} c={'white'}>{t('SettingsPage.PushNotifications')}</Title>
            <PushNotificationManager />
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
