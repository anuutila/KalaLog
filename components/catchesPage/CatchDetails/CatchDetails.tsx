import React, { use, useEffect, useState } from 'react';
import { ICatch } from "@/lib/types/catch";
import { ActionIcon, Box, Container, Group, Stack, Text, Title } from '@mantine/core';
import { IconPencil, IconTrash, IconX } from '@tabler/icons-react';
import classes from './CatchDetails.module.css';
import { useHeaderActions } from '@/context/HeaderActionsContext';
import { CatchDeletedResponse, ErrorResponse } from '@/lib/types/responses';
import { showNotification } from '@/lib/notifications/notifications';
import { useGlobalState } from '@/context/GlobalState';
import { useLoadingOverlay } from '@/context/LoadingOverlayContext';
import CatchImageCarousel from './CatchImageCarousel';
import FullscreenImage from './FullscreenImage';
import CatchDetailsGrid from './CatchDetailsGrid';
import CatchEditForm from '../CatchEditForm/CatchEditForm';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import ConfirmEditModal from './ConfirmEditModal';
import CancelEditModal from './CancelEditModal';

interface CatchDetailsProps {
  selectedCatch: ICatch;
  setSelectedCatch: React.Dispatch<React.SetStateAction<ICatch | null>>;
}

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
  setSelectedCatch
}: CatchDetailsProps) {
  const { setCatches, isLoggedIn } = useGlobalState();
  const { setActionsDisabled } = useHeaderActions();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [disableScroll, setDisableScroll] = useState(false);
  const [isInEditView, setIsInEditView] = useState(false);

  useEffect(() => {
    setDisableScroll(fullscreenImage !== null);
    return () => {
      setDisableScroll(false);
    };
  } , [fullscreenImage]);

  useEffect(() => {
    // Disable header actions when the component mounts
    setActionsDisabled(true);

    // Re-enable header actions when the component unmounts
    return () => {
      setActionsDisabled(false);
    };
  }, []);
  
  const openConfirmEditModal = () => {
    ConfirmEditModal({
      onConfirm: () => {
        setIsInEditView(true);
      },
    });
  };

  const openCancelEditModal = () => {
    CancelEditModal({
      onConfirm: () => {
        setIsInEditView(false);
      },
    });
  };

  const openConfirmDeleteModal = () => {
    ConfirmDeleteModal({
      onConfirm: () => {
        handleDeleteCatch(selectedCatch.id);
      },
    });
  };

  const handleDeleteCatch = async (catchId: string | undefined) => {
    showLoading();
    try {
      const response = await fetch(`/api/catches?id=${catchId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorResponse: ErrorResponse = await response.json();
        console.error('Error:', errorResponse);
        showNotification('error', errorResponse.message, { withTitle: true });
      } else {
        const catchDeletedResponse: CatchDeletedResponse = await response.json();
        console.log(catchDeletedResponse.message, catchDeletedResponse.data);
        showNotification('success', catchDeletedResponse.message, { withTitle: false });

        // Close the modal
        setSelectedCatch(null);

        // Update the catches state
        setCatches((prevCatches) => prevCatches.filter((catchItem) => catchItem.id !== catchId));
      }

    } catch (error) {
      console.error('An unexpected error occurred while deleting catch:', error);
      showNotification('error', 'An unexpected error occurred while deleting the catch. Please try again later.', { withTitle: true });
    } finally {
      hideLoading();
    }
  };

  const imagesToShow = selectedCatch.images && selectedCatch.images.length > 0
    ? selectedCatch.images.map(img => img.url) // Use actual images if available
    : [speciesPlaceholders[selectedCatch.species] || defaultPlaceholder]; // Use placeholder or fallback

  // Determine if fullscreen should be available
  const isFallbackImage = imagesToShow.length === 1 && imagesToShow[0] === defaultPlaceholder;

  const details = {
      Laji: selectedCatch.species,
      Pituus: selectedCatch.length,
      Paino: selectedCatch.weight,
      Viehe: selectedCatch.lure,
      Vesistö: selectedCatch.location.bodyOfWater,
      Paikka: selectedCatch.location.spot,
      Päivämäärä: selectedCatch.date,
      Aika: selectedCatch.time,
      Kalastaja: selectedCatch.caughtBy.name,
    };

  return (
    <Box
      pos={'fixed'}
      top={'var(--app-shell-header-offset)'}
      bottom={{ base: 'calc(var(--app-shell-footer-offset) + env(safe-area-inset-bottom))', md: 0 }}
      left={0}
      w={'100%'}
      p={20}
      style={{
        backgroundColor: 'var(--mantine-color-body)',
        zIndex: 100,
        overflowY: 'auto',
      }}
      className={disableScroll ? classes.noScroll : ''}
    >
      <Container p={0}>
        <Stack gap={'lg'}>
          {/* Header */}
          <Group>
            <Title c='white' order={2} p={0} mr={'auto'}>
              {isInEditView ? 'Muokkaa saalista' : 'Saaliin tiedot'}
            </Title>

            {/* Close, Edit, Delete Buttons */}
            <Group gap="xs" align='center'>
              {/* Edit Button */}
              {!isInEditView && (
                <ActionIcon
                  size="lg"
                  variant="light"
                  color="blue"
                  onClick={openConfirmEditModal}
                  disabled={!isLoggedIn}
                >
                  <IconPencil size={20} />
                </ActionIcon>
              )}
              {/* Delete Button */}
              {!isInEditView && (
                <ActionIcon size="lg" variant="light" color="red" disabled={!isLoggedIn} onClick={() => openConfirmDeleteModal()}>
                  <IconTrash size={20} />
                </ActionIcon>
              )}
              {/* Close Button */}
              <ActionIcon size="lg" variant="light" color="gray" onClick={ isInEditView ? () => openCancelEditModal() : () => { setSelectedCatch(null) }}>
                <IconX size={20} />
              </ActionIcon>
            </Group>
          </Group>

          {/* Content */}
          {!isInEditView ? (
            <>
              {/* Image Carousel */}
              <CatchImageCarousel
                images={imagesToShow}
                isFallbackImage={isFallbackImage}
                onFullscreen={(src) => setFullscreenImage(src)}
              />

              {/* Fullscreen Image */}
              {fullscreenImage && (
                <FullscreenImage
                  src={fullscreenImage}
                  onClose={() => setFullscreenImage(null)}
                />
              )}

              {/* Catch Details Grid */}
              <CatchDetailsGrid
                details={details}
                coordinates={selectedCatch.location.coordinates}
              />
            </>
          ) : (
            <CatchEditForm
              catchData={selectedCatch}
              setIsInEditView={setIsInEditView}
              setSelectedCatch={setSelectedCatch}
              openCancelEditModal={openCancelEditModal}
              setDisableScroll={setDisableScroll}
            />
          )}

        </Stack>
      </Container>
    </Box>
  );
};