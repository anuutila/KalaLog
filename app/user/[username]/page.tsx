'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { IconChevronLeft, IconFish, IconLogout, IconSettings, IconStarFilled, IconTrophy, IconUserCog } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { Avatar, Box, Button, Center, Container, Modal, Stack, Text, Alert, ActionIcon, Skeleton, rem, Paper, Title, Group, Badge } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import AdminPanel from '@/components/AdminPanel/AdminPanel';
import { useGlobalState } from '@/context/GlobalState';
import { showNotification } from '@/lib/notifications/notifications';
import { LogoutResponse, UserProfileResponse } from '@/lib/types/responses';
import { UserRole, IPublicUserProfile } from '@/lib/types/user';
import { handleApiError } from '@/lib/utils/handleApiError';
import { logout } from '@/services/api/authservice';
import { getUserProfileByUsername } from '@/services/api/userService';
import { nameToColor, navigateBack } from '@/lib/utils/utils';
import { useParams, useRouter } from 'next/navigation';
import { useHeaderActions } from '@/context/HeaderActionsContext';
import classes from '@/context/LoadingOverlayContext.module.css';
import ProfileTitle from '@/components/userPage/ProfileTitle';
import { calculateUserCatchStats } from '@/lib/utils/catchUtils';
import { BiggestFishStat } from '@/components/userPage/BiggestFishStat';
import { calculateTotalPossibleStars } from '@/lib/utils/achievementUtils';

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const viewedUsername = params.username as string;
  const { catches, isLoggedIn, jwtUserInfo, setIsLoggedIn, setJwtUserInfo, previousPath } = useGlobalState();
  const { setActions, setPageTitle } = useHeaderActions();
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<IPublicUserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false); // Keep admin panel state if needed

  const t = useTranslations();

  // Determine if the profile being viewed belongs to the logged-in user
  const isOwnProfile = isLoggedIn && profileData?.username === jwtUserInfo?.username;

  // Effect to set Header Action (Back Button)
  useEffect(() => {
    if (isOwnProfile || isLoggedIn === null) {
      setActions(null); // Don't show back button on own profile
      return;
    }

    setActions(
      <ActionIcon
        size="lg"
        variant="transparent"
        c="white"
        onClick={() => navigateBack(router, previousPath)}
      >
        <IconChevronLeft style={{ width: '100%', height: '100%' }} />
      </ActionIcon>
    );

    return () => setActions(null);
  }, [router, setActions, isOwnProfile, isLoggedIn, previousPath]);

  // Fetch profile data based on the username in the URL
  useEffect(() => {
    setIsLoadingProfile(true);
    setError(null);
    setProfileData(null);

    const fetchProfileData = async () => {
      try {
        const profileResponse: UserProfileResponse = await getUserProfileByUsername(viewedUsername);
        const profileData = profileResponse.data;
        setProfileData(profileData);
      } catch (err: any) {
        setError(err?.message ?? t('Error'));
        handleApiError(err, 'fetching user profile data');
        setPageTitle(t('Pages.Achievements'));
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchProfileData();
  }, [viewedUsername]);

  useEffect(() => {
    let title: string | null = null;
    if (profileData) {
      const titleKey = isOwnProfile ? 'UserPage.MyTitle' : 'UserPage.UserTitle';
      title = t(titleKey, { name: profileData.firstName });
    } else {
      title = t('Pages.Account');
    }
    setPageTitle(title);

    // Cleanup function
    return () => setPageTitle(null);
  }, [profileData, isOwnProfile, error, setPageTitle, t]);

  const handleLogout = async () => {
    try {
      const logoutResponse: LogoutResponse = await logout();
      showNotification('success', `${logoutResponse.message} See you later ${jwtUserInfo?.firstname}! 👋`, t);
      setIsLoggedIn(false);
      setJwtUserInfo(null);
      router.push('/login');
    } catch (error) {
      handleApiError(error, 'logout');
    }
  };

  const userStats = useMemo(() => {
    return calculateUserCatchStats(catches, viewedUsername);
  }, [catches, viewedUsername]);

  const { totalCatches, biggestPike, biggestZander, biggestPerch } = userStats;

  const personalBestSpecies = [
    { speciesLabel: 'Hauki', color: 'green', biggestCatch: biggestPike },
    { speciesLabel: 'Kuha', color: 'blue', biggestCatch: biggestZander },
    { speciesLabel: 'Ahven', color: 'red', biggestCatch: biggestPerch },
  ];

  const getTotalStars = useMemo(() => {
    return calculateTotalPossibleStars();
  }, []);

  const { totalStars, byRarity } = getTotalStars;

  if (error && !isLoadingProfile) {
    return (
      <Container size="sm" pt="xl">
        <Alert
          icon={<IconAlertCircle size={24} />}
          title="Error"
          color="red"
          radius={'lg'}
          styles={{
            label: { fontSize: rem(16) },
            message: { fontSize: rem(16) },
            icon: { width: 'calc(1.5rem* var(--mantine-scale))' },
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!isLoadingProfile && !profileData && !error) {
    return (
      <Container size="sm" pt="xl">
        <Alert
          icon={<IconAlertCircle size={24} />}
          title="Error"
          color="red"
          radius={'lg'}
          styles={{
            label: { fontSize: rem(16) },
            message: { fontSize: rem(16) },
            icon: { width: 'calc(1.5rem* var(--mantine-scale))' },
          }}
        >
          {t('UserPage.ProfileNotFound')}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="sm" pt="xl" px={'md'} pb={'md'} 
      mih={{
        base: 'calc(100dvh - var(--app-shell-footer-offset, 0rem) - var(--app-shell-header-offset, 0rem) - env(safe-area-inset-bottom))',
        md: 'calc(100dvh - var(--app-shell-header-offset, 0rem) - env(safe-area-inset-bottom))',
      }} 
      display={'flex'} 
      style={{ flexDirection: 'column' }}
    >
      <Center h="100%" w="100%">
        <Stack align="center" gap="xl" justify="space-between" h="100%" w="100%">
          <Stack align="center" gap="xl" w={'100%'}>
            <Stack align="center" gap={0} w={'100%'}>
              <Box pos={'relative'}>
                {isLoadingProfile ? (
                  <Skeleton height={150} circle />
                ) : (
                  <Avatar
                    radius="100%"
                    size={150}
                    name={`${profileData?.firstName} ${profileData?.lastName ?? ''}`}
                    color={nameToColor(`${profileData?.firstName} ${profileData?.lastName ?? ''}`)}
                    src={profileData?.profilePicturePublicId}
                  />)}
                {/* <Box pos={'absolute'} left={-15} bottom={-15} style={{}}>
                  <LevelIcon level={profileData.level} absolutePos={false} />
                </Box> */}
              </Box>
              {/* <Box style={{ transform: 'translateY(-25%) translateX(-0%)' }}>
                <LevelProgress totalXP={totalXP} progressLabel={false} width={125} iconLeftOffset={-60} />
                <LevelIcon level={profileData.level} absolutePos={false}/>
              </Box> */}

              <Center mt="sm" w={'100%'}>
                <Stack align="center" gap={0} w={'100%'}>
                  {isLoadingProfile ? (
                    <>
                      <Skeleton height={45} width="300px" radius="md" mb={10} mt={20} />
                      <Skeleton height={25} width="100px" radius="md" />
                    </>
                  ) : (
                    <>
                      {profileData && (
                        <>
                          <ProfileTitle profileData={profileData} />
                          <Text fz={'lg'} fw={500} c="dimmed">@{profileData.username}</Text>
                        </>
                      )}
                    </>
                  )}
                </Stack>
              </Center>

              {isLoadingProfile ? (
                <Stack mx="md" mt="xl" gap={'md'} align='center' w={'100%'}>
                  <Skeleton height={62} w={'100%'} maw={500} radius="lg" />
                  <Skeleton height={170} w={'100%'} maw={500} radius="lg" />
                  <Skeleton height={158} w={'100%'} maw={500} radius="lg" />
                </Stack>
              ) : (
                <Stack align='center' w={'100%'} gap={0}>
                  <Paper p="md" mt="xl" mx="md" radius={'lg'} bg={'var(--my-ui-item-background-color)'} w={'100%'} maw={500}>
                    <Group gap={'0'} justify='space-between'>
                      <Title c={'white'} order={3} fz={20} fw={600}>{t('UserPage.TotalCatches')}</Title>
                      <Group gap={10}>
                        <Text c={'white'} fz={18} fw={500} lh={1}>{totalCatches} </Text>
                        <IconFish size={22} stroke={2} color='white' style={{ transform: 'translateY(0px)' }} />
                      </Group>
                    </Group>
                  </Paper>

                  <Paper p="md" mt={'md'} mx="md" radius={'lg'} bg={'var(--my-ui-item-background-color)'} w={'100%'} maw={500}>
                    <Title c={'white'} order={3} mb={'xs'} fz={20} fw={600}>{t('UserPage.PersonalBests')}</Title>
                    <Stack gap={8}>
                      {personalBestSpecies.map(spec => (
                        <BiggestFishStat
                          key={spec.speciesLabel}
                          speciesLabel={spec.speciesLabel}
                          color={spec.color}
                          biggestCatch={spec.biggestCatch}
                        />
                      ))}
                    </Stack>
                  </Paper>

                  <Paper p="md" mt={'md'} mx="md" radius={'lg'} bg={'var(--my-ui-item-background-color)'} w={'100%'} maw={500}>
                    <Group gap={'0'} justify='space-between'>
                      <Title c={'white'} order={3} fz={20} fw={600} mb={'xs'}>{t('UserPage.Achievements')}</Title>
                      {/* <Group gap={10}>
                      <Title c={'white'} order={1} fz={25} lh={1}>{profileData?.totalStars}</Title>
                      <IconStar size={24} color='white' style={{ transform: 'translateY(0px)' }} />
                    </Group> */}
                    </Group>
                    <Group align='center' justify="space-between" mb={'md'}>
                      <Badge
                        size="lg"
                        color={'yellow'}
                        variant="light"
                        radius={'xl'}
                        w={130}
                        leftSection={<IconStarFilled size={18} width={28} stroke={1.5} />}
                      >
                        {t('UserPage.Stars')}
                      </Badge>
                      <Box>
                        <Group wrap="nowrap" gap="xs">
                          <Text c={'white'} fw={500} fz={'lg'} lh={1} style={{ whiteSpace: 'nowrap' }}>
                            {profileData?.totalStars} / {totalStars}
                          </Text>
                          <IconStarFilled size={20} color='white' />
                        </Group>
                      </Box>
                    </Group>
                    <Group justify='center' >
                      <Link href={`/user/${viewedUsername}/achievements`} passHref prefetch style={{ width: '100%' }}>
                        <Button variant='default' size="md" w={'100%'} leftSection={<IconTrophy />}>
                          {t('Pages.Achievements')}
                        </Button>
                      </Link>
                    </Group>
                  </Paper>

                </Stack>
              )}
            </Stack>
          </Stack>

          {/* Show Settings/Admin/Logout buttons only on own profile */}
          {isOwnProfile && (
            <Stack justify='center' align='center'>
              {/* Settings Button */}
              <Link href={'/settings'} passHref prefetch>
                <Button variant="subtle" size="md" leftSection={<IconSettings />}>
                  {t('UserPage.Settings')}
                </Button>
              </Link>
              {/* Admin Panel Modal Logic */}
              <Modal opened={adminPanelOpen} onClose={() => setAdminPanelOpen(false)} title={t('UserPage.AdminPanel')} size="lg">
                <AdminPanel />
              </Modal>
              {/* Admin Panel Button */}
              {(jwtUserInfo?.role === UserRole.ADMIN || jwtUserInfo?.role === UserRole.SUPERADMIN) && (
                <Button variant="subtle" leftSection={<IconUserCog />} size="md" onClick={() => setAdminPanelOpen(true)}>
                  {t('UserPage.AdminPanel')}
                </Button>
              )}
              {/* Log out Button */}
              <Button variant="subtle" size="md" onClick={handleLogout} leftSection={<IconLogout />}>
                {t('UserPage.Logout')}
              </Button>
            </Stack>
          )}
        </Stack>
      </Center>

      {isOwnProfile && (
        <Text size="sm" c="dimmed" ta="center" mt="auto" pt={60}>
          Made with ❤️ by <Text span fw={500}>Akseli</Text>
        </Text>
      )}

    </Container>
  );
}