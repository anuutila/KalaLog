'use client';

import AdminPanel from "@/components/AdminPanel/AdminPanel";
import LevelProgress from "@/components/LevelProgress/LevelProgress";
import { useGlobalState } from "@/context/GlobalState";
import { showNotification } from "@/lib/notifications/notifications";
import { LogoutResponse } from "@/lib/types/responses";
import { UserRole } from "@/lib/types/user";
import { handleApiError } from "@/lib/utils/handleApiError";
import { logout } from "@/services/api/authservice";
import { Avatar, Box, Button, Center, Container, LoadingOverlay, Modal, Stack, Title } from "@mantine/core";
import { IconLogout, IconTrophy, IconUserCog } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function Page() {
  const { isLoggedIn, jwtUserInfo, achievements, setIsLoggedIn, setJwtUserInfo } = useGlobalState();
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  const totalXP = useMemo(() => {
    return achievements.reduce((acc, ach) => acc + ach.totalXP, 0);
  }, [achievements]);
  
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
    <Container size={'sm'} pt={'xl'} p={'md'} h={'calc(100dvh - var(--app-shell-footer-offset, 0rem) - var(--app-shell-header-offset, 0rem) - env(safe-area-inset-bottom))'}>
      <Center h={'100%'}>
        <Stack align="center" gap={'xl'} justify="space-between" h={'100%'}>
          <Stack align="center" gap={'xl'}>

            <Stack align="center" gap={0}>
              <Avatar radius="100%" size={150} name={`${jwtUserInfo?.firstname} ${jwtUserInfo?.lastname ?? ''}`} color="initials" />
              <Box style={{ transform: 'translateY(-41%) translateX(-0%)' }}>
                <LevelProgress totalXP={totalXP}/>
                <Center>
                  <Title order={1} c={'white'}>{jwtUserInfo?.firstname} {jwtUserInfo?.lastname}</Title>
                </Center>
              </Box>
            </Stack>

            {isLoggedIn &&
              <Link href={'/user/achievements'} passHref prefetch>
                <Button
                  size="md"
                  leftSection={<IconTrophy />}
                >
                  {t('UserPage.Achievements')}
                </Button>
              </Link>}

          </Stack>
          <Stack>
            <Modal
              opened={adminPanelOpen}
              onClose={() => setAdminPanelOpen(false)}
              title={t('UserPage.AdminPanel')}
              size="lg"
            >
              <AdminPanel />
            </Modal>
            {isLoggedIn && jwtUserInfo?.role === UserRole.ADMIN && <Button variant="subtle" leftSection={<IconUserCog />} size="md" onClick={() => setAdminPanelOpen(true)}>{t('UserPage.AdminPanel')}</Button>}
            {isLoggedIn && <Button variant="subtle" size="md" onClick={handleLogout} leftSection={<IconLogout />}>{t('UserPage.Logout')}</Button>}
          </Stack>

        </Stack>
      </Center>
    </Container>
  );
}