import React, { useEffect, useMemo, useState } from 'react';
import { IconCheck, IconPencil, IconShare, IconTrash, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { ActionIcon, Box, Container, CopyButton, Group, Paper, Stack, Title, Tooltip } from '@mantine/core';
import { useGlobalState } from '@/context/GlobalState';
import { useHeaderActions } from '@/context/HeaderActionsContext';
import { useLoadingOverlay } from '@/context/LoadingOverlayContext';
import { showNotification } from '@/lib/notifications/notifications';
import { ICatch } from '@/lib/types/catch';
import { CatchDeletedResponse, SignedImageURLsResponse } from '@/lib/types/responses';
import { creatorRoles, editorRoles, UserRole } from '@/lib/types/user';
import { handleApiError } from '@/lib/utils/handleApiError';
import { deleteCatch } from '@/services/api/catchService';
import { getSignedImageURLs } from '@/services/api/imageService';
import CatchEditForm from '../CatchEditForm/CatchEditForm';
import CancelEditModal from './CancelEditModal';
import CatchDetailsGrid from './CatchDetailsGrid';
import CatchImageCarousel from './CatchImageCarousel';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import ConfirmEditModal from './ConfirmEditModal';
import FullscreenImage from './FullscreenImage';
import classes from './CatchDetails.module.css';

export interface CatchDetails {
  species: { label: string; data: string };
  length: { label: string; data: number | null | undefined };
  weight: { label: string; data: number | null | undefined };
  lure: { label: string; data: string | null | undefined };
  bodyOfWater: { label: string; data: string };
  spot: { label: string; data: string | null | undefined };
  coordinates: { label: string; data: string | null | undefined };
  date: { label: string; data: string };
  time: { label: string; data: string };
  caughtBy: { label: string; data: string };
  comment: { label: string; data: string | null | undefined };
}

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
const noAccessPlaceholder = '/no-access-placeholder.png';

export default function CatchDetails({ selectedCatch, setSelectedCatch }: CatchDetailsProps) {
  const t = useTranslations();
  const { setCatches, isLoggedIn, jwtUserInfo, displayNameMap } = useGlobalState();
  const { setActionsDisabled } = useHeaderActions();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [disableScroll, setDisableScroll] = useState(false);
  const [isInEditView, setIsInEditView] = useState(false);
  const [imagesToShow, setImagesToShow] = useState<string[]>([]);

  const urlToCopy = typeof window !== 'undefined'
    ? `${window.location.origin}/catches?catchNumber=${selectedCatch.catchNumber}`
    : '';

  const canViewImages = useMemo(() => {
    if (!isLoggedIn || !jwtUserInfo) {
      return false;
    }
    return (
      editorRoles.includes(jwtUserInfo.role) ||
      jwtUserInfo?.role === UserRole.TRUSTED_CREATOR ||
      selectedCatch.caughtBy.userId === jwtUserInfo?.userId
    );
  }, [isLoggedIn, jwtUserInfo, selectedCatch]);

  useEffect(() => {
    const fetchSignedImageURLs = async () => {
      if (selectedCatch.images && selectedCatch.images.length > 0) {
        if (canViewImages) {
          try {
            const publicIds = selectedCatch.images.map((img) => img.publicId);
            const signedImageURLsResponse: SignedImageURLsResponse = await getSignedImageURLs(publicIds);
            setImagesToShow(signedImageURLsResponse.data);
          } catch (error) {
            handleApiError(error, 'signed URL generation');
          }
        } else {
          setImagesToShow([]);
          for (let i = 0; i < selectedCatch.images.length; i++) {
            setImagesToShow((prev) => [...prev, noAccessPlaceholder]);
          }
        }
      }
    };

    if (selectedCatch.images && selectedCatch.images.length > 0) {
      fetchSignedImageURLs();
    } else {
      setImagesToShow([speciesPlaceholders[selectedCatch.species] || defaultPlaceholder]);
    }
  }, [selectedCatch]);

  useEffect(() => {
    setDisableScroll(fullscreenImage !== null);
    return () => {
      setDisableScroll(false);
    };
  }, [fullscreenImage]);

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
      t,
    });
  };

  const openCancelEditModal = () => {
    CancelEditModal({
      onConfirm: () => {
        setIsInEditView(false);
      },
      t,
    });
  };

  const openConfirmDeleteModal = () => {
    ConfirmDeleteModal({
      onConfirm: () => {
        handleDeleteCatch(selectedCatch.id);
      },
      t,
    });
  };

  const handleDeleteCatch = async (catchId: string | undefined) => {
    showLoading();
    try {
      const catchDeletedResponse: CatchDeletedResponse = await deleteCatch(catchId);
      console.log(catchDeletedResponse.message, catchDeletedResponse.data);
      showNotification('success', catchDeletedResponse.message, { withTitle: false });

      // Close the modal
      setSelectedCatch(null);

      // Update the catches state
      setCatches((prevCatches) => prevCatches.filter((catchItem) => catchItem.id !== catchId));
    } catch (error) {
      handleApiError(error, 'catch deletion');
    } finally {
      hideLoading();
    }
  };

  const canEdit = useMemo(() => {
    if (!isLoggedIn || !jwtUserInfo) {
      return false;
    }
    if (editorRoles.includes(jwtUserInfo.role)) {
      return true;
    }
    if (creatorRoles.includes(jwtUserInfo.role)) {
      return jwtUserInfo.userId === selectedCatch.caughtBy.userId;
    }
    return false;
  }, [isLoggedIn, jwtUserInfo, selectedCatch]);

  // Determine if fullscreen should be available
  const isFallbackImage = imagesToShow.length === 1 && imagesToShow[0] === defaultPlaceholder;

  const details: CatchDetails = {
    species: {
      label: t('Common.FishSpecies'),
      data: t.has(`Fish.${selectedCatch.species}`) ? t(`Fish.${selectedCatch.species}`) : selectedCatch.species,
    },
    length: { label: t('Common.Length'), data: selectedCatch.length },
    weight: { label: t('Common.Weight'), data: selectedCatch.weight },
    lure: { label: t('Common.Lure'), data: selectedCatch.lure },
    bodyOfWater: { label: t('Common.BodyOfWater'), data: selectedCatch.location.bodyOfWater },
    spot: { label: t('Common.Spot'), data: selectedCatch.location.spot },
    coordinates: { label: t('Common.Coordinates'), data: selectedCatch.location.coordinates },
    date: { label: t('Common.Date'), data: selectedCatch.date },
    time: { label: t('Common.Time'), data: selectedCatch.time },
    caughtBy: {
      label: t('Common.CaughtBy'),
      data:
        (selectedCatch.caughtBy.userId && displayNameMap[selectedCatch.caughtBy.userId]) || selectedCatch.caughtBy.name,
    },
    comment: { label: t('Common.Comment'), data: selectedCatch.comment },
  };

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
      className={disableScroll ? classes.noScroll : ''}
    >
      <Container p={0} size="sm">
        <Stack gap="sm">
          {/* Header */}
          <Group mb={4}>
            <Title c="white" order={2} p={0} mr="auto" pl={4}>
              {isInEditView ? t('CatchesPage.EditCatch') : `${t('Common.Catch')} #${selectedCatch.catchNumber}`}
            </Title>

            {/* Copy link, Edit, Delete, Close Buttons */}
            <Group gap="xs" align="center">
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
                            t('Notifications.LinkCopiedMessage', { catchNumber: selectedCatch.catchNumber }),
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
                <ActionIcon size="lg" variant="light" color="blue" onClick={openConfirmEditModal} disabled={!canEdit}>
                  <IconPencil size={20} />
                </ActionIcon>
              )}
              {/* Delete Button */}
              {!isInEditView && (
                <ActionIcon
                  size="lg"
                  variant="light"
                  color="red"
                  disabled={!canEdit}
                  onClick={() => openConfirmDeleteModal()}
                >
                  <IconTrash size={20} />
                </ActionIcon>
              )}
              {/* Close Button */}
              <ActionIcon
                size="lg"
                variant="light"
                color="gray"
                onClick={
                  isInEditView
                    ? () => openCancelEditModal()
                    : () => {
                      setSelectedCatch(null);
                    }
                }
              >
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
                setFullscreen={(src) => setFullscreenImage(src)}
              />

              {/* Fullscreen Image */}
              {fullscreenImage && <FullscreenImage src={fullscreenImage} onClose={() => setFullscreenImage(null)} />}

              {/* Catch Details Grid */}
              <Box p={0}>
                <CatchDetailsGrid details={details} coordinates={selectedCatch.location.coordinates} />
              </Box>
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
    </Paper>
  );
}
