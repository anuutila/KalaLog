import React from 'react';
import { Paper, Group, Stack, Title, Text, Progress, ThemeIcon, Box } from '@mantine/core';
import { IconStarFilled, IconLock, IconTrophy } from '@tabler/icons-react';
import { IAchievement, IAchievementConfig, IAchievementConfigOneTime, IAchievementConfigTiered, IAchievementTiered } from '@/lib/types/achievement';
import classes from './AchievementItem.module.css';
import { useTranslations } from 'next-intl';

export enum AchievementColors {
  white,
  green,
  blue,
  grape,
  orange
}

interface AchievementItemProps {
  achievementConfig: IAchievementConfig;
  userAchievement?: IAchievement;
}

interface StarInfo {
  isOneTime: boolean;
  totalStars: number;
  filledStars: number;
  isUnlocked: boolean;
}

// Compute star counts and unlocked state
function getStarInfo(
  achievementConfig: IAchievementConfig,
  userAchievement?: IAchievement
): StarInfo {
  const isOneTime = achievementConfig.isOneTime;
  const isUnlocked = !!userAchievement && userAchievement.unlocked !== false;
  let totalStars = 0;
  let filledStars = 0;
  if (isOneTime) {
    totalStars = 1;
    filledStars = isUnlocked ? 1 : 0;
  } else {
    // Tiered achievements: assume achievementConfig is IAchievementConfigTiered
    const tieredConfig = achievementConfig as IAchievementConfigTiered;
    totalStars = tieredConfig.baseTiers.length;
    filledStars = isUnlocked ? (userAchievement as IAchievementTiered).currentTier : 0;
    filledStars = Math.min(filledStars, totalStars);
  }
  return { isOneTime, totalStars, filledStars, isUnlocked };
}

// Compute colors based on status and rarity/tiers
function getColors(achievementConfig: IAchievementConfig, { isOneTime, filledStars, isUnlocked }: StarInfo) {
  let achievementConfigOneTime = achievementConfig as IAchievementConfigOneTime;

  let bgColor = '';
  let borderColor = '';
  let iconColor = '';
  let iconBgColor = '';
  let starColor = '';
  let progressBarColor = '';

  if (!isUnlocked) {
    bgColor = 'transparent';
    borderColor = 'var(--mantine-color-dark-4)';
    iconBgColor = 'transparent';
    iconColor = 'var(--mantine-color-dark-5)';
    starColor = 'var(--mantine-color-dark-4)';
    progressBarColor = 'var(--mantine-color-dark-1)';
  } else if (isUnlocked && ((isOneTime && achievementConfigOneTime.rarity === 1) || (!isOneTime && filledStars === 1))) {
    bgColor = 'var(--mantine-color-dark-7)';
    borderColor = 'var(--mantine-color-dark-1)';
    iconBgColor = 'var(--mantine-color-dark-5)';
    iconColor = 'var(--mantine-color-dark-1)';
    starColor = 'var(--mantine-color-gray-4)';
    progressBarColor = 'var(--mantine-color-gray-4)';
  } else if (isUnlocked && (isOneTime && achievementConfigOneTime.rarity > 1)) {
    bgColor = `var(--mantine-color-${AchievementColors[achievementConfigOneTime.rarity - 1]}-light)`;
    borderColor = `var(--mantine-color-${AchievementColors[achievementConfigOneTime.rarity - 1]}-5)`;
    iconBgColor = `var(--mantine-color-${AchievementColors[achievementConfigOneTime.rarity - 1]}-light)`;
    iconColor = `var(--mantine-color-${AchievementColors[achievementConfigOneTime.rarity - 1]}-light-color)`;
    starColor = `var(--mantine-color-${AchievementColors[achievementConfigOneTime.rarity - 1]}-5)`;
    progressBarColor = `var(--mantine-color-${AchievementColors[achievementConfigOneTime.rarity - 1]}-5)`;
  } else if (!isOneTime && filledStars > 1) {
    bgColor = `var(--mantine-color-${AchievementColors[filledStars - 1]}-light)`;
    borderColor = `var(--mantine-color-${AchievementColors[filledStars - 1]}-5)`;
    iconBgColor = `var(--mantine-color-${AchievementColors[filledStars - 1]}-light)`;
    iconColor = `var(--mantine-color-${AchievementColors[filledStars - 1]}-light-color)`;
    starColor = `var(--mantine-color-${AchievementColors[filledStars - 1]}-5)`;
    progressBarColor = `var(--mantine-color-${AchievementColors[filledStars - 1]}-5)`;
  }

  return { bgColor, borderColor, iconColor, iconBgColor, starColor, progressBarColor };
}

function ProgressDisplay({achievementConfig, starInfo, userAchievement, t, tA}: {
  achievementConfig: IAchievementConfig;
  starInfo: StarInfo;
  userAchievement?: IAchievement;
  t: any;
  tA: any;
}) {
  const { isOneTime, filledStars, isUnlocked } = starInfo;

  // One-time achievements
  if (isOneTime) {
    if (achievementConfig.progressBar === false && tA.has(`${achievementConfig.key}.Progress`)) {
      return (
        <Text fz={12} lh={1} fw="bold" className={classes.nowrap}>
          {tA(`${achievementConfig.key}.Progress`, { progress: userAchievement?.progress || 0 })}
        </Text>
      );
    } else if (achievementConfig.progressBar !== false) {
      return (
        <Text fz={12} lh={1} fw="bold" className={classes.nowrap}>
          {userAchievement?.progress || 0} / {(achievementConfig as IAchievementConfigOneTime).threshold}
        </Text>
      );
    }
  }

  // Tiered achievements
  if (!isOneTime) {
    const tieredConfig = achievementConfig as IAchievementConfigTiered;
    const baseTiersCount = tieredConfig.baseTiers.length;
    if (achievementConfig.progressBar === false && isUnlocked && (userAchievement as IAchievementTiered).currentTier < 5) {
      return (
        <Group gap="sm" wrap="nowrap">
          <Text fz={12} lh={1} fw="bold" className={classes.nowrap}>
            {t('AchievementsPage.NextTier')}
          </Text>
          <Text fz={12} lh={1} fw="bold" className={classes.nowrap}>
            {`${tieredConfig.baseTiers[filledStars]?.threshold} ${achievementConfig.unit || ''}`}
          </Text>
        </Group>
      );
    } else if (achievementConfig.progressBar !== false && filledStars < baseTiersCount) {
      return (
        <Group gap="sm" wrap="nowrap">
          {isUnlocked && (
            <Text fz={12} lh={1} fw="bold" className={classes.nowrap}>
              {((userAchievement as IAchievementTiered).currentTier < baseTiersCount ? t('AchievementsPage.NextTier') : '')}
            </Text>
          )}
          <Text fz={12} lh={1} fw="bold" className={classes.nowrap}>
            {`${userAchievement?.progress || 0} / ${tieredConfig.baseTiers[
              filledStars > 4 ? Math.min(filledStars - 1, 4) : filledStars
            ]?.threshold}`}
          </Text>
        </Group>
      );
    } else if (achievementConfig.progressBar !== false && filledStars >= baseTiersCount && !tA.has(`${achievementConfig.key}.Progress`)) {
      return (
        <Group gap="sm" wrap="nowrap">
          <Text fz={12} lh={1} fw="bold" className={classes.nowrap}>
            {((userAchievement as IAchievementTiered).currentTier < baseTiersCount ? t('AchievementsPage.NextTier') : '')}
          </Text>
          <Text fz={12} lh={1} fw="bold" className={classes.nowrap}>
            {`${userAchievement?.progress || 0} / ${tieredConfig.baseTiers[
              filledStars >= 4 ? Math.min(filledStars - 1, 4) : filledStars
            ]?.threshold}`}
          </Text>
        </Group>
      );
    } else if (isUnlocked && (userAchievement as IAchievementTiered).currentTier >= baseTiersCount && tA.has(`${achievementConfig.key}.Progress`)) {
      return (
        <Text fz={12} lh={1} fw="bold" className={classes.nowrap}>
          {tA(`${achievementConfig.key}.Progress`, { progress: userAchievement?.progress || 0 })}
        </Text>
      );
    }
  }
  return null;
}

export default function AchievementItem({ achievementConfig, userAchievement }: AchievementItemProps) {
  const t = useTranslations();
  const tA = useTranslations('Achievements');

  // Get star info and colors
  const starInfo = getStarInfo(achievementConfig, userAchievement);
  const { bgColor, borderColor, iconColor, iconBgColor, starColor, progressBarColor } = getColors(
    achievementConfig,
    starInfo
  );

  return (
    <Paper key={achievementConfig.key} shadow="md" p="sm" radius="lg" bg={bgColor} bd={`1px solid ${borderColor}`}>
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gridTemplateRows: 'auto',
          rowGap: '0.5rem',
          columnGap: 'var(--mantine-spacing-sm)',
          alignItems: 'start',
        }}
      >
        <ThemeIcon size="xl" variant="light" h={'100%'} radius={'md'} c={iconColor} bg={iconBgColor}>
          {starInfo.isUnlocked ? (
            <IconTrophy style={{ width: '70%', height: '70%' }} />
          ) : (
            <IconLock style={{ width: '70%', height: '70%' }} />
          )}
        </ThemeIcon>

        <Box>
          <Group justify="space-between" align="center">
            <Group gap={4}>
              <Title order={5} c={'white'}>
                {tA(`${achievementConfig.key}.Name`)}
              </Title>
              {!starInfo.isOneTime && starInfo.isUnlocked && (
                <Title order={5} c={'white'}>
                  - {(userAchievement as IAchievementTiered).currentTier}
                </Title>
              )}
            </Group>
            <Group align="center" gap={4}>
              {Array.from({ length: starInfo.totalStars }).map((_, idx) => (
                <IconStarFilled key={idx} size={20} color={idx < starInfo.filledStars ? starColor : 'var(--mantine-color-dark-4)'} />
              ))}
            </Group>
          </Group>

          <Box>
            {starInfo.isUnlocked ? (
              starInfo.isOneTime ? (
                <Text fz="sm">{tA(`${achievementConfig.key}.Description`)}</Text>
              ) : (
                <Text
                  fz="sm"
                >{((achievementConfig as IAchievementConfigTiered).baseTiers[0].threshold === 1 && (userAchievement as IAchievementTiered).currentTier === 1)
                  ? tA(`${achievementConfig.key}.DescSingular`)
                  : tA(`${achievementConfig.key}.Description`,
                    {
                      value: (achievementConfig as IAchievementConfigTiered).baseTiers[
                        Math.max(0, Math.min(starInfo.filledStars - 1, 4))
                      ]?.threshold,
                    }
                  )}</Text>
              )
            ) : (
              <Text fz="sm">{t('AchievementsPage.Locked')}</Text>
            )}
          </Box>

          <Group wrap="nowrap" mt="xs">
            <Group wrap="nowrap" gap={4}>
              <ProgressDisplay achievementConfig={achievementConfig} starInfo={starInfo} userAchievement={userAchievement} t={t} tA={tA} />
            </Group>
            <Stack h="100%" w="100%" pt={2}>
              {achievementConfig.progressBar !== false && !(starInfo.isUnlocked && !starInfo.isOneTime && (userAchievement as IAchievementTiered)?.currentTier >= 5 && !(achievementConfig as IAchievementConfigTiered).dynamicBonus) && (
                <Progress.Root size="md">
                  {userAchievement && (
                    <Progress.Section
                      color={progressBarColor}
                      value={
                        (userAchievement.progress /
                          (starInfo.isOneTime
                            ? ((achievementConfig as IAchievementConfigOneTime).threshold ?? 1)
                            : (achievementConfig as IAchievementConfigTiered).baseTiers[starInfo.filledStars]?.threshold)) *
                          100 || 0
                      }
                    />
                  )}
                </Progress.Root>
              )}
            </Stack>
            {starInfo.filledStars < 5 && !(starInfo.isUnlocked && starInfo.isOneTime) && (
              <Text fz={12} lh={1} fw="bold" className={classes.nowrap}>
                {!starInfo.isOneTime
                  ? `${(achievementConfig as IAchievementConfigTiered).baseTiers[starInfo.filledStars]?.xp} XP`
                  : `${(achievementConfig as IAchievementConfigOneTime).xp} XP`}
              </Text>
            )}
          </Group>
        </Box>
      </Box>
    </Paper>
  );
}