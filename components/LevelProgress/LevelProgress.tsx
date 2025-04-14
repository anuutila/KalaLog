import { Box, Group, Progress } from '@mantine/core';
import LevelIcon from '../LevelIcon/LevelIcon';
import { calculateLevel, progressToNextLevel, xpForLevel } from '@/lib/utils/levelUtils';

interface LevelProgressProps {
  totalXP: number;
  progressLabel?: boolean;
  width?: number | string;
  iconLeftOffset?: number;
  barThickness?: string;
  showLevelIcon?: boolean;
  ml?: number;
}

export default function LevelProgress({ totalXP, progressLabel, width, iconLeftOffset, barThickness = '1.5rem', showLevelIcon = true, ml = 30 }: LevelProgressProps) {
  const currentLevel = calculateLevel(totalXP);
  const nextLevelXP = xpForLevel(currentLevel);
  const progressPercent = progressToNextLevel(totalXP, currentLevel) * 100;

  return (
    <Group align="center" gap={0} justify="center" pos="relative">
      {showLevelIcon && <LevelIcon level={calculateLevel(totalXP)} left={iconLeftOffset} absolutePos/>}
      <Group gap="sm" wrap="nowrap" ml={ml} w={width} align="center">
        <Box h={barThickness} w="100%">
          <Progress.Root
            h="100%"
            bg="var(--mantine-color-dark-5)"
            bd="4px solid var(--mantine-color-body)"
            transitionDuration={700}
            pos={'relative'}
          >
            <Progress.Section value={progressPercent}>
              {progressLabel && 
                <Group pos={'absolute'} top={0} left={0} right={0} bottom={0} align='center' justify='center'>
                  <Progress.Label  fz={'md'} style={{ justifySelf: 'anchor-center'}}>{totalXP} / {nextLevelXP} XP</Progress.Label>
                </Group>
              }
            </Progress.Section>
          </Progress.Root>
        </Box>
      </Group>
    </Group>
  );
}
