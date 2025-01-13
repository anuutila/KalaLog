import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Autocomplete, Button, Container, Fieldset, Group, NumberInput, Stack, TextInput } from '@mantine/core';
import { ICatch } from '@/lib/types/catch';
import { useGlobalState } from '@/context/GlobalState';
import { CatchEditedResponse } from '@/lib/types/responses';
import { showNotification } from '@/lib/notifications/notifications';
import { CatchUtils } from '@/lib/utils/catchUtils';
import { IconCalendar, IconClock, IconEdit, IconEraser, IconFish, IconFishHook, IconMap, IconMapPin, IconRipple, IconRuler2, IconSelector, IconUser, IconWeight } from '@tabler/icons-react';
import { useLoadingOverlay } from '@/context/LoadingOverlayContext';
import FullscreenImage from '../CatchDetails/FullscreenImage';
import ImageUploadForm from '@/components/ImageUploadForm/ImageUploadForm';
import { editCatch } from '@/services/api/catchService';
import { handleApiError } from '@/lib/utils/handleApiError';
import { optimizeImage } from '@/lib/utils/utils';

interface CatchEditFormProps {
  catchData: ICatch;
  setIsInEditView: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedCatch: React.Dispatch<React.SetStateAction<ICatch | null>>;
  openCancelEditModal: () => void;
  setDisableScroll: React.Dispatch<React.SetStateAction<boolean>>;
}

const speciesOptions = ['Ahven', 'Hauki', 'Kuha'];

export default function CatchEditForm({ catchData, setIsInEditView, setSelectedCatch, openCancelEditModal, setDisableScroll }: CatchEditFormProps) {
  const { catches, setCatches } = useGlobalState();
  const { showLoading, hideLoading } = useLoadingOverlay();

  const [formData, setFormData] = useState<Omit<ICatch, 'id' | 'createdAt'>>(catchData);
  const [isLoading, setIsLoading] = useState(false);

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
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    setDisableScroll(fullscreenImage !== null);
    return () => {
      setDisableScroll(false);
    };
  } , [fullscreenImage]);

  
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoading();
    setIsLoading(true);

    try {
      // Prepare updated catch data
      const updatedCatch: ICatch = {
        ...formData,
        species: speciesValue,
        length: (typeof lengthValue === 'string' || lengthValue === 0) ? null : lengthValue,
        weight: (typeof weightValue === 'string' || weightValue === 0) ? null : weightValue,
        lure: lureValue,
        location: {
          ...formData.location,
          spot: spotValue,
        },
        caughtBy: {
          name: anglerName,
          userId: formData.caughtBy.userId || null,
        }
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
      const catchUpdateResponse: CatchEditedResponse = await editCatch(updatedCatch, catchData.id, optimizedImages, deletedImages);
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

  const lureOptions = useMemo(() => 
    CatchUtils.getUniqueLures(catches).map((lure) => lure.lure).filter((lure) => lure !== '?'), 
    [catches]
  );

  const bodyOfWaterOptions = useMemo(() =>
    CatchUtils.getUniqueBodiesOfWater(catches),
    [catches]
  );

  const spotOptions = useMemo(() =>
    CatchUtils.getUniqueSpots(catches),
    [catches]
  );

  const anglerOptions = useMemo(() =>
    CatchUtils.getUniqueAnglers(catches).map((angler) => angler.name).filter((name) => name !== '?'),
    [catches]
  );

  const handleSpeciesChange = useCallback((value: string) => {
    setSpeciesValue(value);
    const filtered = speciesOptions.filter((option) =>
      option.toLowerCase().includes(value.toLowerCase().trim())
    );
    setFiltereSpeciesOptions(filtered);
    setSpeciesDropdownOpened(filtered.length > 0);
  }, [speciesOptions]);

  const speciesRightSection = useMemo(() => 
    speciesDropdownOpened && (filteredSpeciesOptions.length > 0 || speciesValue === '') ? 
      <IconSelector onClick={() => setSpeciesDropdownOpened(false)}/> : 
      null
  , [speciesDropdownOpened, filteredSpeciesOptions.length, speciesValue]);

  const handleLureChange = useCallback((value: string) => {
    setLureValue(value);
    const filtered = lureOptions.filter((option) =>
      option.toLowerCase().includes(value.toLowerCase().trim())
    );
    setFilteredLureOptions(filtered);
    setLuresDropdownOpened(filtered.length > 0);
  }, [lureOptions]);
  
  const lureRightSection = useMemo(() => 
    luresDropdownOpened && (filteredLureOptions.length > 0 || lureValue === '') ? 
      <IconSelector onClick={() => setLuresDropdownOpened(false)}/> : 
      null
  , [luresDropdownOpened, filteredLureOptions.length, lureValue]);

  const handleBodyOfWaterChange = useCallback((value: string) => {
    setBodyOfWaterValue(value);
    const filtered = bodyOfWaterOptions.filter((option) =>
      option.toLowerCase().includes(value.toLowerCase().trim())
    );
    setFilteredBodyOfWaterOptions(filtered);
    setBodiesOfWaterDropdownOpened(filtered.length > 0);
  } , [bodyOfWaterOptions]);

  const bodyOfWaterRightSection = useMemo(() => 
    bodiesOfWaterDropdownOpened && (filteredBodyOfWaterOptions.length > 0 || spotValue === '') ? 
      <IconSelector onClick={() => setBodiesOfWaterDropdownOpened(false)}/> : 
      null
  , [bodiesOfWaterDropdownOpened, filteredBodyOfWaterOptions.length, bodyOfWaterValue]);

  const handleSpotChange = useCallback((value: string) => {
    setSpotValue(value);
    const filtered = spotOptions.filter((option) =>
      option.toLowerCase().includes(value.toLowerCase().trim())
    );
    setFilteredSpotOptions(filtered);
    setSpotsDropdownOpened(filtered.length > 0);
  } , [spotOptions]);

  const spotRightSection = useMemo(() => 
    spotsDropdownOpened && (filteredSpotOptions.length > 0 || spotValue === '') ? 
      <IconSelector onClick={() => setSpotsDropdownOpened(false)}/> : 
      null
  , [spotsDropdownOpened, filteredSpotOptions.length, spotValue]);

  const handleAnglerChange = useCallback((value: string) => {
    setAnglerName(value);
    const filtered = anglerOptions.filter((option) =>
      option.toLowerCase().includes(value.toLowerCase().trim())
    );
    setFilteredAnglerOptions(filtered);
    setAnglersDropdownOpened(filtered.length > 0);
  }, [anglerOptions]);

  const anglersRightSection = useMemo(() => 
    anglersDropdownOpened && (filteredAnglerOptions.length > 0 || anglerName === '') ? 
      <IconSelector onClick={() => setAnglersDropdownOpened(false)}/> : 
      null
  , [anglersDropdownOpened, filteredAnglerOptions.length, anglerName]);

  return (
    <Container size={'sm'} p={'0'} maw={'100%'}>
      <form onSubmit={handleSubmit}>
        <Fieldset disabled={isLoading} variant='default' radius={'md'} pt={'md'}>
          <Stack gap={'lg'}>

            <Autocomplete
              size='md'
              type='text'
              name='species'
              label="Kalalaji"
              value={speciesValue}
              placeholder='Kalalaji'
              required
              onChange={handleSpeciesChange}
              onFocus={() => setSpeciesDropdownOpened(true)}
              onBlur={() => setSpeciesDropdownOpened(false)}
              rightSection={speciesRightSection}
              data={speciesOptions}
              defaultDropdownOpened={false}
              leftSection={<IconFish size={20}/>}
              leftSectionPointerEvents='none'
            />
            <Group grow gap='lg'>
              <NumberInput
                size="md"
                name="length"
                label="Pituus"
                step={0.01}
                min={0}
                max={999}
                placeholder="cm"
                suffix=' cm'
                value={lengthValue}
                onChange={setLengthValue}
                leftSection={<IconRuler2 size={20}/>}
                leftSectionPointerEvents='none'
              />
              <NumberInput
                size="md"
                name="weight"
                label="Paino"
                step={0.01}
                min={0}
                max={999}
                placeholder="kg"
                suffix=' kg'
                value={weightValue}
                onChange={setWeightValue}
                leftSection={<IconWeight size={20}/>}
                leftSectionPointerEvents='none'
              />
            </Group>
            <Autocomplete
              size='md'
              type='text'
              label="Viehe"
              placeholder='Vieheen merkki ja malli'
              name='lure'
              value={lureValue}
              onChange={handleLureChange}
              onFocus={() => setLuresDropdownOpened(true)}
              onBlur={() => setLuresDropdownOpened(false)}
              rightSection={lureRightSection}
              data={lureOptions}
              leftSection={<IconFishHook size={20}/>}
              leftSectionPointerEvents='none'
            />
            <Autocomplete
                size='md'
                type='text'
                name='bodyOfWater'
                label="Vesialue"
                placeholder="Järven, joen tai meren nimi"
                value={bodyOfWaterValue}
                onChange={handleBodyOfWaterChange}
                onFocus={() => setBodiesOfWaterDropdownOpened(true)}
                onBlur={() => setBodiesOfWaterDropdownOpened(false)}
                rightSection={spotRightSection}
                data={bodyOfWaterOptions}
                defaultDropdownOpened={false}
                leftSection={<IconRipple size={20}/>}
                leftSectionPointerEvents='none'
                required
              />
            <Autocomplete
              size='md'
              type='text'
              name='spot'
              label="Paikka"
              placeholder="Tarkka paikan nimi"
              value={spotValue}
              onChange={handleSpotChange}
              onFocus={() => setSpotsDropdownOpened(true)}
              onBlur={() => setSpotsDropdownOpened(false)}
              rightSection={spotRightSection}
              data={spotOptions}
              defaultDropdownOpened={false}
              leftSection={<IconMap size={20}/>}
              leftSectionPointerEvents='none'
            />
            <TextInput
                size='md'
                type='text'
                name='coordinates'
                label="Koordinaatit"
                placeholder="N, E"
                value={formData.location.coordinates ?? ''}
                onChange={handleChange}
                pattern='^([-+]?\d{1,3}\.\d{1,12},\s*[-+]?\d{1,3}\.\d{1,12})?$' // GPS coordinates pattern
                leftSection={<IconMapPin size={20}/>}
                leftSectionPointerEvents='none'
            />
            <Group grow>
              <TextInput
                size="md"
                type="date"
                name="date"
                label="Päivämäärä"
                value={formData.date}
                onChange={handleChange}
                required
                leftSection={<IconCalendar size={20}/>}
                leftSectionPointerEvents='none'
              />
              <TextInput
                size="md"
                type="time"
                name="time"
                label="Aika"
                value={formData.time}
                onChange={handleChange}
                required
                leftSection={<IconClock size={20}/>}
                leftSectionPointerEvents='none'
              />
            </Group>
            <Autocomplete
              size='md'
              type='text'
              name='caughtBy'
              label="Kalastajan nimi"
              placeholder=""
              value={anglerName}
              required
              onChange={handleAnglerChange}
              onFocus={() => setAnglersDropdownOpened(true)}
              onBlur={() => setAnglersDropdownOpened(false)}
              rightSection={anglersRightSection}
              data={anglerOptions}
              defaultDropdownOpened={false}
              leftSection={<IconUser size={20}/>}
              leftSectionPointerEvents='none'
            />

            <ImageUploadForm
              catchData={catchData}
              setFullscreenImage={setFullscreenImage}
              setAddedImages={setAddedImages}
              setDeletedImages={setDeletedImages}
            />

            {fullscreenImage && (
              <FullscreenImage
                src={fullscreenImage}
                onClose={() => setFullscreenImage(null)}
              />
            )}

            <Group mt="xs" mb={'xs'} grow>
              <Button size='md' variant="default" onClick={() => openCancelEditModal()} leftSection={<IconEraser size={20}/>}>
                Cancel
              </Button>
              <Button size='md' type="submit" loading={isLoading} loaderProps={{ type: 'dots' }} leftSection={<IconEdit size={20}/>} >
                Save
              </Button>
            </Group>
          </Stack>
        </Fieldset>
      </form>
    </Container>
  );
}
