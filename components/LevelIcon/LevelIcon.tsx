import { Box, Center } from '@mantine/core';
import {
  IconNumber0Small,
  IconNumber1Small,
  IconNumber2Small,
  IconNumber3Small,
  IconNumber4Small,
  IconNumber5Small,
  IconNumber6Small,
  IconNumber7Small,
  IconNumber8Small,
  IconNumber9Small,
  IconNumber10Small,
  IconNumber11Small,
  IconNumber12Small,
  IconNumber13Small,
  IconNumber14Small,
  IconNumber15Small,
  IconNumber16Small,
  IconNumber17Small,
  IconNumber18Small,
  IconNumber19Small,
  IconNumber20Small,
  IconNumber21Small,
  IconNumber22Small,
  IconNumber23Small,
  IconNumber24Small,
  IconNumber25Small,
  IconNumber26Small,
  IconNumber27Small,
  IconNumber28Small,
  IconNumber29Small,
  IconRosetteFilled,
  IconRosette
} from '@tabler/icons-react';

const levelIcons: Record<number, React.ElementType> = {
  0: IconNumber0Small,
  1: IconNumber1Small,
  2: IconNumber2Small,
  3: IconNumber3Small,
  4: IconNumber4Small,
  5: IconNumber5Small,
  6: IconNumber6Small,
  7: IconNumber7Small,
  8: IconNumber8Small,
  9: IconNumber9Small,
  10: IconNumber10Small,
  11: IconNumber11Small,
  12: IconNumber12Small,
  13: IconNumber13Small,
  14: IconNumber14Small,
  15: IconNumber15Small,
  16: IconNumber16Small,
  17: IconNumber17Small,
  18: IconNumber18Small,
  19: IconNumber19Small,
  20: IconNumber20Small,
  21: IconNumber21Small,
  22: IconNumber22Small,
  23: IconNumber23Small,
  24: IconNumber24Small,
  25: IconNumber25Small,
  26: IconNumber26Small,
  27: IconNumber27Small,
  28: IconNumber28Small,
  29: IconNumber29Small,
};

interface LevelIconProps {
  level: number;
  size?: number;
  color?: string;
  stroke?: number;
}

export default function LevelIcon({
  level,
  size = 50,
  color = 'var(--mantine-color-white)',
  stroke = 2,
}: LevelIconProps) {
  // Clamp level between 0 and 29
  const clampedLevel = Math.max(0, Math.min(29, level));
  const IconComponent = levelIcons[clampedLevel];

  return (
    <Box pos={'relative'} h={70} w={70}>
      <Box pos={'absolute'} top={0} left={20} style={{ zIndex: 1 }} h={70} w={70}>
        <Center w={'100%'} h={'100%'}>
          <IconRosetteFilled color="var(--mantine-primary-color-filled)" size={60} stroke={1} />
        </Center>
      </Box>
      <Box pos={'absolute'} top={0} left={20} style={{ zIndex: 2 }}>
        <IconRosette size={70} color="var(--mantine-color-body)" stroke={1} />
      </Box>
      <Box pos={'absolute'} top={0} left={20} style={{ zIndex: 2 }} h={70} w={70}>
        <Center w={'100%'} h={'100%'}>
          <IconComponent size={size} color={color} stroke={stroke} />
        </Center>
      </Box>
    </Box>
  );
}



