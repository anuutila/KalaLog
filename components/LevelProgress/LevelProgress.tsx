import { Box, Group, Progress } from '@mantine/core';
import LevelIcon from '../LevelIcon/LevelIcon';
import { calculateLevel, progressToNextLevel } from '@/lib/utils/levelUtils';

interface LevelProgressProps {
  totalXP: number;
}

export default function LevelProgress({ totalXP }: LevelProgressProps) {
  const currentLevel = calculateLevel(totalXP);
  const progressPercent = progressToNextLevel(totalXP, currentLevel) * 100;

  return (
    <Group align="center" gap={0} justify="center" pos="relative">
      <LevelIcon level={calculateLevel(totalXP)} left={-60} absolutePos/>
      <Group gap="sm" wrap="nowrap" ml={30} w={125} align="center">
        <Box h="1.5rem" w="100%">
          <Progress.Root
            h="100%"
            bg="var(--mantine-color-dark-5)"
            bd="4px solid var(--mantine-color-body)"
            transitionDuration={700}
          >
            <Progress.Section value={progressPercent} />
          </Progress.Root>
        </Box>
      </Group>
    </Group>
  );
}
