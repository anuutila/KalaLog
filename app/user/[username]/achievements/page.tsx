'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IconChevronLeft, IconStarFilled } from '@tabler/icons-react';
import { ActionIcon, Badge, Box, Container, Group, Paper, Skeleton, Stack, Title, Text, Alert, Avatar, rem } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import AchievementItem, { AchievementColors } from '@/components/achievements/AchievementItem/AchievementItem';
import { useGlobalState } from '@/context/GlobalState';
import { useHeaderActions } from '@/context/HeaderActionsContext';
import { IAchievement, IAchievementConfig } from '@/lib/types/achievement';
import { useTranslations } from 'next-intl';
import LevelProgress from '@/components/LevelProgress/LevelProgress';
import LevelIcon from '@/components/LevelIcon/LevelIcon';
import { calculateLevel } from '@/lib/utils/levelUtils';
import { getUserProfileByUsername } from '@/services/api/userService';
import { IPublicUserProfile } from '@/lib/types/user';
import { nameToColor } from '@/lib/utils/utils';
import { calculateTotalPossibleStars, calculateUserAchievementStats, sortAchievements, StarRarityCounts } from '@/lib/utils/achievementUtils';
import { UserProfileResponse } from '@/lib/types/responses';
import { handleApiError } from '@/lib/utils/handleApiError';

const rarityTranslationKeys = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

export default function UserAchievementsPage() {
  const router = useRouter();
  const t = useTranslations();
  const tRarity = useTranslations("AchievementsPage.Rarities");
  const { setActions, pageTitle, setPageTitle } = useHeaderActions();
  const params = useParams();
  const viewedUsername = params.username as string;
  const { jwtUserInfo: loggedInUserInfo, previousPath } = useGlobalState();
  const [error, setError] = useState<string | null>(null);

  const [viewedAchievements, setViewedAchievements] = useState<IAchievement[]>([]);
  const [userAchDict, setUserAchDict] = useState<Record<string, IAchievement>>({});
  const [sortedAchievements, setSortedAchievements] = useState<IAchievementConfig[]>([]);

  const [userStars, setUserStars] = useState<number>(0);
  const [userStarRarityCounts, setUserStarRarityCounts] = useState<StarRarityCounts>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [totalStars, setTotalStars] = useState<number>(0);
  const [totalStarRarityCounts, setTotalStarRarityCounts] = useState<StarRarityCounts>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [xp, setXP] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [profileData, setProfileData] = useState<IPublicUserProfile | null>(null);
  const isOwnProfile = loggedInUserInfo?.username === viewedUsername;

  useEffect(() => {
    if (!viewedUsername) {
      return;
    }

    setError(null);
    setLoading(true);
    setPageTitle(t('Pages.Achievements')); // Set default while loading profile

    const fetchProfileData = async () => {
      try {
        const profileResponse: UserProfileResponse = await getUserProfileByUsername(viewedUsername);
        const profileData = profileResponse.data;
        setProfileData(profileData);
        setViewedAchievements(profileData.userAchievements);
      } catch (err: any) {
        setError(err?.message ?? t('Error'));
        handleApiError(err, 'fetching user profile data');
        setPageTitle(t('Pages.Achievements'));
      }
    }

    fetchProfileData();

    // Cleanup function to reset title when leaving page
    return () => setPageTitle(null);

  }, [viewedUsername, setPageTitle]);

  useEffect(() => {
    let title: string | null = null;
    if (profileData) {
      const titleKey = isOwnProfile ? 'AchievementsPage.MyTitle' : 'AchievementsPage.UserTitle';
      title = t(titleKey, { name: profileData.firstName });
    } else {
      title = t('Pages.Achievements');
    }
    setPageTitle(title);

    return () => setPageTitle(null);
  }, [profileData, isOwnProfile, setPageTitle, t]);

  // Effect to set Header Action (Back Button)
  useEffect(() => {
    const fallbackPath = '/catches';
    const goBackPath = previousPath || fallbackPath;

    setActions(
      <ActionIcon
        size="lg"
        variant="transparent"
        c="white"
        onClick={() => router.push(goBackPath)}
      >
        <IconChevronLeft style={{ width: '100%', height: '100%' }} />
      </ActionIcon>
    );

    return () => setActions(null);
  }, [router, setActions, previousPath]);

  // Effect to process achievements when viewedAchievements data updates
  useEffect(() => {
    const newUserAchDict = viewedAchievements.reduce((acc, ach) => {
      acc[ach.key] = ach;
      return acc;
    }, {} as Record<string, IAchievement>);
    setUserAchDict(newUserAchDict);

    const userStats = calculateUserAchievementStats(viewedAchievements);
    const possibleStats = calculateTotalPossibleStars();

    setUserStars(userStats.totalStars);
    setUserStarRarityCounts(userStats.byRarity);
    setXP(userStats.totalXP);
    setTotalStars(possibleStats.totalStars);
    setTotalStarRarityCounts(possibleStats.byRarity);

    setSortedAchievements(sortAchievements(newUserAchDict));

    setLoading(false);
  }, [viewedAchievements]);

  const getNameColor = useMemo(() => {
    if (profileData) {
      const color = nameToColor(`${profileData.firstName} ${profileData.lastName}`);
      return color;
    }
  }, [profileData]);

  if (error && !loading) {
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

  return (
    <Container py="md" px="xs" size="sm">
      <Stack gap="md">

        {!loading && profileData ? (
          <>
            {!isOwnProfile && (
              <Paper withBorder p="sm" radius="lg">
                <Group>
                  <Avatar
                    src={profileData.profilePictureUrl}
                    name={`${profileData.firstName} ${profileData.lastName}`}
                    radius="xl"
                    size="lg"
                    color={getNameColor}
                  />
                  <Stack gap={0}>
                    <Text fw={600} size="xl" c={'white'}>{profileData.firstName} {profileData.lastName}</Text>
                    <Text size="md" c="dimmed">@{profileData.username}</Text>
                  </Stack>
                </Group>
              </Paper>
            )}

            <Paper p="md" mb={4} radius={'lg'} bg={'var(--my-ui-item-background-color)'} withBorder>
              <Title c={'white'} order={3} pb={'xs'} >{t('AchievementsPage.LevelProgress')}</Title>
              <Box mb={'xl'} mt={'xs'} pos={'relative'} w={'100%'}>
                <LevelProgress totalXP={xp} progressLabel width={'100%'} iconLeftOffset={-165} barThickness='2rem' showLevelIcon={false} ml={30} />
                <Box pos={'absolute'} left={-10} top={-19}>
                  <LevelIcon level={calculateLevel(xp)} absolutePos={false} />
                </Box>
              </Box>
              <Group pb={'xs'} gap={'xs'} justify='space-between'>
                <Title c={'white'} order={3}>{t('AchievementsPage.AchievementStars')}</Title>
                <Group gap={'xs'} pr={15}>
                  <Title order={3} c={'white'}>
                    {userStars} / {totalStars}
                  </Title>
                  <IconStarFilled size={24} color='white' />
                </Group>
              </Group>
              <Stack gap={6}>
                {Array.from({ length: 5 }).map((_, index) =>
                  <Group gap={0} key={index} justify='center' w={'100%'}>
                    <Box w={'100%'}>
                      <Badge w={'100%'} size={'xl'} variant='light' color={index === 0 ? 'gray' : AchievementColors[index]} rightSection={<><IconStarFilled color={index === 0 ? 'var(--mantine-color-gray-4)' : `var(--mantine-color-${AchievementColors[index]}-5)`} size={20} /></>}>
                        <Group justify='space-between' align='center'>
                          <Box>{tRarity(rarityTranslationKeys[index])}</Box>
                          <Box>{userStarRarityCounts[(index + 1) as keyof StarRarityCounts]} / {totalStarRarityCounts[(index + 1) as keyof StarRarityCounts]}</Box>
                        </Group>
                      </Badge>
                    </Box>
                  </Group>
                ).reverse()}
              </Stack>
            </Paper>
            <Title order={2} c={'white'} ml={4}>{t('AchievementsPage.Title')}</Title>
            {loading
              ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} height={100} radius="lg" />)
              : sortedAchievements.map((config: IAchievementConfig) => (
                <AchievementItem key={config.key} achievementConfig={config} userAchievement={userAchDict[config.key]} isOwnProfile={isOwnProfile} />
              ))}
          </>
        ) : (
          <Stack>
            {!isOwnProfile && (<Skeleton height={83.8} radius="lg" />)}
            <Skeleton mb={4} height={375.59} radius="lg" />
            <Skeleton height={35} w={180} mr={'auto'} radius="lg" />
            {Array.from({ length: 10 }).map((_, index) => <Skeleton key={index} height={72} radius="lg" />)}
          </Stack>
        )}

      </Stack>
    </Container>
  );
}