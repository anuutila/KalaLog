import ConfirmEditModal from "@/components/catchesPage/CatchDetails/ConfirmEditModal";
import SpeciesDonutChart from "@/components/charts/SpeciesDonutChart/SpeciesDonutChart";
import { useGlobalState } from "@/context/GlobalState";
import { useHeaderActions } from "@/context/HeaderActionsContext";
import { showNotification } from "@/lib/notifications/notifications";
import { IEvent, IPopulatedEventUserSchema } from "@/lib/types/event";
import { creatorRoles, editorRoles } from "@/lib/types/user";
import { generateAllParticipantNames, IEventStats } from "@/lib/utils/eventUtils";
import { nameToColor, navigateBack } from "@/lib/utils/utils";
import { Accordion, ActionIcon, Avatar, Box, Container, CopyButton, Group, Paper, Stack, Text, Title, Tooltip, Transition } from "@mantine/core";
import { IconCalendar, IconCheck, IconChevronLeft, IconChevronRight, IconPencil, IconShare, IconTrash, IconUser, IconX } from "@tabler/icons-react";
import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ParticipantAvatarGroup from "./ParticipantAvatarGroup";
import Link from "next/link";
import dayjs from "dayjs";
import CatchMap from "@/components/CatchMap/CatchMap";
import EventStatBadges from "./EventStatBadges";
import EventLeaderboardBarChart from "./EventLeaderBoardBarChart";

export interface EventDetailsProps {
  event: IEvent;
  stats: IEventStats;
}

export default function EventDetails({ event, stats }: EventDetailsProps) {
  const t = useTranslations();
  const format = useFormatter();
  const router = useRouter();
  const { isLoggedIn, jwtUserInfo, previousPath, displayNameMap } = useGlobalState();
  const { setActions, setPageTitle } = useHeaderActions();
  const [isInEditView, setIsInEditView] = useState(false);
  const [accordionValue, setAccordionValue] = useState<string | null>(null);

  const urlToCopy = typeof window !== 'undefined'
    ? `${window.location.origin}/community?eventId=${event.id}#events`
    : '';

  useEffect(() => {
    // Set the page title
    setPageTitle(t('CommunityPage.EventDetails'));

    return () => {
      setPageTitle(null);
    };
  }, []);

  // Effect to set Header Action (Back Button)
  useEffect(() => {
    setActions(
      <ActionIcon
        size="lg"
        variant="transparent"
        c="white"
        onClick={() => navigateBack(router, '/community#events', '/community#events')}
      >
        <IconChevronLeft style={{ width: '100%', height: '100%' }} />
      </ActionIcon>
    );

    return () => setActions(null);
  }, [router, setActions, previousPath]);

  const canEdit = () => {
    if (!isLoggedIn || !jwtUserInfo) {
      return false;
    }
    if (editorRoles.includes(jwtUserInfo.role)) {
      return true;
    }
    if (creatorRoles.includes(jwtUserInfo.role)) {
      return jwtUserInfo.userId === event?.createdBy?.id;
    }
    return false;
  }

  const openConfirmEditModal = () => {
    // ConfirmEditModal({
    //   onConfirm: () => {
    //     setIsInEditView(true);
    //   },
    //   t,
    // });
  };

  const openCancelEditModal = (navigateToCatches: boolean) => {
    // CancelEditModal({
    //   onConfirm: () => {
    //     setIsInEditView(false);
    //     if (navigateToCatches) {
    //       navigateBack(router, previousPath);
    //     }
    //   },
    //   t,
    // });
  };

  const openConfirmDeleteModal = () => {
    // ConfirmDeleteModal({
    //   onConfirm: () => {
    //     handleDeleteCatch(selectedCatch.id);
    //   },
    //   t,
    // });
  };

  const getDateRange = (event: IEvent) => {
    const startDateObj = new Date(event.startDate);
    const endDateObj = new Date(event.endDate);

    const formattedStart = format.dateTime(startDateObj, { month: 'long', day: 'numeric' });
    const formattedEnd = format.dateTime(endDateObj, { month: 'long', day: 'numeric' });
    const formattedYear = format.dateTime(endDateObj, { year: 'numeric' });

    let dateRangeString = `${formattedStart} - ${formattedEnd}, ${formattedYear}`;

    if (dayjs(event.startDate).isSame(dayjs(event.endDate), 'month')) {
      const startDayOnly = format.dateTime(startDateObj, { day: 'numeric' });
      dateRangeString = `${startDayOnly}. - ${formattedEnd}, ${formattedYear}`;
    }
    if (!dayjs(event.startDate).isSame(dayjs(event.endDate), 'year')) {
      const formattedStartWithYear = format.dateTime(startDateObj, { year: 'numeric', month: 'short', day: 'numeric' });
      dateRangeString = `${formattedStartWithYear} - ${formattedEnd}, ${formattedYear}`;
    }

    return dateRangeString //.replace(/k./g, 'k'); // Remove extra dot
  }

  const isParticipantsPanelOpen = accordionValue === 'osallistujat';

  const allParticipants: (IPopulatedEventUserSchema | string)[] = [...(event.participants || []), ...(event.unregisteredParticipants || [])].sort((a, b) => {
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b);
    } else if (typeof a === 'string' && typeof b !== 'string') {
      return a.localeCompare(b?.firstName ?? '');
    }
    else if (typeof a !== 'string' && typeof b === 'string') {
      return a?.firstName.localeCompare(b) ?? 0;
    } else if (typeof a !== 'string' && typeof b !== 'string' && a && b) {
      return a?.firstName.localeCompare(b?.firstName);
    } else {
      return 0;
    }
  });

  const catchesWithCoordsAmount = stats.eventCatches.filter(catchItem => catchItem.location.coordinates).length || 0;

  return (
    <Paper
      pos="fixed"
      top="var(--app-shell-header-offset)"
      bottom={{ base: 'calc(var(--app-shell-footer-offset) + env(safe-area-inset-bottom))', md: 0 }}
      left={0}
      w="100%"
      p="md"
      radius={0}
      style={{
        backgroundColor: 'var(--mantine-color-body)',
        zIndex: 100,
        overflowY: 'auto',
      }}
    >
      <Container p={0} size="sm">
        <Stack p={0} gap={'sm'}>
          <Stack p={0} gap={8}>
            <Group mb={4} wrap={'nowrap'}>
              <Title order={2} mr="auto" pl={4} c={'white'}>{event.name}</Title>
              <Group gap="xs" align={'center'} wrap={'nowrap'}>
                {/* Copy Link Button */}
                {!isInEditView && (
                  <CopyButton value={urlToCopy} timeout={4000}>
                    {({ copied, copy }) => (
                      <Tooltip
                        label={copied ? t('Tooltips.LinkCopied') : t('Tooltips.CopyLink')}
                        withArrow
                        position="bottom"
                        events={{ focus: true, hover: true, touch: false }}
                      >
                        <ActionIcon
                          size={'lg'}
                          variant="light"
                          color={copied ? 'teal' : 'cyan'}
                          style={{ transition: 'background-color 100ms ease, color 300ms ease' }}
                          onClick={() => {
                            copy();
                            showNotification(
                              'success',
                              t('Notifications.EventLinkCopiedMessage', { eventName: event.name }),
                              { withTitle: true, title: t('Notifications.LinkCopiedTitle') }
                            );
                          }}
                          aria-label="Copy shareable link"
                        >
                          {copied ? <IconCheck size={20} /> : <IconShare size={20} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                )}
                {/* Edit Button */}
                {!isInEditView && (
                  <ActionIcon size="lg" variant="light" color="blue" onClick={openConfirmEditModal} disabled={true}>
                    <IconPencil size={20} />
                  </ActionIcon>
                )}
                {/* Delete Button */}
                {!isInEditView && (
                  <ActionIcon
                    size="lg"
                    variant="light"
                    color="red"
                    disabled={true}
                    onClick={() => openConfirmDeleteModal()}
                  >
                    <IconTrash size={20} />
                  </ActionIcon>
                )}
                {/* Close Button Mobile*/}
                {isInEditView && <ActionIcon
                  size="lg"
                  variant="light"
                  color="gray"
                  hiddenFrom="md"
                  onClick={() => openCancelEditModal(false)}
                >
                  <IconX size={20} />
                </ActionIcon>}
                {/* Close Button Desktop*/}
                <ActionIcon
                  size="lg"
                  variant="light"
                  color="gray"
                  visibleFrom="md"
                  onClick={
                    isInEditView
                      ? () => openCancelEditModal(false)
                      : () => {
                        navigateBack(router, previousPath);
                      }
                  }
                >
                  <IconX size={20} />
                </ActionIcon>
              </Group>
            </Group>
            <Group align="center" gap="xs" wrap={'nowrap'} pl={4} mt={6}>
              <IconCalendar size={24} color="#c9c9c9" stroke={2} />
              <Text fz={18} fw={500} style={{ whiteSpace: 'nowrap' }}>
                {getDateRange(event)}
              </Text>
            </Group>
            <Stack gap={'sm'} mt={'sm'}>
              <EventStatBadges
                event={event}
                eventStats={stats}
              />
            </Stack>
          </Stack>
          <Paper w={'100%'} radius={'lg'} bg={"var(--my-ui-item-background-color)"}>
            <Accordion
              radius={'lg'}
              variant="filled"
              value={accordionValue}
              onChange={setAccordionValue}
              styles={{ item: { backgroundColor: 'var(--my-ui-item-background-color)' } }}
            >
              <Accordion.Item value={'osallistujat'}>
                <Accordion.Control>
                  <Group align={'center'} gap={0} justify={'space-between'} w={'100%'} h={42}>
                    <Title order={3} c={'white'}>{t('CommunityPage.Participants')}</Title>
                    <Transition
                      mounted={!isParticipantsPanelOpen}
                      transition="fade"
                      duration={200}
                      timingFunction="ease"
                    >
                      {(styles) => (
                        <Box mr={'md'} style={styles}>
                          <ParticipantAvatarGroup
                            participantNames={generateAllParticipantNames(event)}
                            maxAvatarsVisible={5}
                            disableTooltip={true}
                          />
                        </Box>
                      )}
                    </Transition>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack p={0} gap={'xs'}>
                    {allParticipants.map((user) => (
                      user && typeof user !== 'string'
                        ? <Link
                          href={`/user/${user.username}`}
                          passHref
                          prefetch
                          style={{ textDecoration: 'none', color: 'inherit' }}
                          key={user.id}
                        >
                          <Paper p={0} pr={6} bg="transparent">
                            <Group gap={0} wrap={'nowrap'}>
                              <Avatar
                                radius="100%"
                                size={45}
                                name={`${user.firstName} ${user.lastName ?? ''}`}
                                color={nameToColor(`${user.firstName} ${user.lastName ?? ''}`)}
                              />
                              <Stack pl={14} mr={'auto'} p={0} gap={0}>
                                <Text fz={18} fw={500} c={'white'}>{user.firstName} {user.lastName}</Text>
                                <Text fz={14}>@{user.username}</Text>
                              </Stack>
                              {/* <LevelIcon level={user.level ?? 1} numberSize={40} iconRosetteFilledSize={50} iconRosetteSize={60} size={60} /> */}
                              <Stack align="center" c={'dimmed'}>
                                <IconChevronRight size={20} stroke={2.5} style={{ marginLeft: '-5px' }} />
                              </Stack>
                            </Group>
                          </Paper>
                        </Link>
                        : user ?
                          <Paper p={0} pr={6} radius={'lg'} bg="transparent" key={user}>
                            <Group gap={0} wrap={'nowrap'}>
                              <Avatar
                                radius="100%"
                                size={45}
                                name={user}
                                color={nameToColor(user)}
                              />
                              <Stack pl={14} mr={'auto'} p={0} gap={0}>
                                <Text fz={18} fw={500} c={'white'}>{user}</Text>
                              </Stack>
                            </Group>
                          </Paper> : null
                    ))}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Paper>
          <Paper p={'md'} pr={10} w={'100%'} radius={'lg'} bg={"var(--my-ui-item-background-color)"} 
            h={allParticipants.length < 10 ? Math.max((600 - (10 - allParticipants.length) * 40), 280) : 600}>
            <Stack p={0} gap={'md'} h={'100%'}>
              <Title order={3} c={'white'}>{t('CommunityPage.Leaderboard')}</Title>
              <Paper flex={1} bg={'transparent'}>
                <EventLeaderboardBarChart
                  catches={stats.eventCatches}
                  userInfo={jwtUserInfo}
                  userDisplayNameMap={displayNameMap}
                  allUserInfos={event.participants}
                  unregisteredParticipants={event.unregisteredParticipants}
                />
              </Paper>
            </Stack>
          </Paper>
          <Paper p={'md'} w={'100%'} radius={'lg'} bg={"var(--my-ui-item-background-color)"}>
            <Stack p={0} gap={0}>
              <Title order={3} c={'white'}>{t('StatisticsPage.SpeciesDistribution')}</Title>
              <Paper flex={1} bg={'transparent'}>
                <SpeciesDonutChart catches={stats.eventCatches} />
              </Paper>
            </Stack>
          </Paper>
          {catchesWithCoordsAmount > 0 && <Paper
            p={0}
            w={'100%'}
            h={400}
            radius={'lg'}
            pos={'relative'}
            bg={"var(--my-ui-item-background-color)"}
            style={{ overflow: 'hidden' }}
          >
            <CatchMap
              mapCatches={stats.eventCatches}
              urlHash={'events'}
            />
            <Box
              py={4}
              px={8}
              pos={'absolute'}
              bottom={0}
              left={0}
              bg={"var(--my-ui-item-background-color)"}
              style={{
                borderTopRightRadius: '12px',
                borderBottomLeftRadius: '16px',
                border: '1px solid #424242',
              }}
            >
              <Text fz={14} c={'dimmed'}>{t('CommunityPage.CatchMapNote', { amount: catchesWithCoordsAmount, totalAmount: stats.totalCatches })}</Text>
            </Box>
          </Paper>}
        </Stack>
      </Container>
    </Paper>
  );
}