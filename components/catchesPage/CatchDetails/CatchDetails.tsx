import React, { useState } from 'react';
import { ICatch } from "@/lib/types/catch";
import { ActionIcon, Box, Center, Grid, Group, Image, Overlay, Stack, Text } from '@mantine/core';
import { IconMaximize, IconPencil, IconTrash, IconX } from '@tabler/icons-react';
import { Carousel } from '@mantine/carousel';
import classes from './CatchDetails.module.css';
import { useHeaderActions } from '@/context/HeaderActionsContext';

interface CatchDetailsProps {
  selectedCatch: ICatch | null;
  setCatchDetailsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const unitsMap: Record<string, string> = {
  Paino: ' kg',
  Pituus: ' cm',
};

const speciesPlaceholders: Record<string, string> = {
  Hauki: '/hauki-1000x1000.png',
  Kuha: '/kuha-1000x1000.png',
  Ahven: '/ahven-1000x1000_2.png',
  Lahna: '/lahna-1000x1000.png',
  Särki: '/sarki-1000x1000.png',
  Kiiski: '/kiiski-1000x1000.png',
};

const defaultPlaceholder = '/no-image-placeholder.png';

export default function CatchDetails({
  selectedCatch,
  setCatchDetailsOpen
}: CatchDetailsProps) {
  const { setActionsDisabled } = useHeaderActions();
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const handleEdit = () => {
    // Implement edit functionality here
    console.log('Edit catch:', selectedCatch);
  };

  const handleDelete = () => {
    // Implement delete functionality here
    console.log('Delete catch:', selectedCatch);
  };

  const formatDate = (date: string): string => {
    const dateParts = date.split('-');
    if (dateParts.length === 3) {
      // remove leading zeros
      dateParts[2] = dateParts[2].replace(/^0+/, '');
      dateParts[1] = dateParts[1].replace(/^0+/, '');
      return `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`; // Rearrange to "dd.mm.yyyy"
    }
    return date;
  };

  const renderField = (label: string, value?: string | number | null) => {
    const formattedValue =
      label === 'Päivämäärä' && typeof value === 'string' ? formatDate(value) : value;

    const unit = unitsMap[label] || '';

    return (
      <Grid.Col span={6}>
        <Text size="md" fw={500}>
          {label}
        </Text>
        <Text size="md">
          {formattedValue !== null && formattedValue !== undefined && formattedValue !== ''
            ? `${formattedValue}${unit}`
            : '-'}
        </Text>
      </Grid.Col>
    );
  };

  const imagesToShow = selectedCatch ? selectedCatch.images && selectedCatch.images.length > 0
    ? selectedCatch.images.map(img => img.url) // Use actual images if available
    : [speciesPlaceholders[selectedCatch.species] || defaultPlaceholder] : [defaultPlaceholder]; // Use placeholder or fallback

  // Determine if fullscreen should be available
  const isFallbackImage = imagesToShow.length === 1 && imagesToShow[0] === defaultPlaceholder;

  return (
    <Box
      style={{
        position: 'fixed',
        top: 'var(--app-shell-header-offset)', // Leaves space for the header
        bottom: 'calc(var(--app-shell-footer-offset) + env(safe-area-inset-bottom))', // Leaves space for the footer
        left: 0,
        width: '100%',
        backgroundColor: 'var(--mantine-color-body)',
        zIndex: 1000,
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <Stack>
        {/* Title */}
        <Group>
          <Text size="lg" fw={600} mr={'auto'}>
            Catch Details
          </Text>

          {/* Close, Edit, Delete Buttons */}
          <Group gap="xs" align='center'>
            {/* Edit Button */}
            <ActionIcon size="lg" variant="light" color="blue" onClick={() => console.log('Edit', selectedCatch)}>
              <IconPencil size={20} />
            </ActionIcon>

            {/* Delete Button */}
            <ActionIcon size="lg" variant="light" color="red" onClick={() => console.log('Delete', selectedCatch)}>
              <IconTrash size={20} />
            </ActionIcon>

            {/* Close Button */}
            <ActionIcon size="lg" variant="light" color="gray" onClick={() => { setCatchDetailsOpen(false), setActionsDisabled(false) }}>
              <IconX size={20} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Image Carousel */}
        <Carousel
          withIndicators={imagesToShow.length > 1}
          withControls={imagesToShow.length > 1}
          loop={imagesToShow.length > 1}
          classNames={{ viewport: classes.viewport }}
        >
          {imagesToShow.map((src, index) => (
            <Carousel.Slide key={index}>
              <Box pos="relative" w="100%" h="300px" bg="#f4f4f4">
                <Image
                  src={src}
                  fit="cover"
                  height={300}
                  alt={`Catch image ${index + 1}`}
                  fallbackSrc='/no-image-placeholder.png'
                  style={{
                    backgroundColor: 'var(--mantine-color-dark-7)',
                  }}

                />
                {!isFallbackImage && (
                  <ActionIcon
                    size="lg"
                    variant="light"
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      background: 'rgba(0, 0, 0, 0.5)',
                    }}
                    onClick={() => setFullscreenImage(src)}
                  >
                    <IconMaximize size={20} color="white" />
                  </ActionIcon>
                )}
              </Box>
            </Carousel.Slide>
          ))}
        </Carousel>

        {/* Fullscreen Overlay */}
        {fullscreenImage && (
          <Overlay
            backgroundOpacity={0.9}
            blur={15}
            color="black"
            fixed
          //onClick={() => setFullscreenImage(null)} // Close on clicking the overlay
          >
            <Center
              h={'100%'}
              w={'100%'}
            >
              <Image
                src={fullscreenImage}
                fit="contain"
                style={{ borderRadius: '10px' }}
                alt="Fullscreen Catch Image"
              />
            </Center>
            <ActionIcon
              size="lg"
              variant="light"
              pos={'absolute'}
              top={20}
              right={20}
              bg={'rgba(0, 0, 0, 0.7)'}
              onClick={(e) => {
                e.stopPropagation(); // Prevent closing the overlay
                setFullscreenImage(null); // Close fullscreen
              }}
            >
              <IconX size={24} color="white" />
            </ActionIcon>
          </Overlay>
        )}

        {/* Catch Details */}
        <Grid gutter="sm">
          {renderField('Laji', selectedCatch?.species)}
          {renderField('Pituus', selectedCatch?.length)}
          {renderField('Paino', selectedCatch?.weight)}
          {renderField('Viehe', selectedCatch?.lure)}
          {renderField('Vesistö', selectedCatch?.location.bodyOfWater)}
          {renderField('Paikka', selectedCatch?.location.spot)}
          {renderField('Päivämäärä', selectedCatch?.date)}
          {renderField('Aika', selectedCatch?.time)}
          {renderField('Kalastaja', selectedCatch?.caughtBy.name)}
        </Grid>

      </Stack>
    </Box>
  );
};