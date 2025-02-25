import { RefObject } from 'react';
import { IconCalendarFilled, IconMapPinFilled } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { Badge, Box, Group, ScrollArea, Stack, Title } from '@mantine/core';
import StatsBadges from '@/components/catchesPage/StatsBadges/StatsBadges';
import { ICatch } from '@/lib/types/catch';
import classes from './CatchesOverview.module.css';

interface CatchesOverviewProps {
  uniqueYears: string[];
  selectedYear: string | null;
  uniqueBodiesOfWater: string[];
  selectedBodyOfWater: string | null;
  rowCount: number;
  filteredCatches: ICatch[];
  scrollRef: RefObject<HTMLDivElement>;
}

export default function CatchesOverview({
  uniqueYears,
  selectedYear,
  uniqueBodiesOfWater,
  selectedBodyOfWater,
  rowCount,
  filteredCatches,
  scrollRef,
}: CatchesOverviewProps) {
  const t = useTranslations();
  const bodyOfWaterTitle =
    selectedBodyOfWater === 'AllBodiesOfWater'
      ? `${t('CatchesPage.TableSettings.AllBodiesOfWater')} (${uniqueBodiesOfWater.length})`
      : selectedBodyOfWater;
  const yearTitle = selectedYear === 'AllYears' ? `${uniqueYears.at(-1)} - ${uniqueYears[0]}` : selectedYear;

  return (
    <Stack c="var(--mantine-color-text)" pb="md" w="100%" gap={0}>
      <Group align="center" ml="md" mb={6} gap="xs">
        <Box w={24} h={{ base: '100%', md: 24 }}>
          <IconMapPinFilled size={24} color="rgba(255,255,255,0.35)" stroke={1.5} />
        </Box>
        <Title c="white" order={2} p={0}>
          {bodyOfWaterTitle ?? '. . . . . . .'}
        </Title>
      </Group>
      <Group align="center" mb="md" ml="md" gap="xs" h="100%">
        <Box w={24} h={{ base: 28, md: 24 }}>
          <IconCalendarFilled size={24} color="rgba(255,255,255,0.35)" stroke={1.5} />
        </Box>
        <Title c="white" order={3} p={0}>
          {yearTitle ?? '. . . .'}
        </Title>
      </Group>
      <Box style={{ position: 'relative' }}>
        <ScrollArea viewportRef={scrollRef} type="never">
          <Group gap="sm" wrap="nowrap" pl="md" pr={30}>
            <Badge
              size="lg"
              classNames={{ root: classes.badge }}
              variant="light"
              data-content={`${t('Common.Total')}: ${rowCount}`}
              px={12}
              h={28}
              pt={1}
            />
            <StatsBadges filteredCatches={filteredCatches} />
          </Group>
        </ScrollArea>

        {/* Dynamic Left Gradient */}
        <Box
          w={20}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            background: 'linear-gradient(to right, var(--mantine-color-body) 50%, transparent)',
            pointerEvents: 'none',
          }}
        />

        {/* Dynamic Right Gradient */}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100%',
            width: '40px',
            background: 'linear-gradient(to left, var(--mantine-color-body) 50%, transparent)',
            pointerEvents: 'none',
          }}
        />
      </Box>
    </Stack>
  );
}
