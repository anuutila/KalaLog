import StatsBadges from "@/components/catchesPage/StatsBadges/StatsBadges";
import { ICatch } from "@/lib/types/catch";
import { Badge, Box, Group, ScrollArea, Stack, Title } from "@mantine/core";
import { RefObject } from "react";
import classes from "./CatchesOverview.module.css";

interface CatchesOverviewProps {
  uniqueYears: string[];
  selectedYear: string | null;
  uniqueBodiesOfWater: string[];
  selectedBodyOfWater: string | null;
  rowCount: number;
  filteredCatches: ICatch[];
  scrollRef: RefObject<HTMLDivElement>;
}

export default function CatchesOverview({ uniqueYears, selectedYear, uniqueBodiesOfWater, selectedBodyOfWater, rowCount, filteredCatches, scrollRef }: CatchesOverviewProps) {
  const bodyOfWaterTitle = selectedBodyOfWater === 'Kaikki vesialueet' ? `${selectedBodyOfWater} (${uniqueBodiesOfWater.length})` : selectedBodyOfWater;
  const yearTitle = selectedYear === 'Kaikki vuodet' ? `${uniqueYears.at(-1)} - ${uniqueYears[0]}` : selectedYear;

  return (
    <Stack c="var(--mantine-color-text)" pb={'md'} w='100%' gap={0}>
      <Title c='white' order={2} p={0} mb={6} ml={'md'} pl={4}>{bodyOfWaterTitle ?? '. . . . . . .'}</Title>
      <Title c='white' order={3} p={0} mb={'md'} ml={'md'} pl={4}>{yearTitle ?? '. . . .'}</Title>
      <Box style={{ position: "relative" }}>
        <ScrollArea viewportRef={scrollRef} type="never">
          <Group gap="sm" wrap="nowrap" pl="md" pr={30}>
            <Badge
              size="lg"
              classNames={{ root: classes.badge }}
              variant="light"
              data-content={`Yhteensä: ${rowCount}`}
              px={12}
              h={28}
              pt={1}
            >
          </Badge>
            <StatsBadges filteredCatches={filteredCatches} />
          </Group>
        </ScrollArea>

        {/* Dynamic Left Gradient */}
        <Box
          w={20}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            background: "linear-gradient(to right, var(--mantine-color-body) 50%, transparent)",
            pointerEvents: "none",
          }}
        />

        {/* Dynamic Right Gradient */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            width: "40px",
            background: "linear-gradient(to left, var(--mantine-color-body) 50%, transparent)",
            pointerEvents: "none",
          }}
        />
      </Box>
    </Stack>
  )
};