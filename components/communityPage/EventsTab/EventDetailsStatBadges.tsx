import { IEvent } from "@/lib/types/event";
import { IEventStats } from "@/lib/utils/eventUtils";
import { Badge, Box, Group, Stack } from "@mantine/core";
import { IconFish, IconMapPin } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

interface EventStatBadgesProps {
  event: IEvent;
  eventStats: IEventStats;
  eventHasCoverImage?: boolean;
}

export default function EventDetailsStatBadges({ event, eventStats, eventHasCoverImage = false }: EventStatBadgesProps) {
  const tCommunity = useTranslations('CommunityPage');

  return (
    <>
      <Box
        style={eventHasCoverImage ? {
          display: 'inline-block',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',  // dark semi-transparent layer
          borderRadius: '1000px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'  // soft shadow behind
        } : { display: 'inline-block' }}
      >
        <Badge
          color="blue"
          variant="light"
          size="xl"
          bg={eventHasCoverImage ? 'rgba(34, 139, 230, 0.25)' : ''}
          leftSection={<Stack pb={1}><IconFish size={26} /></Stack>}
        >
          {eventStats.totalCatches} {tCommunity('FishCount')}
        </Badge>
      </Box>
      <Group p={0} gap={'sm'} wrap={'nowrap'}>
        {event.bodiesOfWater.map((bodyOfWater) => (
          <Box
            key={bodyOfWater}
            style={eventHasCoverImage ? {
              display: 'inline-block',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',  // dark semi-transparent layer
              borderRadius: '1000px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'  // soft shadow behind
            } : { display: 'inline-block' }}
          >
            <Badge
              color="green"
              variant="light"
              bg={eventHasCoverImage ? 'rgba(64, 192, 87, 0.25)' : ''}
              size="xl" leftSection={<Stack pb={1}><IconMapPin size={22} /></Stack>}
            >
              {bodyOfWater}
            </Badge>
          </Box>
        ))}
      </Group>
    </>
  );
}