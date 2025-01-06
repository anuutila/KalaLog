import StatsBadges from "@/components/catchesPage/StatsBadges/StatsBadges";
import { ICatch } from "@/lib/types/catch";
import { Badge, Box, Group, ScrollArea, Stack, Title } from "@mantine/core";
import { RefObject } from "react";
import classes from "./CatchesOverview.module.css";

interface CatchesOverviewProps {
  selectedYear: string | null;
  rowCount: number;
  filteredCatches: ICatch[];
  scrollRef: RefObject<HTMLDivElement>;
}

export default function CatchesOverview({ selectedYear, rowCount, filteredCatches, scrollRef }: CatchesOverviewProps) {

  return (
    <Stack c="var(--mantine-color-text)" pb={'md'} pt={'md'} w='100%' gap={0}>
      <Title c='white' order={2} p={0} pb={'md'} pl={'xs'} pr={'xs'}>{selectedYear}</Title>
      <Box style={{ position: "relative" }}>
        <ScrollArea viewportRef={scrollRef} type="never">
          <Group gap="xs" wrap="nowrap" pl="xs" pr={30}>
            <Badge
              size="md"
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