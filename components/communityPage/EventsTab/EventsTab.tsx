import { UnregisteredUserInfo } from "@/app/community/page";
import { useGlobalState } from "@/context/GlobalState";
import { IEvent } from "@/lib/types/event";
import { EventsResponse } from "@/lib/types/responses";
import { editorRoles, IPublicUserProfile, UserRole } from "@/lib/types/user";
import { calculateEventStats } from "@/lib/utils/eventUtils";
import { handleApiError } from "@/lib/utils/handleApiError";
import { getEvents } from "@/services/api/eventService";
import { ActionIcon, Affix, Avatar, AvatarGroup, Badge, Box, darken, Group, lighten, Paper, Skeleton, Stack, Text, Title, Tooltip } from "@mantine/core";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import CreateEventForm from "./CreateEventForm";
import { IconCalendar, IconChevronRight, IconFish, IconMapPin, IconPlus } from "@tabler/icons-react";
import { nameToColor } from "@/lib/utils/utils";
import { useFormatter, useTranslations } from "next-intl";
import EventDetails from "./EventDetails";

interface EventsTabProps {
  allUsers: (IPublicUserProfile | UnregisteredUserInfo)[];
}

export default function EventsTab({ allUsers }: EventsTabProps) {
  const tCommunity = useTranslations('CommunityPage');
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const { jwtUserInfo: userInfo, catches } = useGlobalState();
  const canCreateEvents = userInfo?.role && [UserRole.TRUSTED_CREATOR, ...editorRoles].includes(userInfo.role);

  const handleOpenCreateForm = () => setShowCreateForm(true);
  const handleCloseCreateForm = () => setShowCreateForm(false);

  const handleOpenEventDetails = () => setShowEventDetails(true);
  const handleCloseEventDetails = () => setShowEventDetails(false);

  const handleEventCreated = () => {
    handleCloseCreateForm();
    fetchData(); // Refresh event list
  };

  const onCloseEventDetails = () => {
    handleCloseEventDetails();
    setSelectedEvent(null);
  }

  useEffect(() => {
    if (selectedEvent) {
      handleOpenEventDetails();
    }
  }, [selectedEvent]);

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

  const tooltipLabelContent = (remainingNames: string[]) => (
    <Stack gap={2}>
      {remainingNames.map(name => (
        <Text key={name} size="sm">{name}</Text>
      ))}
    </Stack>
  );

  const format = useFormatter();

  const getDateRange = (event: IEvent) => {

    const startDateObj = new Date(event.startDate);
    const endDateObj = new Date(event.endDate);

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };

    const optionsWithYear: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    const dayOnlyOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
    };

    const formattedStart = format.dateTime(startDateObj, options);
    const formattedEnd = format.dateTime(endDateObj, options);
    const formattedYear = format.dateTime(endDateObj, { year: 'numeric' });

    let dateRangeString = `${formattedStart} - ${formattedEnd}, ${formattedYear}`;

    if (dayjs(event.startDate).isSame(dayjs(event.endDate), 'month')) {
      const startDayOnly = format.dateTime(startDateObj, dayOnlyOptions);
      dateRangeString = `${startDayOnly}. - ${formattedEnd}, ${formattedYear}`;
    }
    if (!dayjs(event.startDate).isSame(dayjs(event.endDate), 'year')) {
      const formattedStartWithYear = format.dateTime(startDateObj, optionsWithYear);
      dateRangeString = `${formattedStartWithYear} - ${formattedEnd}, ${formattedYear}`;
    }

    return dateRangeString.replace(/k./g, 'k'); // Remove extra dot
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
            const stats = calculateEventStats(event, catches);
            const participantNames = event.participants
              .map(p => p ? `${p.firstName} ${p.lastName}` : 'Unknown User');
            const unregisteredNames = event.unregisteredParticipants || [];
            const allParticipantNames = [...participantNames, ...unregisteredNames].sort();

            let maxAvatarsVisible = 4
            if (allParticipantNames.length > maxAvatarsVisible) {
              maxAvatarsVisible -= 1;
            }

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
                        <Group align="center" gap="xs">
                          <IconCalendar size={24} color="#c9c9c9" stroke={2} />
                          <Text fz={'md'} fw={500} mr={-10}>
                            {getDateRange(event)}
                          </Text>
                        </Group>
                      </Stack>
                      <AvatarGroup>
                        {allParticipantNames.slice(0, maxAvatarsVisible).map(participant => {
                          const color = nameToColor(participant);
                          const borderColor = darken(`var(--mantine-color-${color}-light-color)`, 0.5);
                          return (
                            <Tooltip
                              key={participant}
                              label={participant}
                              withArrow
                              arrowSize={8}
                              position="top"
                              events={{ hover: true, focus: true, touch: true }}>
                              <Avatar
                                size={36}
                                radius={'xl'}
                                name={participant}
                                color={color}
                                style={{
                                  border: `3px solid ${borderColor}`,
                                  outline: '2px solid var(--my-ui-item-background-color)',
                                  outlineOffset: '-1px',
                                  boxSizing: 'content-box'
                                }}
                              />
                            </Tooltip>
                          );
                        })}
                        {allParticipantNames.length > maxAvatarsVisible &&
                          <Tooltip
                            label={tooltipLabelContent(allParticipantNames.slice(maxAvatarsVisible))}
                            withArrow
                            arrowSize={8}
                            position="top"
                            events={{ hover: true, focus: true, touch: true }}
                          >
                            <Avatar
                              size={36}
                              radius="xl"
                              color="gray"
                              style={{
                                border: `3px solid ${borderColorGray}`,
                                outline: '2px solid var(--my-ui-item-background-color)',
                                outlineOffset: '-1px',
                                boxSizing: 'content-box'
                              }}
                            >
                              +{allParticipantNames.length - maxAvatarsVisible}
                            </Avatar>
                          </Tooltip>
                        }
                      </AvatarGroup>
                    </Group>
                    <Group gap={'xs'} maw={'90%'}>
                      <Badge
                        px={12}
                        pt={1}
                        h={28}
                        color="green"
                        variant="light"
                        size="lg" leftSection={<Stack pb={1}><IconMapPin size={20} /></Stack>}
                      // styles={{ label: { color: greenBadgeColor } }}
                      >
                        {event.bodiesOfWater.join(', ')}
                      </Badge>
                      <Badge
                        px={12}
                        pt={1}
                        h={28}
                        color="blue"
                        variant="light"
                        size="lg"
                        leftSection={<Stack pb={1}><IconFish size={24} /></Stack>}
                      // styles={{ label: { color: blueBadgeColor } }}
                      >
                        {stats.totalCatches} {tCommunity('FishCount')}
                      </Badge>
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
                    <Stack p={20} justify="end" onClick={() => setSelectedEvent(event)} style={{ pointerEvents: 'auto' }}>
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
        {showEventDetails && (
          <EventDetails
            event={selectedEvent}
            onCloseAction={onCloseEventDetails}
          />
        )}
      </Stack>

      {canCreateEvents && !showCreateForm && !showEventDetails && (
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