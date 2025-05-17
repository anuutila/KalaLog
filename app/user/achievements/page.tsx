'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconChevronLeft, IconStarFilled } from '@tabler/icons-react';
import { ActionIcon, Badge, Box, Container, Group, Paper, Skeleton, Stack, Title } from '@mantine/core';
import { achievementConfigMap, allAchievements } from '@/lib/achievements/achievementConfigs';
import AchievementItem, { AchievementColors } from '@/components/achievements/AchievementItem/AchievementItem';
import { useGlobalState } from '@/context/GlobalState';
import { useHeaderActions } from '@/context/HeaderActionsContext';
import {
  IAchievement,
  IAchievementConfig,
  IAchievementConfigOneTime,
  IAchievementConfigTiered,
  IAchievementTiered,
} from '@/lib/types/achievement';
import { useTranslations } from 'next-intl';
import LevelProgress from '@/components/LevelProgress/LevelProgress';
import classes from './page.module.css';
import LevelIcon from '@/components/LevelIcon/LevelIcon';
import { calculateLevel } from '@/lib/utils/levelUtils';

type StarRarityCounts = { 1: number; 2: number; 3: number; 4: number; 5: number };
const rarityTranslationKeys = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

export default function Page() {
  const tRarity = useTranslations("AchievementsPage.Rarities");
  const t = useTranslations();
  const { setActions } = useHeaderActions();
  const { achievements } = useGlobalState();
  const [userAchDict, setUserAchDict] = useState<Record<string, IAchievement>>({});
  const [sortedAchievements, setSortedAchievements] = useState<IAchievementConfig[]>([]);
  const [userStars, setUserStars] = useState<number>(0);
  const [userStarStarRarityCounts, setUserStarStarRarityCounts] = useState<StarRarityCounts>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [totalStars, setTotalStars] = useState<number>(0);
  const [totalStarStarRarityCounts, setTotalStarStarRarityCounts] = useState<StarRarityCounts>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [xp, setXP] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    // Set the header actions for this page
    setActions(
      <Link href="/user" passHref prefetch style={{ height: 'fit-content', display: 'flex', alignItems: 'center' }}>
        <ActionIcon size="lg" variant="transparent" c="white">
          <IconChevronLeft style={{ width: '100%', height: '100%' }} />
        </ActionIcon>
      </Link>
    );

    // Cleanup when leaving the page
    return () => setActions(null);
  }, []);

  useEffect(() => {
    // When achievements update, compute derived states
    const newUserAchDict = achievements.reduce(
      (acc, ach) => {
        acc[ach.key] = ach;
        return acc;
      },
      {} as Record<string, IAchievement>
    );
    setUserAchDict(newUserAchDict);

    // Then sort and calculate stars
    sortAchievements(achievements, newUserAchDict);
    calculateStars(achievements);
    calculateXP(achievements);
    setLoading(false);
  }, [achievements]);

  function sortAchievements(achievementsData: IAchievement[], userAchDictData: Record<string, IAchievement>) {
    if (!achievementsData.length) {
      return;
    }
    const unlockedAchievements = allAchievements
      .filter((config) => !!userAchDictData[config.key] && userAchDictData[config.key].unlocked !== false)
      .sort((a, b) => {
        const aRarity = a.isOneTime ? a.rarity : (userAchDictData[a.key] as IAchievementTiered).currentTier;
        const bRarity = b.isOneTime ? b.rarity : (userAchDictData[b.key] as IAchievementTiered).currentTier;
        return bRarity - aRarity;
      });

    const lockedAchievements = allAchievements.filter(
      (config) => !userAchDictData[config.key] || userAchDictData[config.key].unlocked === false
    );
    const sorted = [...unlockedAchievements, ...lockedAchievements];
    setSortedAchievements(sorted);
  }

  function calculateStars(achievementsData: IAchievement[]) {
    let currentUserStarsTotal = 0;
    let possibleStarsTotal = 0;

    const userStarsByRarity: StarRarityCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const totalStarsByRarity: StarRarityCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    // Calculate User's Earned Stars (Total and by Rarity)
    achievementsData.forEach((ach) => {
      const config = achievementConfigMap[ach.key];
      if (!config) {
        console.warn(`Config not found for user achievement key: ${ach.key}`);
        return;
      }

      if (ach.isOneTime) {
        // For unlocked one-time achievements
        if (ach.unlocked) {
          currentUserStarsTotal += 1; 
          const oneTimeConfig = config as IAchievementConfigOneTime;
          const rarity = oneTimeConfig.rarity;
          if (rarity >= 1 && rarity <= 5) {
            userStarsByRarity[rarity as keyof StarRarityCounts] += 1;
          } else {
            console.warn(`Invalid rarity (${rarity}) found for one-time achievement: ${ach.key}`);
          }
        }
      } else {
        // For tiered achievements
        const tieredAch = ach as IAchievementTiered;
        currentUserStarsTotal += tieredAch.currentTier;

        for (let tier = 1; tier <= tieredAch.currentTier; tier++) {
          if (tier >= 1 && tier <= 5) {
            userStarsByRarity[tier as keyof StarRarityCounts] += 1;
          }
        }
      }
    });

    // Calculate Total Possible Stars (Total and by Rarity)
    allAchievements.forEach((config) => {
      if (config.isOneTime) {
        possibleStarsTotal += 1;
        const oneTimeConfig = config as IAchievementConfigOneTime;
        const rarity = oneTimeConfig.rarity;
        if (rarity >= 1 && rarity <= 5) {
          totalStarsByRarity[rarity as keyof StarRarityCounts] += 1;
        } else {
          console.warn(`Invalid rarity (${rarity}) found for one-time achievement config: ${config.key}`);
        }
      } else {
        // For tiered achievement configs
        const tieredConfig = config as IAchievementConfigTiered;
        const numberOfTiers = tieredConfig.baseTiers.length;
        possibleStarsTotal += numberOfTiers;

        tieredConfig.baseTiers.forEach((_tierConfig, index) => {
          const tierNumber = index + 1;
          if (tierNumber >= 1 && tierNumber <= 5) {
            totalStarsByRarity[tierNumber as keyof StarRarityCounts] += 1;
          }
        });
      }
    });

    setUserStars(currentUserStarsTotal);
    setTotalStars(possibleStarsTotal);
    setUserStarStarRarityCounts(userStarsByRarity);
    setTotalStarStarRarityCounts(totalStarsByRarity);
  }

  function calculateXP(achievementsData: IAchievement[]) {
    const xpAmount = achievementsData.reduce((acc, ach) => {
      acc += ach.totalXP;
      return acc;
    }, 0);
    setXP(xpAmount);
  }

  return (
    <Container py="md" px="xs" size="sm">
      <Stack gap="md">
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
                      <Box>{userStarStarRarityCounts[(index + 1) as keyof StarRarityCounts]} / {totalStarStarRarityCounts[(index + 1) as keyof StarRarityCounts]}</Box>
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
            <AchievementItem key={config.key} achievementConfig={config} userAchievement={userAchDict[config.key]} />
          ))}
      </Stack>
    </Container>
  );
}
