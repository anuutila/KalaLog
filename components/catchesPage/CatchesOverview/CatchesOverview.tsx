import StatsBadges from "@/components/catchesPage/StatsBadges/StatsBadges";
import { ICatch } from "@/lib/types/catch";
import { Badge, Box, Group, ScrollArea, Stack, Text } from "@mantine/core";
import { RefObject } from "react";
import classes from "./CatchesOverview.module.css";

interface CatchesOverviewProps {
  selectedYear: string;
  rowCount: number;
  filteredCatches: ICatch[];
  scrollRef: RefObject<HTMLDivElement>;
}

export default function CatchesOverview({ selectedYear, rowCount, filteredCatches, scrollRef }: CatchesOverviewProps) {

  return (
    <Stack c="var(--mantine-color-text)" p={0} w='100%' gap={0}>
          <Text fw={600} c="white" p={0} pb={6} pl={'xs'} pr={'xs'}>Saaliit ajalta: {selectedYear}</Text>
    <Box style={{ position: "relative" }}>
      <ScrollArea viewportRef={scrollRef} type="never">
        <Group gap="xs" wrap="nowrap" pl="xs" pr={30}>
          <Badge
            classNames={{ root: classes.badge }}
            variant="outline"
            data-content={`Yhteensä: ${rowCount}`}
          >
            {rowCount}
          </Badge>
          <StatsBadges filteredCatches={filteredCatches} />
        </Group>
      </ScrollArea>

      {/* Dynamic Left Gradient */}
      <Box
        w="var(--mantine-spacing-sm)"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          background: "linear-gradient(to right, var(--mantine-color-body), transparent)",
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
          background: "linear-gradient(to left, var(--mantine-color-body), transparent)",
          pointerEvents: "none",
        }}
      />
    </Box>
    </Stack>
  )
};