import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Autocomplete, Button, Container, Fieldset, Group, NumberInput, Stack, TextInput } from '@mantine/core';
import { ICatch } from '@/lib/types/catch';
import { useGlobalState } from '@/context/GlobalState';
import { CatchUpdatedResponse, ErrorResponse } from '@/lib/types/responses';
import { showNotification } from '@/lib/notifications/notifications';
import { CatchUtils } from '@/lib/utils/catchUtils';
import { IconSelector } from '@tabler/icons-react';
import { useLoadingOverlay } from '@/context/LoadingOverlayContext';
import FullscreenImage from '../CatchDetails/FullscreenImage';
import ImageUploadForm from '@/components/ImageUploadForm/ImageUploadForm';

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

  const [spotValue, setSpotValue] = useState<string>(catchData.location.spot || '');
  const [filteredSpotOptions, setFilteredSpotOptions] = useState<string[]>([]);
  const [spotsDropdownOpened, setSpotsDropdownOpened] = useState<boolean>(false);
  
  const [anglerName, setAnglerName] = useState<string>(catchData.caughtBy.name || '');
  const [filteredAnglerOptions, setFilteredAnglerOptions] = useState<string[]>([]);
  const [anglersDropdownOpened, setAnglersDropdownOpened] = useState<boolean>(false);

  const [files, setFiles] = useState<File[]>([]);
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
      // Upload images to Cloudinary
      const uploadedImageUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/api/imageUpload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          console.log('Image uploaded successfully');
          const data = await uploadResponse.json();
          uploadedImageUrls.push(data.url);
        } else {
          console.error('Failed to upload image:', await uploadResponse.text());
          showNotification('error', 'Failed to upload one or more images.', { withTitle: true });
          return; // Exit if any upload fails
        }
      }

      // Prepare updated catch data
      const updatedCatch: ICatch = {
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
          userId: formData.caughtBy.userId || null,
        },
        images: [
          ...(formData.images || []), // Keep existing images
          ...uploadedImageUrls.map((url) => ({ url })), // Add new images
        ],
      };

      // Send updated catch data to the server
      const response = await fetch(`/api/catches?id=${updatedCatch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCatch),
      });
  
      if (response.ok) {
        const catchUpdateResponse: CatchUpdatedResponse = await response.json();
        setCatches((prev) =>
          prev.map((catchItem) =>
            catchItem.id === catchUpdateResponse.data.id ? catchUpdateResponse.data : catchItem
          )
        );
        showNotification('success', catchUpdateResponse.message, { withTitle: false });
        setIsInEditView(false);
        setSelectedCatch(catchUpdateResponse.data);
      } else {
        const errorResponse: ErrorResponse = await response.json();
        console.error('Error:', errorResponse);
        showNotification('error', errorResponse.message, { withTitle: true });
      }
    } catch (error) {
      console.error('An unexpected error occurred while updating the catch:', error);
      showNotification('error', 'An unexpected error occurred while updating the catch. Please try again later.', { withTitle: true });
    } finally {
      hideLoading();
      setIsLoading(false);
    }
  };

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
    <Container size="sm" p={0}>
      <form onSubmit={handleSubmit}>
        <Fieldset disabled={isLoading} variant="unstyled">
          <Stack gap={8}>
            
            <ImageUploadForm
              catchData={catchData}
              setFullscreenImage={setFullscreenImage}
              setFiles={setFiles}
            />

            {/* Fullscreen Image */}
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
            <TextInput
                size='md'
                type='text'
                name='coordinates'
                label="Koordinaatit"
                placeholder=""
                value={formData.location.coordinates ?? ''}
                onChange={handleChange}
                pattern='^([-+]?\d{1,3}\.\d{1,12},\s*[-+]?\d{1,3}\.\d{1,12})?$' // GPS coordinates pattern
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
              />
              <TextInput
                size="md"
                type="time"
                name="time"
                label="Aika"
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
            <Group mt="md" grow>
              <Button size='md' variant="default" onClick={() => openCancelEditModal()}>
                Cancel
              </Button>
              <Button size='md' type="submit" loading={isLoading} loaderProps={{ type: 'dots' }}>
                Save
              </Button>
            </Group>
          </Stack>
        </Fieldset>
      </form>
    </Container>
  );
}
