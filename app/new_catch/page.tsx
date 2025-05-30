'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconFish,
  IconFishHook,
  IconAlertCircle,
  IconMap2,
  IconMapPin,
  IconMessage,
  IconRipple,
  IconRuler2,
  IconSelector,
  IconUser,
  IconUserQuestion,
  IconWeight,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import {
  Alert,
  Autocomplete,
  Button,
  Checkbox,
  Combobox,
  Container,
  Fieldset,
  Group,
  Input,
  InputBase,
  NumberInput,
  Paper,
  rem,
  Stack,
  Textarea,
  TextInput,
  Title,
  useCombobox,
} from '@mantine/core';
import FullscreenImage from '@/components/catchesPage/CatchDetails/FullscreenImage';
import ImageUploadForm, { ImageUploadFormRef } from '@/components/ImageUploadForm/ImageUploadForm';
import { useGlobalState } from '@/context/GlobalState';
import { useLoadingOverlay } from '@/context/LoadingOverlayContext';
import { showNotification } from '@/lib/notifications/notifications';
import { ICatch } from '@/lib/types/catch';
import { CatchCreaetedResponse, UsersByFirstNameResponse } from '@/lib/types/responses';
import { editorRoles, UserRole } from '@/lib/types/user';
import { CatchUtils } from '@/lib/utils/catchUtils';
import { handleApiError } from '@/lib/utils/handleApiError';
import { defaultSort } from '@/lib/utils/utils';
import { createCatch } from '@/services/api/catchService';
import { getUsersByFirstName } from '@/services/api/userService';
import classes from './page.module.css';

export default function Page() {
  const t = useTranslations();
  const tFishEnFi = useTranslations('FishEnFi');
  const tNewCatch = useTranslations('NewCatchPage');
  const { catches, setCatches, isLoggedIn, jwtUserInfo } = useGlobalState();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [isFormValid, setIsFormValid] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState<Omit<ICatch, 'id' | 'createdAt' | 'catchNumber'>>({
    species: '',
    length: undefined,
    weight: undefined,
    lure: null,
    location: {
      bodyOfWater: '',
      spot: null,
      coordinates: null,
    },
    date: dayjs().format('YYYY-MM-DD'),
    time: dayjs().format('HH:mm'),
    caughtBy: { name: '', username: null, userId: null },
    createdBy: null,
    comment: null,
  });

  const [speciesValue, setSpeciesValue] = useState<string>('');
  const [filteredSpeciesOptions, setFiltereSpeciesOptions] = useState<string[]>([]);
  const [speciesDropdownOpened, setSpeciesDropdownOpened] = useState<boolean>(false);

  const [weightValue, setWeightValue] = useState<string | number>('');
  const [lengthValue, setLengthValue] = useState<string | number>('');

  const [lureValue, setLureValue] = useState<string>('');
  const [filteredLureOptions, setFilteredLureOptions] = useState<string[]>([]);
  const [luresDropdownOpened, setLuresDropdownOpened] = useState<boolean>(false);

  const [bodyOfWaterValue, setBodyOfWaterValue] = useState<string>('');
  const [filteredBodyOfWaterOptions, setFilteredBodyOfWaterOptions] = useState<string[]>([]);
  const [bodiesOfWaterDropdownOpened, setBodiesOfWaterDropdownOpened] = useState<boolean>(false);

  const [spotValue, setSpotValue] = useState<string>('');
  const [filteredSpotOptions, setFilteredSpotOptions] = useState<string[]>([]);
  const [spotsDropdownOpened, setSpotsDropdownOpened] = useState<boolean>(false);

  const [anglerName, setAnglerName] = useState<string>('');
  const [filteredAnglerOptions, setFilteredAnglerOptions] = useState<string[]>([]);
  const [anglersDropdownOpened, setAnglersDropdownOpened] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(false);
  const [useGps, setUseGps] = useState(false); // State for GPS checkbox
  const [gpsError, setGpsError] = useState<string | null>(null); // State for GPS error message
  const [watchId, setWatchId] = useState<number | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [disableScroll, setDisableScroll] = useState(false);

  const [matchingUsers, setMatchingUsers] = useState<
    { id: string | null; username: string; firstName: string; lastName: string }[]
  >([]);
  const [linkedUser, setLinkedUser] = useState<{
    id: string | null;
    username: string;
    firstName: string;
    lastName: string;
  } | null>();
  const [userLinkingDone, setUserLinkingDone] = useState(false);
  const [showUserLinkingDropdown, setShowUserLinkingDropdown] = useState(false);
  const [isLinkingUser, setIsLinkingUser] = useState(false);
  const [userAutomaticallyLinked, setUserAutomaticallyLinked] = useState(false);

  const imageUploadFormRef = useRef<ImageUploadFormRef>(null);
  const scrollPositionRef = useRef(0);

  const userCombobox = useCombobox({
    onDropdownClose: () => userCombobox.resetSelectedOption(),
    onDropdownOpen: () => userCombobox.updateSelectedOptionIndex('active'),
  });

  const fillAnglerNameForUsersWithoutEditorRights = useCallback(() => {
    if (jwtUserInfo?.role && !editorRoles.includes(jwtUserInfo?.role)) {
      setUserAutomaticallyLinked(true);
      setUserLinkingDone(true);
      setAnglerName(jwtUserInfo.firstname);
      setLinkedUser({
        id: jwtUserInfo.userId,
        username: jwtUserInfo.username,
        firstName: jwtUserInfo.firstname,
        lastName: jwtUserInfo.lastname,
      });
    }
  }, [jwtUserInfo]);

  // The angler name is automatically filled in for users who do not have editor rights
  useEffect(() => {
    fillAnglerNameForUsersWithoutEditorRights();
  }, [jwtUserInfo]);

  useEffect(() => {
    setDisableScroll(fullscreenImage !== null);
    return () => {
      setDisableScroll(false);
    };
  }, [fullscreenImage]);

  // Disable scrolling when the fullscreen image is open
  useEffect(() => {
    if (disableScroll) {
      // Save the current scroll position
      scrollPositionRef.current = window.scrollY;
      // Disable scrolling
      document.documentElement.style.overflow = 'hidden'; // Prevent scrolling on <html>
      document.body.style.overflow = 'hidden'; // Prevent scrolling on <body>
      document.body.style.position = 'fixed'; // Prevent content shift on mobile
      document.body.style.top = `-${scrollPositionRef.current}px`; // Keep scroll position
    } else {
      // Restore scrolling
      document.body.style.position = '';
      document.body.style.top = '';
      document.documentElement.style.overflow = ''; // Restore scrolling on <html>
      document.body.style.overflow = ''; // Restore scrolling on <body>
      // Restore scroll position
      window.scrollTo(0, scrollPositionRef.current);
    }
    return () => {
      // Cleanup on unmount
      document.documentElement.style.overflow = ''; // Restore scrolling on <html>
      document.body.style.overflow = ''; // Restore scrolling on <body>
      document.body.style.position = '';
      document.body.style.top = '';
    };
  }, [disableScroll]);

  const handleClearImages = () => {
    if (imageUploadFormRef.current) {
      imageUploadFormRef.current.clearImages();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      if (name === 'coordinates') {
        // Handle nested location object
        return {
          ...prevData,
          location: {
            ...prevData.location,
            [name]: value,
          },
        };
      }

      return {
        ...prevData,
        [name]: value,
      };
    });
  };

  const handleGpsToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof navigator !== 'undefined') {
      setUseGps(e.target.checked);

      if (e.target.checked) {
        try {
          // Start watching the user's position
          const id = navigator.geolocation.watchPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setFormData((prevData) => ({
                ...prevData,
                location: {
                  ...prevData.location,
                  coordinates: `${latitude}, ${longitude}`,
                },
              }));
              setGpsError(null); // Clear any previous errors
            },
            (error) => {
              setGpsError('Unable to retrieve GPS coordinates. Please enable location access.');
              console.error('GPS error:', error);
            },
            {
              enableHighAccuracy: true, // Use the most accurate location available
              maximumAge: 0, // Do not use cached locations
              timeout: 15000, // Timeout after 10 seconds if no location is retrieved
            }
          );
          setWatchId(id); // Save the watch ID to clear it later
        } catch (error) {
          setGpsError('Geolocation API is not supported.');
          console.error('Geolocation API error:', error);
        }
      } else {
        // Clear GPS coordinates and stop watching position
        setFormData((prevData) => ({
          ...prevData,
          location: {
            ...prevData.location,
            coordinates: '',
          },
        }));
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId); // Stop watching the user's position
          setWatchId(null);
        }
      }
    } else {
      setGpsError('Geolocation API is not supported.');
    }
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const fetchMatchingUsers = async (name: string) => {
    setIsLinkingUser(true);
    try {
      const response: UsersByFirstNameResponse = await getUsersByFirstName(name);
      const matchingUsers = response.data.users;

      setMatchingUsers(matchingUsers);

      if (matchingUsers.length === 1) {
        // If only one match exists, automatically select it
        setShowUserLinkingDropdown(false);
        setLinkedUser(matchingUsers[0]);
        setUserLinkingDone(true);
      } else if (matchingUsers.length > 1) {
        // Multiple matches require manual selection from a dropdown
        setShowUserLinkingDropdown(true);

        setLinkedUser(null);
        setUserLinkingDone(false);
      } else {
        // No matches mean this is an unregistered user that won't be linked
        setShowUserLinkingDropdown(false);
        setLinkedUser(null);
        setUserLinkingDone(true);
      }
    } catch (error) {
      handleApiError(error, 'fetching matching users');
    } finally {
      setIsLinkingUser(false);
    }
  };

  const linkUser = async (anglerName: string) => {
    if (anglerName.trim()) {
      await fetchMatchingUsers(anglerName.trim());
    } else {
      setShowUserLinkingDropdown(false);
      setLinkedUser(null);
      setMatchingUsers([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    showLoading();
    setIsLoading(true);
    try {
      // Prepare form data for submission
      const parsedFormData: Omit<ICatch, 'id' | 'createdAt' | 'catchNumber'> = {
        ...formData,
        species: tFishEnFi.has(speciesValue) ? tFishEnFi(speciesValue) : speciesValue,
        length: typeof lengthValue === 'string' ? null : lengthValue,
        weight: typeof weightValue === 'string' ? null : weightValue,
        lure: lureValue,
        location: {
          ...formData.location,
          bodyOfWater: bodyOfWaterValue,
          spot: spotValue,
        },
        caughtBy: {
          name: anglerName,
          username: linkedUser?.username ?? null,
          lastName: linkedUser?.lastName ?? null,
          userId: linkedUser?.id ?? null,
        },
        createdBy: jwtUserInfo?.userId ?? null,
      };

      console.log('Submitting form data:', parsedFormData);
      console.log(`With ${files.length} images`);

      // Send the catch details and image(s) to the API
      const catchCreatedResponse: CatchCreaetedResponse = await createCatch(parsedFormData, files ?? []);
      console.log(catchCreatedResponse.message, catchCreatedResponse.data);
      if (catchCreatedResponse.data.failedImageUploads) {
        showNotification('warning', catchCreatedResponse.message, t, { withTitle: true });
      } else {
        showNotification('success', catchCreatedResponse.message, t, { withTitle: false, duration: 3000 });
      }

      // Update the catches in global state
      setCatches((prevCatches) => defaultSort([catchCreatedResponse.data.catch, ...prevCatches]));

      // Reset the form
      setFormData({
        species: '',
        length: undefined,
        weight: undefined,
        lure: null,
        location: { bodyOfWater: '', spot: null, coordinates: null },
        date: dayjs().format('YYYY-MM-DD'),
        time: dayjs().format('HH:mm'),
        caughtBy: { name: '', username: null, userId: null },
        comment: null,
      });
      setSpeciesValue('');
      setLengthValue('');
      setWeightValue('');
      setLureValue('');
      setSpotValue('');
      setBodyOfWaterValue('');
      setUseGps(false);
      setGpsError(null);
      setAnglerName('');
      handleClearImages();
      setMatchingUsers([]);
      setLinkedUser(null);
      setUserLinkingDone(false);
      setShowUserLinkingDropdown(false);
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
    } catch (error) {
      handleApiError(error, 'catch creation');
    } finally {
      setIsLoading(false);
      fillAnglerNameForUsersWithoutEditorRights();
      hideLoading();
    }
  };

  const speciesOptions = [t('Fish.Ahven'), t('Fish.Hauki'), t('Fish.Kuha')];

  const lureOptions = useMemo(
    () =>
      CatchUtils.getUniqueLures(catches)
        .map((lure) => lure.lure)
        .filter((lure) => lure !== '?'),
    [catches]
  );

  const bodyOfWaterOptions = useMemo(
    () => CatchUtils.getUniqueBodiesOfWater(catches).map((item) => item.bodyOfWater),
    [catches]
  );

  const spotOptions = useMemo(() => CatchUtils.getUniqueSpots(catches), [catches]);

  const anglerOptions = useMemo(
    () =>
      CatchUtils.getUniqueAnglers(catches)
        .map((angler) => angler.name)
        .filter((name) => name !== '?'),
    [catches]
  );

  const handleSpeciesChange = useCallback(
    (value: string) => {
      setSpeciesValue(value);
      const filtered = speciesOptions.filter((option) => option.toLowerCase().includes(value.toLowerCase().trim()));
      setFiltereSpeciesOptions(filtered);
      setSpeciesDropdownOpened(filtered.length > 0);
    },
    [speciesOptions]
  );

  const speciesRightSection = useMemo(
    () =>
      speciesDropdownOpened && (filteredSpeciesOptions.length > 0 || speciesValue === '') ? (
        <IconSelector onClick={() => setSpeciesDropdownOpened(false)} />
      ) : null,
    [speciesDropdownOpened, filteredSpeciesOptions.length, speciesValue]
  );

  const handleLureChange = useCallback(
    (value: string) => {
      setLureValue(value);
      const filtered = lureOptions.filter((option) => option.toLowerCase().includes(value.toLowerCase().trim()));
      setFilteredLureOptions(filtered);
      setLuresDropdownOpened(filtered.length > 0);
    },
    [lureOptions]
  );

  const lureRightSection = useMemo(
    () =>
      luresDropdownOpened && (filteredLureOptions.length > 0 || lureValue === '') ? (
        <IconSelector onClick={() => setLuresDropdownOpened(false)} />
      ) : null,
    [luresDropdownOpened, filteredLureOptions.length, lureValue]
  );

  const handleBodyOfWaterChange = useCallback(
    (value: string) => {
      setBodyOfWaterValue(value);
      const filtered = bodyOfWaterOptions.filter((option) => option.toLowerCase().includes(value.toLowerCase().trim()));
      setFilteredBodyOfWaterOptions(filtered);
      setBodiesOfWaterDropdownOpened(filtered.length > 0);
    },
    [bodyOfWaterOptions]
  );

  const bodyOfWaterRightSection = useMemo(
    () =>
      bodiesOfWaterDropdownOpened && (filteredBodyOfWaterOptions.length > 0 || spotValue === '') ? (
        <IconSelector onClick={() => setBodiesOfWaterDropdownOpened(false)} />
      ) : null,
    [bodiesOfWaterDropdownOpened, filteredBodyOfWaterOptions.length, bodyOfWaterValue]
  );

  const handleSpotChange = useCallback(
    (value: string) => {
      setSpotValue(value);
      const filtered = spotOptions.filter((option) => option.toLowerCase().includes(value.toLowerCase().trim()));
      setFilteredSpotOptions(filtered);
      setSpotsDropdownOpened(filtered.length > 0);
    },
    [spotOptions]
  );

  const spotRightSection = useMemo(
    () =>
      spotsDropdownOpened && (filteredSpotOptions.length > 0 || spotValue === '') ? (
        <IconSelector onClick={() => setSpotsDropdownOpened(false)} />
      ) : null,
    [spotsDropdownOpened, filteredSpotOptions.length, spotValue]
  );

  const handleAnglerChange = useCallback(
    (value: string) => {
      setUserLinkingDone(false);
      setAnglerName(value);
      const filtered = anglerOptions.filter((option) => option.toLowerCase().includes(value.toLowerCase().trim()));
      setFilteredAnglerOptions(filtered);
      setAnglersDropdownOpened(filtered.length > 0);
    },
    [anglerOptions]
  );

  const anglersRightSection = useMemo(
    () =>
      anglersDropdownOpened && (filteredAnglerOptions.length > 0 || anglerName === '') ? (
        <IconSelector onClick={() => setAnglersDropdownOpened(false)} />
      ) : null,
    [anglersDropdownOpened, filteredAnglerOptions.length, anglerName]
  );

  const handleFormChange = () => {
    setIsFormValid(formRef.current?.checkValidity() ?? false);
  };

  useEffect(() => {
    handleFormChange();
  }, [speciesValue, anglerName, bodyOfWaterValue, formData.date, formData.time]);

  // For testing purposes
  // const achievements: IAchievement[] = [
  //   {
  //     key: 'total_catches',
  //     isOneTime: false,
  //     currentTier: 4,
  //     tiers: [
  //       { tier: 1, dateUnlocked: null, bonus: false }
  //     ],
  //     progress: 1,
  //     totalXP: 100,
  //     userId: '123',
  //     unlocked: true,
  //   },
    // {
    //   key: 'total_catches',
    //   isOneTime: false,
    //   currentTier: 2,
    //   tiers: [
    //     { tier: 1, dateUnlocked: null, bonus: false }
    //   ],
    //   progress: 1,
    //   totalXP: 100,
    //   userId: '123',
    //   unlocked: true,
    // },
    // {
    //   key: 'total_catches',
    //   isOneTime: false,
    //   currentTier: 4,
    //   tiers: [
    //     { tier: 1, dateUnlocked: null, bonus: false }
    //   ],
    //   progress: 1,
    //   totalXP: 100,
    //   userId: '123',
    //   unlocked: true,
    // }
  // ];

  return (
    <Paper
      // This fixed positioning is necessary to avoid the layout from braking on mobile devices when the keyboard is open
      pos="fixed"
      top="var(--app-shell-header-offset)"
      bottom={{ base: 'calc(var(--app-shell-footer-offset) + env(safe-area-inset-bottom))', md: 0 }}
      left={0}
      right={0}
      p={'md'}
      radius={0}
      style={{
        overflowY: 'auto',
      }}
    >
    <Container size="sm" p={0}>
      <Title c="white" order={2} mb="md" pl={4}>
        {tNewCatch('CatchInfo')}
      </Title>
      {(!isLoggedIn || jwtUserInfo?.role === UserRole.VIEWER) && (
        <Alert
          styles={{
            label: { fontSize: rem(16) },
            message: { fontSize: rem(16) },
            icon: { width: 'calc(1.5rem* var(--mantine-scale))' },
          }}
          variant="light"
          color="red"
          radius="lg"
          title={tNewCatch('AlertTitle')}
          icon={<IconAlertCircle />}
          mb="md"
        >
          {jwtUserInfo?.role === UserRole.VIEWER ? tNewCatch('AlertText1') : tNewCatch('AlertText2')}
        </Alert>
      )}
      <form onSubmit={handleSubmit} ref={formRef}>
        <Fieldset
          disabled={!isLoggedIn || jwtUserInfo?.role === UserRole.VIEWER || isLoading}
          variant="default"
          radius="md"
          pt="md"
        >
          <Stack gap="lg">
            <Autocomplete
              size="md"
              type="text"
              name="species"
              label={tNewCatch('Species')}
              placeholder={tNewCatch('Species')}
              value={speciesValue}
              required
              onChange={handleSpeciesChange}
              onFocus={() => setSpeciesDropdownOpened(true)}
              onBlur={() => setSpeciesDropdownOpened(false)}
              rightSection={speciesRightSection}
              data={speciesOptions}
              defaultDropdownOpened={false}
              leftSection={<IconFish size={20} />}
              leftSectionPointerEvents="none"
            />
            <Group grow gap="lg">
              <NumberInput
                size="md"
                name="length"
                label={t('Common.Length')}
                step={0.01}
                min={0}
                max={999}
                placeholder="cm"
                value={lengthValue}
                suffix=" cm"
                onChange={setLengthValue}
                // pattern="^\d*(\.\d*)?$" // Allow decimals
                leftSection={<IconRuler2 size={20} />}
                leftSectionPointerEvents="none"
              />
              <NumberInput
                size="md"
                name="weight"
                label={t('Common.Weight')}
                step={0.01}
                min={0}
                max={999}
                placeholder="kg"
                value={weightValue}
                suffix=" kg"
                onChange={setWeightValue}
                // pattern="^\d*(\.\d*)?$" // Allow decimals
                leftSection={<IconWeight size={20} />}
                leftSectionPointerEvents="none"
              />
            </Group>
            <Autocomplete
              size="md"
              type="text"
              label={t('Common.Lure')}
              placeholder={tNewCatch('Placeholders.Lure')}
              name="lure"
              value={lureValue}
              onChange={handleLureChange}
              onFocus={() => setLuresDropdownOpened(true)}
              onBlur={() => setLuresDropdownOpened(false)}
              rightSection={lureRightSection}
              data={lureOptions}
              leftSection={<IconFishHook size={20} />}
              leftSectionPointerEvents="none"
            />

            <Stack p={0}>
              <Autocomplete
                size="md"
                type="text"
                name="bodyOfWater"
                label={t('Common.BodyOfWater')}
                placeholder={tNewCatch('Placeholders.BodyOfWater')}
                value={bodyOfWaterValue}
                onChange={handleBodyOfWaterChange}
                onFocus={() => setBodiesOfWaterDropdownOpened(true)}
                onBlur={() => setBodiesOfWaterDropdownOpened(false)}
                rightSection={bodyOfWaterRightSection}
                data={bodyOfWaterOptions}
                defaultDropdownOpened={false}
                leftSection={<IconRipple size={20} />}
                leftSectionPointerEvents="none"
                required
              />
              <Autocomplete
                size="md"
                type="text"
                name="spot"
                label={t('Common.Spot')}
                placeholder={tNewCatch('Placeholders.Spot')}
                value={spotValue}
                onChange={handleSpotChange}
                onFocus={() => setSpotsDropdownOpened(true)}
                onBlur={() => setSpotsDropdownOpened(false)}
                rightSection={spotRightSection}
                data={spotOptions}
                defaultDropdownOpened={false}
                leftSection={<IconMap2 size={20} />}
                leftSectionPointerEvents="none"
              />
              <Group grow gap="lg">
                <TextInput
                  size="md"
                  type="text"
                  name="coordinates"
                  label={tNewCatch('Coordinates')}
                  placeholder="N, E"
                  value={formData.location.coordinates ?? ''}
                  onChange={handleChange}
                  disabled={!useGps || gpsError !== null}
                  pattern="^([-+]?\d{1,3}\.\d{1,12},\s*[-+]?\d{1,3}\.\d{1,12})?$" // GPS coordinates pattern
                  leftSection={<IconMapPin size={20} />}
                  leftSectionPointerEvents="none"
                />
                <Checkbox
                  pt={29}
                  size="md"
                  checked={useGps && gpsError === null}
                  onChange={handleGpsToggle}
                  label={tNewCatch('GPSCoordinates')}
                  error={gpsError}
                />
              </Group>
            </Stack>

            <Group grow gap="lg">
              <TextInput
                size="md"
                type="date"
                name="date"
                label={t('Common.Date')}
                leftSection={<IconCalendar size={20} />}
                leftSectionPointerEvents="none"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <TextInput
                size="md"
                type="time"
                name="time"
                label={t('Common.Time')}
                placeholder="--.--"
                leftSection={<IconClock size={20} />}
                leftSectionPointerEvents="none"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </Group>
            <Autocomplete
              size="md"
              type="text"
              name="caughtBy"
              label={tNewCatch('CaughtBy')}
              placeholder={tNewCatch('Placeholders.CaughtBy')}
              value={anglerName}
              required
              onChange={handleAnglerChange}
              onOptionSubmit={(val) => linkUser(val)}
              onFocus={() => setAnglersDropdownOpened(true)}
              onBlur={() => {
                setAnglersDropdownOpened(false);
                if (!userLinkingDone) {
                  linkUser(anglerName);
                }
              }}
              rightSection={anglersRightSection}
              data={anglerOptions}
              defaultDropdownOpened={false}
              leftSection={<IconUser size={20} />}
              leftSectionPointerEvents="none"
              disabled={userAutomaticallyLinked}
            />

            {showUserLinkingDropdown && (
              <Combobox
                store={userCombobox}
                onOptionSubmit={(val) => {
                  if (val === '0') {
                    setLinkedUser(undefined);
                    setUserLinkingDone(true);
                    userCombobox.closeDropdown();
                  } else {
                    const user = matchingUsers.find((user) => user.username === val);
                    setLinkedUser(user);
                    setUserLinkingDone(true);
                    userCombobox.closeDropdown();
                  }
                }}
                size="md"
              >
                <Combobox.Target>
                  <InputBase
                    label={tNewCatch('SelectUser')}
                    component="button"
                    type="button"
                    pointer
                    rightSection={<Combobox.Chevron />}
                    rightSectionPointerEvents="none"
                    onClick={() => userCombobox.toggleDropdown()}
                    size="md"
                    leftSection={<IconUserQuestion size={20} />}
                    leftSectionPointerEvents="none"
                    required
                  >
                    {linkedUser ? (
                      `${linkedUser?.firstName} ${linkedUser?.lastName} (${linkedUser?.username})`
                    ) : linkedUser === null ? (
                      <Input.Placeholder>Valitse oikea käyttäjä</Input.Placeholder>
                    ) : (
                      'Ei käyttäjätiliä'
                    )}
                  </InputBase>
                </Combobox.Target>

                <Combobox.Dropdown>
                  <Combobox.Options>
                    {matchingUsers.map((user) => (
                      <Combobox.Option key={user.id} value={user.username}>
                        {user.firstName} {user.lastName} ({user.username})
                      </Combobox.Option>
                    ))}
                    <Combobox.Option value="0">{tNewCatch('NoUser')}</Combobox.Option>
                  </Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
            )}

            <Textarea
              size="md"
              name="comment"
              label={t('Common.Comment')}
              placeholder={tNewCatch('Placeholders.Comment')}
              leftSection={<IconMessage size={20} />}
              leftSectionPointerEvents="none"
              value={formData.comment ?? ''}
              onChange={handleChange}
              autosize
              minRows={1}
              maxRows={5}
            />

            <ImageUploadForm
              ref={imageUploadFormRef}
              setFullscreenImage={setFullscreenImage}
              setAddedImages={setFiles}
            />

            {fullscreenImage && <FullscreenImage src={fullscreenImage} onClose={() => setFullscreenImage(null)} />}

            <Button
              size="md"
              type="submit"
              loading={isLoading || isLinkingUser}
              loaderProps={{ type: 'dots' }}
              my="xs"
              leftSection={<IconCheck />}
              radius="md"
              disabled={!isFormValid || !userLinkingDone}
              classNames={{ root: isLinkingUser ? classes.submitButtonDisabledLoading : '' }}
            >
              {tNewCatch('Submit')}
            </Button>
          </Stack>
        </Fieldset>
      </form>
    </Container>
    </Paper>
  );
}
