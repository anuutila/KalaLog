'use client';

import { useEffect, useState } from 'react';
import { useHeaderActions } from "@/context/HeaderActionsContext";
import { IAchievement, IAchievementConfig, IAchievementConfigTiered, IAchievementTiered } from "@/lib/types/achievement";
import { useTranslations } from "next-intl";
import { ActionIcon, Center, Container, Group, Stack, Title } from '@mantine/core';
import { IconChevronLeft, IconStarFilled } from '@tabler/icons-react';
import Link from 'next/link';
import AchievementItem from '@/components/achievements/AchievementItem/AchievementItem';
import { allAchievements } from '@/achievements/achievementConfigs';
import { UserAchievementsResponse } from '@/lib/types/responses';
import { handleApiError } from '@/lib/utils/handleApiError';
import { getUserAchievements } from '@/services/api/achievementService';
import { useGlobalState } from '@/context/GlobalState';

export default function Page() {
  const tAP = useTranslations("AchievementsPage");
  const { setActions } = useHeaderActions();
  const { jwtUserInfo } = useGlobalState();
  const [achievements, setAchievements] = useState<IAchievement[]>([]);
  const [userAchDict, setUserAchDict] = useState<Record<string, IAchievement>>({});
  const [sortedAchievements, setSortedAchievements] = useState<IAchievementConfig[]>([]);
  const [userStars, setUserStars] = useState<number>(0);
  const [totalStars, setTotalStars] = useState<number>(0);
  const [xp, setXP] = useState<number>(0);

  useEffect(() => {
    // Set the header actions for this page
    setActions(
      <Link href="/user" passHref prefetch style={{ height: 'fit-content', display: 'flex', alignItems: 'center' }}>
        <ActionIcon size={'lg'} variant='transparent' c={'white'} onClick={() => console.log('test')} >
          <IconChevronLeft style={{ width: '100%', height: '100%' }} />
        </ActionIcon>
      </Link>
    );

    // Cleanup when leaving the page
    return () => setActions(null);
  }, []);

  useEffect(() => {
    // Make sure we have a user to fetch achievements for (in case of refreshin the page)
    if (jwtUserInfo?.userId) {
      // Fetch the achievements
      getAchievements();
    }
  }, [jwtUserInfo]);

  useEffect(() => {
    // When achievements update, compute derived states
    const newUserAchDict = achievements.reduce((acc, ach) => {
      acc[ach.key] = ach;
      return acc;
    }, {} as Record<string, IAchievement>);
    setUserAchDict(newUserAchDict);
    
    // Then sort and calculate stars
    sortAchievements(achievements, newUserAchDict);
    calculateStars(achievements);
    calculateXP(achievements);
  }, [achievements]);

  async function getAchievements() {
    let currentAchievements: IAchievement[] = [];
    try {
      const UserAchievementsResponse: UserAchievementsResponse = await getUserAchievements(jwtUserInfo?.userId ?? '');
      currentAchievements = UserAchievementsResponse.data;
    } catch (error) {
      handleApiError(error, 'achievement fetching');
    }
    setAchievements(currentAchievements);
  }

  function sortAchievements(achievementsData: IAchievement[], userAchDictData: Record<string, IAchievement>) {
    if (!achievementsData.length) return;
    const unlockedAchievements = allAchievements.filter(config => !!userAchDictData[config.key] && userAchDictData[config.key].unlocked !== false)
      .sort((a, b) => {
        const aRarity = a.isOneTime ? a.rarity : (userAchDictData[a.key] as IAchievementTiered).currentTier;
        const bRarity = b.isOneTime ? b.rarity : (userAchDictData[b.key] as IAchievementTiered).currentTier;
        return bRarity - aRarity;
      });
    
    const lockedAchievements = allAchievements.filter(config => !userAchDictData[config.key] || userAchDictData[config.key].unlocked === false);
    const sorted = [...unlockedAchievements, ...lockedAchievements];
    setSortedAchievements(sorted);
  }
  
  function calculateStars(achievementsData: IAchievement[]) {
    const amountOfUserStars = achievementsData.reduce((acc, ach) => {
      if (ach.isOneTime) {
        acc += 1;
      } else {
        acc += ach.currentTier;
      }
      return acc;
    }, 0);
    const amountOfStars = allAchievements.reduce((acc, ach) => acc + (ach.isOneTime ? 1 : (ach as IAchievementConfigTiered).baseTiers.length), 0);
    setUserStars(amountOfUserStars);
    setTotalStars(amountOfStars);
  }

  function calculateXP(achievementsData: IAchievement[]) {
    const xpAmount = achievementsData.reduce((acc, ach) => {
      acc += ach.totalXP;
      return acc;
    }, 0);
    setXP(xpAmount);
  }

  return (
    <Container py={'md'} px={'xs'} size={'sm'}>
      <Center>
        <Group gap={0} mb={'md'}>
          <Title order={2} style={{ color: 'white' }} lh={1}>
            {`${userStars} / ${totalStars}`}
          </Title>
          <IconStarFilled color='white' style={{ width: '1.5rem', height: '1.5rem', marginLeft: '0.5rem' }} />
          <Title order={2} style={{ color: 'white' }} lh={1} ml={'xl'}>
            {`${xp} XP`}
          </Title>
        </Group>
      </Center>
      <Stack gap={'md'}>
        {sortedAchievements.map((config: IAchievementConfig) => (
          <AchievementItem
            key={config.key}
            achievementConfig={config}
            userAchievement={userAchDict[config.key]}
          />
        ))}
      </Stack>
    </Container>
  );
};
