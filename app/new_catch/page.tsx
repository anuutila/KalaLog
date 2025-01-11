'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FullscreenImage from '@/components/catchesPage/CatchDetails/FullscreenImage';
import ImageUploadForm, { ImageUploadFormRef } from '@/components/ImageUploadForm/ImageUploadForm';
import { useGlobalState } from '@/context/GlobalState';
import { useLoadingOverlay } from '@/context/LoadingOverlayContext';
import { showNotification } from '@/lib/notifications/notifications';
import { ICatch } from '@/lib/types/catch';
import { CatchCreaetedResponse, ErrorResponse, ImageUploadResponse } from '@/lib/types/responses';
import { UserRole } from '@/lib/types/user';
import { CatchUtils } from '@/lib/utils/catchUtils';
import { defaultSort, optimizeImage } from '@/lib/utils/utils';
import { Alert, Autocomplete, Button, Checkbox, Container, Fieldset, Group, NumberInput, Stack, TextInput, Title } from '@mantine/core';
import { IconCalendar, IconClock, IconInfoCircle, IconSelector } from '@tabler/icons-react';
import { createCatch } from '@/services/api/catchService';
import { handleApiError } from '@/lib/utils/handleApiError';
import { uploadImage } from '@/services/api/imageService';

interface CatchAndImagesData extends Omit<ICatch, 'id' | 'createdAt' | 'catchNumber'> {
  imagesData: File[];
}

export default function Page() {
  const { catches, setCatches, isLoggedIn, jwtUserInfo } = useGlobalState();
  const { showLoading, hideLoading } = useLoadingOverlay();

  const [formData, setFormData] = useState<Omit<ICatch, 'id' | 'createdAt' | 'catchNumber'>>({
    species: '',
    length: undefined,
    weight: undefined,
    lure: null,
    location: {
      bodyOfWater: 'Nerkoonjärvi',
      spot: null,
      coordinates: null,
    },
    date: new Date().toISOString().split('T')[0],
    time: new Date(new Date().getTime() + 120 * 60000).toISOString().split('T')[1].slice(0, 5),
    caughtBy: { name: '', userId: null },
    createdBy: null,
  });

  const [speciesValue, setSpeciesValue] = useState<string>('');
  const [filteredSpeciesOptions, setFiltereSpeciesOptions] = useState<string[]>([]);
  const [speciesDropdownOpened, setSpeciesDropdownOpened] = useState<boolean>(false);

  const [weightValue, setWeightValue] = useState<string | number>('');
  const [lengthValue, setLengthValue] = useState<string | number>('');

  const [lureValue, setLureValue] = useState<string>('');
  const [filteredLureOptions, setFilteredLureOptions] = useState<string[]>([]);
  const [luresDropdownOpened, setLuresDropdownOpened] = useState<boolean>(false);

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

  const imageUploadFormRef = useRef<ImageUploadFormRef>(null);

  useEffect(() => {
    setDisableScroll(fullscreenImage !== null);
    return () => {
      setDisableScroll(false);
    };
  } , [fullscreenImage]);

  // Disable scrolling when the fullscreen image is open
  useEffect(() => {
    if (disableScroll) {
      document.documentElement.style.overflow = 'hidden'; // Prevent scrolling on <html>
      document.body.style.overflow = 'hidden'; // Prevent scrolling on <body>
      document.body.style.position = 'fixed'; // Prevent content shift on mobile
      document.body.style.top = `-${window.scrollY}px`; // Keep scroll position
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.documentElement.style.overflow = ''; // Restore scrolling on <html>
      document.body.style.overflow = ''; // Restore scrolling on <body>
      window.scrollTo(0, parseInt(scrollY || '0') * -1); // Restore scroll position
    }
  
    return () => {
      document.documentElement.style.overflow = ''; // Restore scrolling on <html>
      document.body.style.overflow = ''; // Restore scrolling on <body>
      document.body.style.position = ''; // Clean up on unmount
      document.body.style.top = ''; // Reset top style
    }
  }, [disableScroll]);

  const handleClearImages = () => {
    if (imageUploadFormRef.current) {
      imageUploadFormRef.current.clearImages();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      if (name === 'bodyOfWater' || name === 'coordinates') {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    showLoading();
    setIsLoading(true);
    try {
      // Prepare form data for submission
      const parsedFormData: Omit<ICatch, 'id' | 'createdAt' | 'catchNumber'> = {
        ...formData,
        species: speciesValue,
        length: typeof lengthValue === 'string' ? null : lengthValue,
        weight: typeof weightValue === 'string' ? null : weightValue,
        lure: lureValue,
        location: {
          ...formData.location,
          spot: spotValue,
        },
        caughtBy: {
          name: anglerName,
          userId: null,
        },
        createdBy: jwtUserInfo?.userId ?? null
      };

      console.log('Submitting form data:', parsedFormData);
      console.log(`With ${files.length} images`);

      // Optimize images before uploading
      console.log('Optimizing images...');
      const optimizedFiles = await Promise.all(
        files.map(async (file) => {
          const optimizedFile = await optimizeImage(file);
          return optimizedFile;
        })
      );

      // Send the catch details and image(s) to the API
      const catchCreatedResponse: CatchCreaetedResponse = await createCatch(parsedFormData, optimizedFiles);
      console.log(catchCreatedResponse.message, catchCreatedResponse.data);
      if (catchCreatedResponse.data.failedImageUploads) {
        showNotification('warning', catchCreatedResponse.message, { withTitle: true });
      } else {
        showNotification('success', catchCreatedResponse.message, { withTitle: false });
      }

      // Update the catches in global state
      setCatches((prevCatches) => defaultSort([catchCreatedResponse.data.catch, ...prevCatches]));

      // Reset the form
      setFormData({
        species: '',
        length: undefined,
        weight: undefined,
        lure: null,
        location: { bodyOfWater: 'Nerkoonjärvi', spot: null, coordinates: null },
        date: new Date().toISOString().split('T')[0],
        time: new Date(new Date().getTime() + 120 * 60000).toISOString().split('T')[1].slice(0, 5),
        caughtBy: { name: '', userId: null },
      });
      setSpeciesValue('');
      setLengthValue('');
      setWeightValue('');
      setLureValue('');
      setSpotValue('');
      setUseGps(false);
      setGpsError(null);
      setAnglerName('');
      handleClearImages();
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }

    } catch (error) {
      handleApiError(error, 'catch creation');
    } finally {
      setIsLoading(false);
      hideLoading();
    }
  };

  const speciesOptions = ['Ahven', 'Hauki', 'Kuha'];

  const lureOptions = useMemo(() => 
    CatchUtils.getUniqueLures(catches).map((lure) => lure.lure).filter((lure) => lure !== '?'), 
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
    <Container size='sm' p={'md'}>
      { (!isLoggedIn || jwtUserInfo?.role === UserRole.VIEWER )&& <Alert variant="light" color="red" radius="md" title="Huomio" icon={<IconInfoCircle />} mb={'md'}>
        {jwtUserInfo?.role === UserRole.VIEWER ? 'Sinulla ei ole uuden saaliin lisäämiseen tarvittavia oikeuksia.' : 'Kirjaudu sisään lisätäksesi uuden saaliin.'}
      </Alert> }
      <form onSubmit={handleSubmit}>
        <Fieldset disabled={!isLoggedIn || jwtUserInfo?.role === UserRole.VIEWER || isLoading} variant='unstyled'>
          <Stack gap={8}>
            <Title c='white' order={2} pb={'md'}>Saaliin tiedot</Title>
            
            <ImageUploadForm
              ref={imageUploadFormRef}
              setFullscreenImage={setFullscreenImage}
              setFiles={setFiles}
            />

            {fullscreenImage && (
              <FullscreenImage
                src={fullscreenImage}
                onClose={() => setFullscreenImage(null)}
              />
            )}

            <Autocomplete
              size='md'
              type='text'
              name='species'
              label="Laji"
              value={speciesValue}
              required
              onChange={handleSpeciesChange}
              onFocus={() => setSpeciesDropdownOpened(true)}
              onBlur={() => setSpeciesDropdownOpened(false)}
              rightSection={speciesRightSection}
              data={speciesOptions}
              defaultDropdownOpened={false}
            />
            <Group grow>
              <NumberInput
                size='md'
                name='length'
                label="Pituus"
                step={0.01}
                min={0}
                max={999}
                placeholder="cm"
                value={lengthValue}
                suffix=' cm'
                onChange={setLengthValue}
                // pattern="^\d*(\.\d*)?$" // Allow decimals
              />
              <NumberInput
                size='md'
                name='weight'
                label="Paino"
                step={0.01}
                min={0}
                max={999}
                placeholder="kg"
                value={weightValue}
                suffix=' kg'
                onChange={setWeightValue}
                // pattern="^\d*(\.\d*)?$" // Allow decimals
              />
            </Group>
            <Autocomplete
              size='md'
              type='text'
              label="Viehe"
              name='lure'
              value={lureValue}
              onChange={handleLureChange}
              onFocus={() => setLuresDropdownOpened(true)}
              onBlur={() => setLuresDropdownOpened(false)}
              rightSection={lureRightSection}
              data={lureOptions}
            />
            <Autocomplete
              size='md'
              type='text'
              name='spot'
              label="Paikka"
              placeholder="esim. Ahvenniemi"
              value={spotValue}
              onChange={handleSpotChange}
              onFocus={() => setSpotsDropdownOpened(true)}
              onBlur={() => setSpotsDropdownOpened(false)}
              rightSection={spotRightSection}
              data={spotOptions}
              defaultDropdownOpened={false}
            />
            <Group grow>
              <TextInput
                size='md'
                type='text'
                name='coordinates'
                label="Koordinaatit"
                placeholder=""
                value={formData.location.coordinates ?? ''}
                onChange={handleChange}
                disabled={!useGps || gpsError !== null}
                pattern='^([-+]?\d{1,3}\.\d{1,12},\s*[-+]?\d{1,3}\.\d{1,12})?$' // GPS coordinates pattern
              />
              <Checkbox
                size='md'
                checked={useGps && gpsError === null}
                onChange={handleGpsToggle}
                label="GPS-koordinaatit"
                error={gpsError}
              />
            </Group>
            <Group grow>
              <TextInput
                size='md'
                type='date'
                name="date"
                label="Päivämäärä"
                rightSection={<Stack hiddenFrom='md'><IconCalendar /></Stack>}
                rightSectionPointerEvents='none'
                value={formData.date}
                onChange={handleChange}
                required
              />
              <TextInput
                size='md'
                type='time'
                name="time"
                label="Aika"
                placeholder="--.--"
                rightSection={<Stack hiddenFrom='md'><IconClock /></Stack>}
                rightSectionPointerEvents='none'
                value={formData.time}
                onChange={handleChange}
                required
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
            />
            <Button size='md' type="submit" loading={isLoading} loaderProps={{ type: 'dots' }} mt={'xs'} mb={'md'}>
              Lähetä
            </Button>
          </Stack>
        </Fieldset>
      </form>
    </Container>
  );
}
