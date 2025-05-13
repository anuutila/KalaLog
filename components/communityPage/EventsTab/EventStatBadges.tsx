import { IEvent } from "@/lib/types/event";
import { IEventStats } from "@/lib/utils/eventUtils";
import { Badge, Stack } from "@mantine/core";
import { IconFish, IconMapPin } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

interface EventStatBadgesProps {
  event: IEvent;
  eventStats: IEventStats;
}

export default function EventStatBadges({ event, eventStats }: EventStatBadgesProps) {
  const tCommunity = useTranslations('CommunityPage');

  return (
    <>
      <Badge
        px={12}
        pt={1}
        h={28}
        color="blue"
        variant="light"
        size="lg"
        leftSection={<Stack pb={1}><IconFish size={24} /></Stack>}
      >
        {eventStats.totalCatches} {tCommunity('FishCount')}
      </Badge>
      {event.bodiesOfWater.map((bodyOfWater) => (
        <Badge
          key={bodyOfWater}
          px={12}
          pt={1}
          h={28}
          color="green"
          variant="light"
          size="lg" leftSection={<Stack pb={1}><IconMapPin size={20} /></Stack>}
        >
          {bodyOfWater}
        </Badge>))}
    </>
  );
}