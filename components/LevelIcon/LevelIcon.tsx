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
  IconRosette,
  IconRosetteFilled,
} from '@tabler/icons-react';
import { Box, Center } from '@mantine/core';

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
  numberSize?: number;
  iconRosetteFilledSize?: number;
  iconRosetteSize?: number;
  size?: number;
  color?: string;
  stroke?: number;
  left?: number;
  absolutePos?: boolean;
}

export default function LevelIcon({
  level,
  numberSize = 50,
  iconRosetteFilledSize = 60,
  iconRosetteSize = 70,
  size = 70,
  color = 'var(--mantine-color-white)',
  stroke = 2,
  left = 0,
  absolutePos = false,
}: LevelIconProps) {
  // Clamp level between 0 and 29
  const clampedLevel = Math.max(0, Math.min(29, level));
  const IconComponent = levelIcons[clampedLevel];

  return (
    <Box pos={absolutePos ? 'absolute' : 'relative'} h={size} w={size}>
      <Box pos="absolute" top={0} left={left} style={{ zIndex: 1 }} h={size} w={size}>
        <Center w="100%" h="100%">
          <IconRosetteFilled color="var(--mantine-primary-color-filled)" size={iconRosetteFilledSize} stroke={1} />
        </Center>
      </Box>
      <Box pos="absolute" top={0} left={left} style={{ zIndex: 2 }}>
        <IconRosette size={iconRosetteSize} color="var(--mantine-color-body)" stroke={1} />
      </Box>
      <Box pos="absolute" top={0} left={left} style={{ zIndex: 3 }} h={size} w={size}>
        <Center w="100%" h="100%">
          <IconComponent size={numberSize} color={color} stroke={stroke} />
        </Center>
      </Box>
      {/* <Box pos={'absolute'} top={0} left={-60} style={{ zIndex: 2 }} h={70} w={70}>
        <Center w={'100%'} h={'100%'}>
          <IconComponent size={size} color={'black'} stroke={4} />
        </Center>
      </Box> */}
    </Box>
  );
}
