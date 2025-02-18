'use client';

import AdminPanel from "@/components/AdminPanel/AdminPanel";
import { useGlobalState } from "@/context/GlobalState";
import { showNotification } from "@/lib/notifications/notifications";
import { LogoutResponse } from "@/lib/types/responses";
import { UserRole } from "@/lib/types/user";
import { handleApiError } from "@/lib/utils/handleApiError";
import { logout } from "@/services/api/authservice";
import { Button, Center, Container, Group, LoadingOverlay, Modal, Stack, Text, Title } from "@mantine/core";
import { IconLogout, IconTrophy, IconUser, IconUserCog } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const { isLoggedIn, jwtUserInfo, catches, setIsLoggedIn, setJwtUserInfo } = useGlobalState();
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    if (isLoggedIn === null) return;

    if (!isLoggedIn) {
      console.log('Not logged in, redirecting to login...');
      router.push('/login'); // Redirect to login if not logged in
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    // Optionally show a loading state while redirecting
    return <LoadingOverlay visible={true} overlayProps={{ blur: 2, zIndex: 2000, bg: 'rgba(0,0,0,0.5', fixed: true}}/>;
  }

  const handleLogout = async () => {
    try {
      const logoutResponse: LogoutResponse = await logout();
      console.log(logoutResponse.message);
      showNotification('success', `${logoutResponse.message} See you later ${jwtUserInfo?.firstname}! 👋`, { withTitle: false })
      
      // Update global state
      setIsLoggedIn(false);
      setJwtUserInfo(null);

      // Redirect to the login page
      router.push('/login');
    } catch (error) {
      handleApiError(error, 'logout');
    }
  };

  return (
    <Container size={'sm'} p={'md'} pt={'xl'}>
      <Center>
        <Stack align="center" gap={'xl'}>
          <Title c={'white'} order={3}>{t('UserPage.Title', {name: jwtUserInfo?.firstname})}</Title>
          <Group mb={'md'}>
            <IconUser />
            <Text>{t('UserPage.WIP')}</Text>
          </Group>
          {isLoggedIn && 
            <Link href={'/user/achievements'} passHref prefetch>
            <Button
              size="md"
              leftSection={<IconTrophy />}
            >
              {t('UserPage.Achievements')}
            </Button>
          </Link>
          }
          {isLoggedIn && <Button size="md" onClick={handleLogout} leftSection={<IconLogout />}>{t('UserPage.Logout')}</Button>}
          {isLoggedIn && jwtUserInfo?.role === UserRole.ADMIN && <Button leftSection={<IconUserCog />} size="md" onClick={() => setAdminPanelOpen(true)}>{t('UserPage.AdminPanel')}</Button>}
          <Modal
            opened={adminPanelOpen}
            onClose={() => setAdminPanelOpen(false)}
            title={t('UserPage.AdminPanel')}
            size="lg"
          >
            <AdminPanel />
          </Modal>

        </Stack>
      </Center>
    </Container>
  );
}