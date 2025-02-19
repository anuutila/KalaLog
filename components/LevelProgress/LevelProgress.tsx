import { Box, Group, Progress } from "@mantine/core";
import LevelIcon from "../LevelIcon/LevelIcon";

const LEVEL_BASE_CONSTANT = 100;

function calculateLevel(totalXP: number): number {
  // Level 1 if XP is less than 100, then level increases as XP increases.
  return Math.floor(Math.sqrt(totalXP / LEVEL_BASE_CONSTANT)) + 1;
}

function xpForLevel(level: number): number {
  return LEVEL_BASE_CONSTANT * level * level;
}

interface LevelProgressProps {
  totalXP: number;
}

function progressToNextLevel(totalXP: number, currentLevel: number): number {
  const xpCurrent = xpForLevel(currentLevel - 1);
  const xpNext = xpForLevel(currentLevel);
  // Calculate fraction of progress between the current and next level
  return (totalXP - xpCurrent) / (xpNext - xpCurrent);
}

export default function LevelProgress({ totalXP }: LevelProgressProps) {
  const currentLevel = calculateLevel(totalXP);
  const progressPercent = progressToNextLevel(totalXP, currentLevel) * 100;

  return (
    <Group align="center" gap={0} justify="center" pos={'relative'}>
      <LevelIcon level={calculateLevel(totalXP)} />
      <Group gap={'sm'} wrap="nowrap" ml={35} w={120} align="center">
        <Box h={'1.5rem'} w={'100%'}>
          <Progress.Root h={'100%'}  bg={'var(--mantine-color-dark-5)'} bd={'4px solid var(--mantine-color-body)'} transitionDuration={700}>
            <Progress.Section value={progressPercent} />
          </Progress.Root>
        </Box>
      </Group>
    </Group>
  )
}