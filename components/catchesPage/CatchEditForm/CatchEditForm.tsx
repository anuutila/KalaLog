import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  IconCalendar,
  IconClock,
  IconEdit,
  IconEraser,
  IconFish,
  IconFishHook,
  IconMap,
  IconMapPin,
  IconMessage,
  IconRipple,
  IconRuler2,
  IconSelector,
  IconUser,
  IconUserQuestion,
  IconWeight,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import {
  Autocomplete,
  Button,
  Combobox,
  Container,
  Fieldset,
  Group,
  Input,
  InputBase,
  NumberInput,
  Stack,
  TextInput,
  useCombobox,
} from '@mantine/core';
import ImageUploadForm from '@/components/ImageUploadForm/ImageUploadForm';
import { useGlobalState } from '@/context/GlobalState';
import { useLoadingOverlay } from '@/context/LoadingOverlayContext';
import { showNotification } from '@/lib/notifications/notifications';
import { ICatch } from '@/lib/types/catch';
import { CatchEditedResponse, UsersByFirstNameResponse } from '@/lib/types/responses';
import { editorRoles } from '@/lib/types/user';
import { CatchUtils } from '@/lib/utils/catchUtils';
import { handleApiError } from '@/lib/utils/handleApiError';
import { optimizeImage } from '@/lib/utils/utils';
import { editCatch } from '@/services/api/catchService';
import { getUsersByFirstName } from '@/services/api/userService';
import FullscreenImage from '../CatchDetails/FullscreenImage';
import classes from './CatchEditForm.module.css';

interface CatchEditFormProps {
  catchData: ICatch;
  setIsInEditView: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedCatch: React.Dispatch<React.SetStateAction<ICatch | null>>;
  openCancelEditModal: () => void;
  setDisableScroll: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CatchEditForm({
  catchData,
  setIsInEditView,
  setSelectedCatch,
  openCancelEditModal,
  setDisableScroll,
}: CatchEditFormProps) {
  const { catches, setCatches, jwtUserInfo } = useGlobalState();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const t = useTranslations();
  const tNewCatch = useTranslations('NewCatchPage');
  const tFishEnFi = useTranslations('FishEnFi');

  const [formData, setFormData] = useState<Omit<ICatch, 'id' | 'createdAt'>>(catchData);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [speciesValue, setSpeciesValue] = useState<string>(catchData.species || '');
  const [filteredSpeciesOptions, setFiltereSpeciesOptions] = useState<string[]>([]);
  const [speciesDropdownOpened, setSpeciesDropdownOpened] = useState<boolean>(false);

  const [weightValue, setWeightValue] = useState<string | number>(catchData.weight || '');
  const [lengthValue, setLengthValue] = useState<string | number>(catchData.length || '');

  const [lureValue, setLureValue] = useState<string>(catchData.lure || '');
  const [filteredLureOptions, setFilteredLureOptions] = useState<string[]>([]);
  const [luresDropdownOpened, setLuresDropdownOpened] = useState<boolean>(false);

  const [bodyOfWaterValue, setBodyOfWaterValue] = useState<string>(catchData.location.bodyOfWater || '');
  const [filteredBodyOfWaterOptions, setFilteredBodyOfWaterOptions] = useState<string[]>([]);
  const [bodiesOfWaterDropdownOpened, setBodiesOfWaterDropdownOpened] = useState<boolean>(false);

  const [spotValue, setSpotValue] = useState<string>(catchData.location.spot || '');
  const [filteredSpotOptions, setFilteredSpotOptions] = useState<string[]>([]);
  const [spotsDropdownOpened, setSpotsDropdownOpened] = useState<boolean>(false);

  const [anglerName, setAnglerName] = useState<string>(catchData.caughtBy.name || '');
  const [filteredAnglerOptions, setFilteredAnglerOptions] = useState<string[]>([]);
  const [anglersDropdownOpened, setAnglersDropdownOpened] = useState<boolean>(false);

  const [addedImages, setAddedImages] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<(string | undefined)[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const [matchingUsers, setMatchingUsers] = useState<
    { id: string | null; username: string; firstName: string; lastName: string }[]
  >([]);
  const [linkedUser, setLinkedUser] = useState<{
    id: string | null;
    username: string;
    firstName: string;
    lastName: string;
  } | null>();
  const [userLinkingDone, setUserLinkingDone] = useState(true);
  const [showUserLinkingDropdown, setShowUserLinkingDropdown] = useState(false);
  const [isLinkingUser, setIsLinkingUser] = useState(false);
  const [nameEdited, setNameEdited] = useState(false);
  const [userAutomaticallyLinked, setUserAutomaticallyLinked] = useState(false);

  const userCombobox = useCombobox({
    onDropdownClose: () => userCombobox.resetSelectedOption(),
    onDropdownOpen: () => userCombobox.updateSelectedOptionIndex('active'),
  });

  // The angler name is automatically filled in for users who do not have editor rights
  useEffect(() => {
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

  useEffect(() => {
    setDisableScroll(fullscreenImage !== null);
    return () => {
      setDisableScroll(false);
    };
  }, [fullscreenImage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      if (name === 'bodyOfWater' || name === 'coordinates') {
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
      // Prepare updated catch data
      const updatedCatch: ICatch = {
        ...formData,
        species: tFishEnFi.has(speciesValue) ? tFishEnFi(speciesValue) : speciesValue,
        length: typeof lengthValue === 'string' || lengthValue === 0 ? null : lengthValue,
        weight: typeof weightValue === 'string' || weightValue === 0 ? null : weightValue,
        lure: lureValue,
        location: {
          ...formData.location,
          bodyOfWater: bodyOfWaterValue,
          spot: spotValue,
        },
        caughtBy: {
          name: anglerName,
          username: linkedUser?.username ?? (!nameEdited ? formData.caughtBy.username ?? null : null),
          lastName: linkedUser?.lastName ?? (!nameEdited ? formData.caughtBy.lastName ?? null : null),
          userId: linkedUser?.id ?? (!nameEdited ? formData.caughtBy.userId ?? null : null),
        },
      };

      // Optimize images before uploading
      const optimizedImages: File[] = [];
      if (addedImages.length > 0) {
        console.log('Optimizing images...');
        const optimized = await Promise.all(
          addedImages.map(async (file) => {
            const optimizedFile = await optimizeImage(file);
            return optimizedFile;
          })
        );
        optimizedImages.push(...optimized);
      }

      // Send updated catch data to the API
      const catchUpdateResponse: CatchEditedResponse = await editCatch(
        updatedCatch,
        catchData.id,
        optimizedImages,
        deletedImages
      );
      console.log(catchUpdateResponse.message, catchUpdateResponse.data);
      if (catchUpdateResponse.data.failedImageOperations) {
        showNotification('warning', catchUpdateResponse.message, { withTitle: true });
      } else {
        showNotification('success', catchUpdateResponse.message, { withTitle: false });
      }

      // Update the catches state
      setCatches((prev) =>
        prev.map((catchItem) =>
          catchItem.id === catchUpdateResponse.data.catch.id ? catchUpdateResponse.data.catch : catchItem
        )
      );
      setIsInEditView(false);
      setSelectedCatch(catchUpdateResponse.data.catch);
    } catch (error) {
      handleApiError(error, 'catch editing');
    } finally {
      hideLoading();
      setIsLoading(false);
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
      setNameEdited(true);
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

  return (
    <form onSubmit={handleSubmit} ref={formRef}>
      <Fieldset disabled={isLoading} variant="default" radius="md" pt="md">
        <Stack gap="lg">
          <Autocomplete
            size="md"
            type="text"
            name="species"
            value={speciesValue}
            label={tNewCatch('Species')}
            placeholder={tNewCatch('Species')}
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
              suffix=" cm"
              value={lengthValue}
              onChange={setLengthValue}
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
              suffix=" kg"
              value={weightValue}
              onChange={setWeightValue}
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
            leftSection={<IconMap size={20} />}
            leftSectionPointerEvents="none"
          />
          <TextInput
            size="md"
            type="text"
            name="coordinates"
            label={tNewCatch('Coordinates')}
            placeholder="N, E"
            value={formData.location.coordinates ?? ''}
            onChange={handleChange}
            pattern="^([-+]?\d{1,3}\.\d{1,12},\s*[-+]?\d{1,3}\.\d{1,12})?$" // GPS coordinates pattern
            leftSection={<IconMapPin size={20} />}
            leftSectionPointerEvents="none"
          />
          <Group grow>
            <TextInput
              size="md"
              type="date"
              name="date"
              label={t('Common.Date')}
              value={formData.date}
              onChange={handleChange}
              required
              leftSection={<IconCalendar size={20} />}
              leftSectionPointerEvents="none"
            />
            <TextInput
              size="md"
              type="time"
              name="time"
              label={t('Common.Time')}
              value={formData.time}
              onChange={handleChange}
              required
              leftSection={<IconClock size={20} />}
              leftSectionPointerEvents="none"
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

          <TextInput
            size="md"
            type="text"
            name="comment"
            label={t('Common.Comment')}
            placeholder={tNewCatch('Placeholders.Comment')}
            leftSection={<IconMessage size={20} />}
            leftSectionPointerEvents="none"
            value={formData.comment ?? ''}
            onChange={handleChange}
          />

          <ImageUploadForm
            catchData={catchData}
            setFullscreenImage={setFullscreenImage}
            setAddedImages={setAddedImages}
            setDeletedImages={setDeletedImages}
          />

          {fullscreenImage && <FullscreenImage src={fullscreenImage} onClose={() => setFullscreenImage(null)} />}

          <Group mt="xs" mb="xs" grow>
            <Button
              size="md"
              variant="default"
              onClick={() => openCancelEditModal()}
              leftSection={<IconEraser size={20} />}
            >
              {t('Common.Cancel')}
            </Button>
            <Button
              size="md"
              type="submit"
              loading={isLoading || isLinkingUser}
              loaderProps={{ type: 'dots' }}
              leftSection={<IconEdit size={20} />}
              disabled={!isFormValid || !userLinkingDone}
              classNames={{ root: isLinkingUser ? classes.submitButtonDisabledLoading : '' }}
            >
              {t('Common.Save')}
            </Button>
          </Group>
        </Stack>
      </Fieldset>
    </form>
  );
}
