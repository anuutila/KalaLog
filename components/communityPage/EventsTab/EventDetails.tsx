import SpeciesDonutChart from "@/components/charts/SpeciesDonutChart/SpeciesDonutChart";
import { useGlobalState } from "@/context/GlobalState";
import { useHeaderActions } from "@/context/HeaderActionsContext";
import { showNotification } from "@/lib/notifications/notifications";
import { IEvent, IPopulatedEventUserSchema } from "@/lib/types/event";
import { creatorRoles, editorRoles, UserRole } from "@/lib/types/user";
import { generateAllParticipantNames, IEventStats } from "@/lib/utils/eventUtils";
import { nameToColor, navigateBack } from "@/lib/utils/utils";
import { Accordion, ActionIcon, Avatar, Box, Container, CopyButton, Group, Paper, Stack, Text, Title, Tooltip, Transition } from "@mantine/core";
import { IconCalendar, IconCheck, IconChevronLeft, IconChevronRight, IconPencil, IconShare, IconTrash, IconUser, IconX } from "@tabler/icons-react";
import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ParticipantAvatarGroup from "./ParticipantAvatarGroup";
import Link from "next/link";
import dayjs from "dayjs";
import CatchMap from "@/components/CatchMap/CatchMap";
import EventLeaderboardBarChart from "./EventLeaderBoardBarChart";
import EventDetailsStatBadges from "./EventDetailsStatBadges";
import classes from './EventDetails.module.css';
import { getSignedImageURLs } from "@/services/api/imageService";
import { SignedImageURLsResponse } from "@/lib/types/responses";
import { handleApiError } from "@/lib/utils/handleApiError";
import CatchImageCarousel from "@/components/catchesPage/CatchDetails/CatchImageCarousel";
import FullscreenImage from "@/components/catchesPage/CatchDetails/FullscreenImage";
import { noAccessPlaceholder } from "@/lib/constants/constants";
import { set } from "mongoose";

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
  const stackRef = useRef<HTMLDivElement>(null);
  const [stackHeight, setStackHeight] = useState(0);
  const badgesContainerRef = useRef<HTMLDivElement>(null);
  const [badgesContainerHeight, setBadgesContainerHeight] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [imagesToShow, setImagesToShow] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [disableScroll, setDisableScroll] = useState(false);

  const urlToCopy = typeof window !== 'undefined'
    ? `${window.location.origin}/community?eventId=${event.id}#events`
    : '';

  const canViewImages = useMemo(() => {
    if (!isLoggedIn || !jwtUserInfo) {
      return false;
    }
    return (
      editorRoles.includes(jwtUserInfo.role) ||
      jwtUserInfo?.role === UserRole.TRUSTED_CREATOR ||
      event.createdBy.id === jwtUserInfo?.userId
    );
  }, [isLoggedIn, jwtUserInfo, event]);

  useEffect(() => {
    // Set the page title
    setPageTitle(t('CommunityPage.EventDetails'));

    const updateHeight = () => {
      setElementHeights();
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);

    const handleScroll = (e: any) => {
      if (scrollContainerRef.current) {
        setScrollY(scrollContainerRef.current.scrollTop);
      }
    };

    const container = scrollContainerRef.current;
    if (container) container.addEventListener('scroll', handleScroll);

    return () => {
      setPageTitle(null);
      window.removeEventListener('resize', updateHeight);
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const setElementHeights = () => {
    if (stackRef.current) {
      console.log('stackRef.current.offsetHeight', stackRef.current.offsetHeight);
      setStackHeight(stackRef.current.offsetHeight + 50);
    }
    if (badgesContainerRef.current) {
      console.log('badgesContainerRef.current.offsetHeight', badgesContainerRef.current.offsetHeight);
      setBadgesContainerHeight(badgesContainerRef.current.offsetHeight);
    }
  }

  useEffect(() => {
    setElementHeights();
  }, [stackRef.current, badgesContainerRef.current, coverImageUrl]);

  useEffect(() => {
    if (!event) return;
    const imageUrls = event.images?.map((img) => img.signedUrl || noAccessPlaceholder) || [];
    // sort by publicAccess first
    imageUrls.sort((a => a === noAccessPlaceholder ? 1 : -1));
    setImagesToShow(imageUrls);
    resolveCoverImage(event, imageUrls);
  }, [event]);

  useEffect(() => {
    setDisableScroll(fullscreenImage !== null);
    return () => {
      setDisableScroll(false);
    };
  }, [fullscreenImage]);

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

  const resolveCoverImage = (event: IEvent, signedImageURLs: string[]) => {
    const coverImage = event.images?.find(img => img.coverImage === true);
    if (coverImage) {
      const encodedCoverPublicId = encodeURIComponent(coverImage.publicId.replace(/\//g, ''));
      const coverImageUrl = signedImageURLs.find(url => url.replace(/\//g, '').includes(encodedCoverPublicId));
      setCoverImageUrl(coverImageUrl || null);
    }
  }

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

  const showImageCarousel: boolean = ((imagesToShow || []).length > 0) && (canViewImages || (event.images?.some(img => img.publicAccess) ?? false));

  const fadeStart = 100;
  const fadeEnd = stackHeight - 200;
  const scaleStart = 20;
  const scaleEnd = stackHeight - 200;
  const fadeLinearProgress = Math.min(
    1,
    Math.max(0, (scrollY - fadeStart) / (fadeEnd - fadeStart))
  );
  const scaleLinearProgress = Math.min(
    1,
    Math.max(0, (scrollY - scaleStart) / (scaleEnd - scaleStart))
  );
  // Apply ease-in curve (slow at first, fast near the end)
  const dimOpacity = Math.pow(fadeLinearProgress, 4);
  const imageScale = 1 + Math.pow(scaleLinearProgress, 1.5) * 0.3; // zooms from 1.0 to 1.1

  return (
    <Paper
      ref={scrollContainerRef}
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
        overflowY: 'scroll',
        overflowX: 'hidden'
      }}
      className={classes.scrollContainer}
    >
      {coverImageUrl && 
      <Box
        pos="sticky"
        w="calc(100% + 32px)"
        top={0}
        mx={-16}
        h={0}
      >
        <Box
          h={stackHeight}
          w="100%"
          left={0}
          top={-16}
          pos={'absolute'}
          style={{

            overflow: 'hidden',
          }}
        >
          <Box
            pos="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            style={{
              backgroundImage: `url(${coverImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `scale(${imageScale})`,
              transition: 'transform 0.05s linear', // makes it smooth
              willChange: 'transform',
            }}
          />
        </Box>
        <Box
          pos="absolute"
          top={-16}
          left={0}
          w="100%"
          h={stackHeight}
          style={{
            backgroundColor: `rgba(13, 13, 13, ${dimOpacity})`,
            transition: 'background-color 100ms linear',
            pointerEvents: 'none',
          }}
        />
      </Box>}
      <Box pos={'relative'} w={'100%'}>
        {coverImageUrl &&
        <Box
          pos="absolute"
          h={'100%'}
          top={-16}
          left={-16}
          right={-16}
        >
          <Box
            pos="relative"
            h={stackHeight}
            w="100%"
            style={{
              background: `
                linear-gradient(to bottom, rgba(0, 0, 0, 0.0) 0%,rgba(0, 0, 0, 0.05) 45%,rgba(0, 0, 0, 0.1) 55%, var(--mantine-color-body) 100%),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.0) 0%,rgba(0, 0, 0, 0) 45%,rgba(0, 0, 0, 0) 55%, rgba(0, 0, 0, 0.0) 100%),
                linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%,rgba(0, 0, 0, 0) 25%,rgba(0, 0, 0, 0) 75%, rgba(0, 0, 0, 0.5) 100%)
                `
            }}
          />
          <Box
            pos="relative"
            h={`calc(100% - ${stackHeight}px)`}
            w="100%"
            style={{
              background: 'var(--mantine-color-body)'
            }}
          />
        </Box>}
        <Box w={'100%'}>
          <Stack p={0} gap={0} w={'100%'}>
            <Stack p={0} gap={0} pos={'relative'} ref={stackRef} h={coverImageUrl ? 350 : 'fit-content'} justify={'space-between'}>
              <Box
                pos={coverImageUrl ? 'sticky' : 'relative'}
                top={0}
                pb={coverImageUrl ? badgesContainerHeight : 0}
                style={{
                  background: 'transparent'
                }}
              >
                <Box pos="relative" h={0} w={'100%'}>
                  <Box
                    pos="absolute"
                    h={stackHeight + 30} // only for making the gradient a bit stronger on the top
                    top={-16}
                    left={-16}
                    right={-16}
                    style={{
                      background: `
                  linear-gradient(to bottom, var(--mantine-color-body) 0%,rgba(0, 0, 0, 0.1) 45%,rgba(0, 0, 0, 0.05) 55%, rgba(0, 0, 0, 0) 100%),
                  linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%,rgba(0, 0, 0, 0) 25%,rgba(0, 0, 0, 0) 75%, rgba(0, 0, 0, 0) 100%)
                  `
                    }}
                  />
                </Box>
                <Container p={0} size={'sm'} w={'100%'}>
                  <Group mb={4} wrap={'nowrap'} justify={'space-between'}>
                    <Title
                      pos={'relative'}
                      order={2}
                      mr="auto"
                      pl={4}
                      c={'white'}
                      style={{
                        textShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {event.name}
                    </Title>
                    <Group gap="xs" align={'center'} wrap={'nowrap'} w={'fit-content'} justify={'flex-end'}>
                      {/* Copy Link Button */}
                      {!isInEditView && (
                        <Box
                          style={coverImageUrl ? {
                            display: 'inline-block',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: 'var(--mantine-radius-default)',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)'
                          } : { display: 'inline-block' }}
                        >
                          <CopyButton
                            value={urlToCopy}
                            timeout={4000}>
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
                                  bg={copied ? 'rgba(18, 184, 134, 0.25)' : 'rgba(21, 170, 191, 0.25)'}
                                  style={{ transition: 'background-color 100ms ease, color 300ms ease' }}
                                  classNames={{ root: copied ? classes.copyButtonTeal : classes.copyButtonCyan }}
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
                        </Box>
                      )}
                      {/* Edit Button */}
                      {!isInEditView && (
                        <Box
                          style={coverImageUrl ? {
                            display: 'inline-block',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: 'var(--mantine-radius-default)',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)'
                          } : { display: 'inline-block' }}
                        >
                          <ActionIcon
                            size="lg"
                            variant="light"
                            color="blue"
                            onClick={openConfirmEditModal}
                            disabled={!canEdit}
                            bg={'rgba(34, 139, 230, 0.25)'}
                            classNames={{ root: classes.copyButtonBlue }}
                          >
                            <IconPencil size={20} />
                          </ActionIcon>
                        </Box>
                      )}
                      {/* Delete Button */}
                      {!isInEditView && (
                        <Box
                          style={coverImageUrl ? {
                            display: 'inline-block',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: 'var(--mantine-radius-default)',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)'
                          } : { display: 'inline-block' }}
                        >
                          <ActionIcon
                            size="lg"
                            variant="light"
                            color="red"
                            disabled={!canEdit}
                            onClick={() => openConfirmDeleteModal()}
                            classNames={{ root: classes.copyButtonRed }}
                          >
                            <IconTrash size={20} />
                          </ActionIcon>
                        </Box>
                      )}
                      {/* Close Button Mobile*/}
                      {isInEditView &&
                        <Box
                          hiddenFrom="md"
                          style={coverImageUrl ? {
                            display: 'inline-block',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: 'var(--mantine-radius-default)',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)'
                          } : { display: 'inline-block' }}
                        >
                          <ActionIcon
                            size="lg"
                            variant="light"
                            color="gray"
                            onClick={() => openCancelEditModal(!canEdit)}
                            bg={'rgba(134, 142, 150, 0.25)'}
                            classNames={{ root: classes.copyButtonGray }}
                          >
                            <IconX size={20} />
                          </ActionIcon>
                        </Box>}
                      {/* Close Button Desktop*/}
                      <Box
                        visibleFrom="md"
                        style={coverImageUrl ? {
                          display: 'inline-block',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          borderRadius: 'var(--mantine-radius-default)',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)'
                        } : { display: 'inline-block' }}
                      >
                        <ActionIcon
                          size="lg"
                          variant="light"
                          color="gray"
                          bg={'rgba(134, 142, 150, 0.25)'}
                          classNames={{ root: classes.copyButtonGray }}
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
                      </Box>
                    </Group>
                  </Group>

                  <Group align="center" gap="xs" wrap={'nowrap'} pl={4} mt={4} pos={'relative'} mb={4}>
                    <IconCalendar size={24} stroke={2}
                      style={{
                      }}
                    />
                    <Text fz={18} fw={500}
                      style={{
                        whiteSpace: 'nowrap',
                        textShadow: '0 0 8px rgba(0, 0, 0, 1)',
                      }}
                    >
                      {getDateRange(event)}
                    </Text>
                  </Group>
                </Container>
              </Box>
              <Container p={0} size={'sm'} w={'100%'} ref={badgesContainerRef}>
                {/* <Group gap={'sm'} pos={'relative'} mt={eventHasCoverImage ? stackHeight + 32 - 67 - 35: 'sm'} w={'100%'}> */}
                <Group gap={'sm'} pos={'relative'} my={'sm'} w={'100%'}>
                  <EventDetailsStatBadges
                    event={event}
                    eventStats={stats}
                    eventHasCoverImage={coverImageUrl !== null}
                  />
                </Group>
              </Container>
            </Stack>
            <Container p={0} size={'sm'} w={'100%'}>
              <Stack p={0} gap={'md'} w={'100%'}>

                <Paper w={'100%'} radius={'lg'} bg={"var(--my-ui-item-background-color)"} pos={'relative'}>
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

                <Paper p={'md'} pr={10} w={'100%'} radius={'lg'} bg={"var(--my-ui-item-background-color)"} pos={'relative'}
                  h={allParticipants.length < 10 ? Math.max((600 - (10 - allParticipants.length) * 40), 280) : 600}>
                  <Stack p={0} gap={'md'} h={'100%'}>
                    <Title order={3} c={'white'}>{t('CommunityPage.Leaderboard')}</Title>
                    <Paper flex={1} bg={'transparent'}>
                      <EventLeaderboardBarChart
                        catches={stats.eventCatches}
                        userInfo={jwtUserInfo}
                        userDisplayNameMap={displayNameMap}
                        allUserInfos={event.participants || []}
                        unregisteredParticipants={event.unregisteredParticipants}
                      />
                    </Paper>
                  </Stack>
                </Paper>

                <Paper p={'md'} w={'100%'} radius={'lg'} bg={"var(--my-ui-item-background-color)"} pos={'relative'}>
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
                    initialLatitude={62.22897392}
                    initialLongitude={25.89026228}
                    initialZoom={4.35}
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

                {/* Image Carousel */}
                {showImageCarousel &&
                  <CatchImageCarousel
                    images={imagesToShow}
                    isFallbackImage={false}
                    setFullscreen={(src) => setFullscreenImage(src)}
                  />}
                {/* Fullscreen Image */}
                {fullscreenImage && <FullscreenImage src={fullscreenImage} onClose={() => setFullscreenImage(null)} />}

              </Stack>
            </Container>
          </Stack>
        </Box>
      </Box>
    </Paper >
  );
}