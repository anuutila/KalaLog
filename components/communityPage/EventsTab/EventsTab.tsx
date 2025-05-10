import { UnregisteredUserInfo } from "@/app/community/page";
import { useGlobalState } from "@/context/GlobalState";
import { IEvent } from "@/lib/types/event";
import { EventsResponse } from "@/lib/types/responses";
import { editorRoles, IPublicUserProfile, UserRole } from "@/lib/types/user";
import { calculateEventStats, generateAllParticipantNames, IEventStats } from "@/lib/utils/eventUtils";
import { handleApiError } from "@/lib/utils/handleApiError";
import { getEvents } from "@/services/api/eventService";
import { ActionIcon, Affix, Avatar, AvatarGroup, Badge, Box, darken, Group, lighten, Paper, Skeleton, Stack, Text, Title, Tooltip } from "@mantine/core";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import CreateEventForm from "./CreateEventForm";
import { IconCalendar, IconChevronRight, IconFish, IconMapPin, IconPlus } from "@tabler/icons-react";
import { nameToColor } from "@/lib/utils/utils";
import { useFormatter, useTranslations } from "next-intl";
import EventDetails, { EventDetailsProps } from "./EventDetails";
import { useRouter, useSearchParams } from "next/navigation";
import ParticipantAvatarGroup from "./ParticipantAvatarGroup";
import EventStatBadges from "./EventStatBadges";

interface EventsTabProps {
  allUsers: (IPublicUserProfile | UnregisteredUserInfo)[];
}

export default function EventsTab({ allUsers }: EventsTabProps) {
  const tCommunity = useTranslations('CommunityPage');
  const format = useFormatter();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<EventDetailsProps | null>(null);
  const { jwtUserInfo: userInfo, catches } = useGlobalState();
  const canCreateEvents = userInfo?.role && [UserRole.TRUSTED_CREATOR, ...editorRoles].includes(userInfo.role);

  const handleOpenCreateForm = () => setShowCreateForm(true);
  const handleCloseCreateForm = () => setShowCreateForm(false);

  const handleEventCreated = () => {
    handleCloseCreateForm();
    fetchData(); // Refresh event list
  };

  const fetchData = async () => {
    setLoadingEvents(true);
    try {
      const eventsResponse: EventsResponse = await getEvents();
      setEvents(eventsResponse.data);
    } catch (err: any) {
      handleApiError(err, 'fetching events');
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loadingEvents && events.length > 0) {
      const param = searchParams.get('eventId');
      if (param) {
        if (!selectedEventDetails) {
          const foundEvent = events.find(e => e.id === param) || null;
          const stats = foundEvent ? calculateEventStats(foundEvent, catches) : null;
          if (foundEvent && stats) {
            setSelectedEventDetails({ event: foundEvent, stats });
          } else {
            setSelectedEventDetails(null);
          }
        }
      } else {
        setSelectedEventDetails(null);
      }

      setEventDetailsOpen(!!param);
    }
  }, [searchParams, loadingEvents, events]);

  const openEventDetails = (event: IEvent, stats: IEventStats) => {
    console.log('Selected event:', event);
    setSelectedEventDetails({ event, stats });
    const url = new URL(window.location.href)
    url.pathname = '/community'
    url.searchParams.set('eventId', event.id)
    url.hash = 'events'
    router.push(url.toString(), { scroll: false })
  };

  const getDateRange = (event: IEvent) => {
    const startDateObj = new Date(event.startDate);
    const endDateObj = new Date(event.endDate);

    const formattedStart = format.dateTime(startDateObj, { month: 'short', day: 'numeric'});
    const formattedEnd = format.dateTime(endDateObj, { month: 'short', day: 'numeric'});
    const formattedYear = format.dateTime(endDateObj, { year: 'numeric' });

    // let dateRangeString = `${formattedStart} - ${formattedEnd}, ${formattedYear}`;
    let dateRangeString = `${formattedStart} - ${formattedEnd}`;

    if (dayjs(event.startDate).isSame(dayjs(event.endDate), 'month')) {
      const startDayOnly = format.dateTime(startDateObj, { day: 'numeric' });
      // dateRangeString = `${startDayOnly}. - ${formattedEnd}, ${formattedYear}`;
      // dateRangeString = `${startDayOnly}. - ${formattedEnd}`;
    }
    if (!dayjs(event.startDate).isSame(dayjs(event.endDate), 'year')) {
      const formattedStartWithYear = format.dateTime(startDateObj, { year: 'numeric', month: 'short', day: 'numeric' });
      // dateRangeString = `${formattedStartWithYear} - ${formattedEnd}, ${formattedYear}`;
      // dateRangeString = `${formattedStartWithYear} - ${formattedEnd}`;
    }
    if (dayjs(event.startDate).isSame(dayjs(event.endDate), 'day')) {
      dateRangeString = formattedStart;
    }

    return dateRangeString //.replace(/k./g, 'k'); // Remove extra dot
  }

  const borderColorGray = darken(`var(--mantine-color-gray-light-color)`, 0.5);
  const greenBadgeColor = lighten(`var(--mantine-color-green-light-color)`, 0.75);
  const blueBadgeColor = lighten(`var(--mantine-color-blue-light-color)`, 0.75);
  let displayedYear: string | null = null;

  return (
    <>
      <Stack gap={14} pt={'md'} px={'md'} pb={100}>

        {loadingEvents
          ? <Stack gap={14}>
              <Group
                h={'calc(var(--mantine-h1-line-height)*var(--mantine-h1-font-size))'}
                gap={8}
                pl={4}
              >
                {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} height={14} mx={0} circle />)}
              </Group>
              {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} height={142} radius="lg" />)}
            </Stack>
          : events.map((event) => {
            const stats: IEventStats = calculateEventStats(event, catches);
            const allParticipantNames = generateAllParticipantNames(event);

            let renderYearTitle = false;
            const currentEventYear = dayjs(event.startDate).format('YYYY');
            if (currentEventYear !== displayedYear) {
              renderYearTitle = true;
              displayedYear = currentEventYear;
            }

            return (
              <Stack gap={'xs'} key={event.id}>
                {renderYearTitle &&
                  <Title ml={4} order={1} c={'white'}>
                    {currentEventYear}
                  </Title>
                }
                <Paper
                  p={'md'}
                  radius={'lg'}
                  bg={'var(--my-ui-item-background-color)'}
                  shadow="md"
                  pos={'relative'}>
                  <Stack>
                    <Group align="top" justify="space-between">
                      <Stack flex={1} gap={'xs'}>
                        <Title order={3} c={'white'} >{event.name}</Title>
                        <Group align="center" gap="xs" wrap={'nowrap'}>
                          <IconCalendar size={24} color="#c9c9c9" stroke={2} />
                          <Text fz={'md'} fw={500} mr={-16} style={{ whiteSpace: 'nowrap' }}>
                            {getDateRange(event)}
                          </Text>
                        </Group>
                      </Stack>
                      <ParticipantAvatarGroup
                        participantNames={allParticipantNames}
                        maxAvatarsVisible={4}
                      />
                    </Group>
                    <Group gap={'xs'} maw={'90%'}>
                      <EventStatBadges
                        event={event}
                        eventStats={stats}
                      />
                    </Group>
                  </Stack>
                  <Box
                    pos={'absolute'}
                    top={0}
                    right={0}
                    h={'100%'}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      pointerEvents: 'none'
                    }}
                  >
                    <Stack p={20} justify="end" onClick={() => openEventDetails(event, stats)} style={{ pointerEvents: 'auto' }}>
                      <IconChevronRight size={20} stroke={2.5} />
                    </Stack>
                  </Box>
                </Paper>
              </Stack>
            )
          })}

        {showCreateForm && (
          <CreateEventForm
            users={allUsers}
            catches={catches}
            onSuccessAction={handleEventCreated}
            onCancelAction={handleCloseCreateForm}
          />
        )}
        {eventDetailsOpen && selectedEventDetails && (
          <EventDetails
            event={selectedEventDetails.event}
            stats={selectedEventDetails.stats}
          />
        )}
      </Stack>

      {canCreateEvents && !showCreateForm && !eventDetailsOpen && (
        <Affix bottom={{ base: 'calc(var(--app-shell-footer-offset) + env(safe-area-inset-bottom) + 20px)', md: 0 }} right={20} zIndex={350}>
          <Tooltip label={tCommunity('CreateButtonTooltip')} position="left" withArrow>
            <ActionIcon
              size="56"
              radius="xl"
              variant="filled"
              color={'var(--mantine-color-dark-9)'}
              bd={'3px solid var(--mantine-color-blue-6)'}
              c={'var(--mantine-color-blue-5)'}
              onClick={handleOpenCreateForm}
              disabled={loadingEvents}
              style={{
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.9)',
                outline: '2px solid var(--mantine-color-dark-9)',
              }}
            >
              <IconPlus style={{ width: '60%', height: '60%' }} stroke={2.5} />
            </ActionIcon>
          </Tooltip>
        </Affix>
      )}
    </>
  );
}