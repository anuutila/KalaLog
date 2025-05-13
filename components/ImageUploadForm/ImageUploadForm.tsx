import React, { ForwardedRef, useEffect, useImperativeHandle, useState } from 'react';
import { IconInfoCircle, IconLockOpen2, IconMaximize, IconPhoto, IconPhotoStar, IconStar, IconTrash, IconUpload, IconUser, IconWorld, IconX } from '@tabler/icons-react';
import { ActionIcon, Box, Group, Image, Stack, Switch, Text, Tooltip } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { ICatch } from '@/lib/types/catch';
import classes from './ImageUploadForm.module.css';

import './ImageUploadForm.css';

import { useTranslations } from 'next-intl';
import { Carousel } from '@mantine/carousel';
import { useMediaQuery } from '@mantine/hooks';
import { useGlobalState } from '@/context/GlobalState';
import { SignedImageURLsResponse } from '@/lib/types/responses';
import { UserRole } from '@/lib/types/user';
import { handleApiError } from '@/lib/utils/handleApiError';
import { getSignedImageURLs } from '@/services/api/imageService';
import { optimizeImage } from '@/lib/utils/clientUtils/clientUtils';
import { useLoadingOverlay } from '@/context/LoadingOverlayContext';

const defaultPlaceholder = '/no-image-placeholder.png';

export interface ImageUploadFormRef {
  clearImages: () => void;
}

interface ExistingImage {
  publicId: string;
  url: string;
}

interface ImageUploadFormProps {
  catchData?: ICatch | null;
  setFullscreenImage: (src: string) => void;
  setAddedImages: React.Dispatch<React.SetStateAction<File[]>>;
  setDeletedImages?: React.Dispatch<React.SetStateAction<(string | undefined)[]>>;
  ref?: ForwardedRef<ImageUploadFormRef>;
  newImageMetadata?: ReadonlyArray<{ coverImage: boolean; publicAccess: boolean }>;
  onToggleCoverImage?: (index: number, isCover: boolean) => void;
  onTogglePublicAccess?: (index: number, isPublic: boolean) => void;
  allowMetadataEditing?: boolean;
}

export default function ImageUploadForm({
  catchData,
  setFullscreenImage,
  setAddedImages,
  setDeletedImages,
  ref,
  newImageMetadata,
  onToggleCoverImage,
  onTogglePublicAccess,
  allowMetadataEditing,
}: ImageUploadFormProps) {
  const t = useTranslations();
  const { isLoggedIn, jwtUserInfo } = useGlobalState();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]); // Existing images from the catch
  const [newImages, setNewImages] = useState<string[]>([]); // Previews for newly uploaded images
  const [selectedImage, setSelectedImage] = useState<{ type: 'existing' | 'new'; index: number } | null>(null);

  const isSmallScreen = useMediaQuery('(max-width: 64em)');

  useEffect(() => {
    if (catchData) {
      const fetchSignedImageURLs = async () => {
        if (catchData.images && catchData.images.length > 0) {
          try {
            const publicIds = catchData.images.map((img) => img.publicId);
            const signedImageURLsResponse: SignedImageURLsResponse = await getSignedImageURLs(publicIds);
            setExistingImages(signedImageURLsResponse.data.map((url, index) => ({ publicId: publicIds[index], url })));
          } catch (error) {
            handleApiError(error, 'signed URL generation');
            for (let i = 0; i < catchData.images.length; i++) {
              setExistingImages((prev) => [...prev, { publicId: '', url: defaultPlaceholder }]);
            }
          }
        }
      };

      fetchSignedImageURLs();
    }
  }, [catchData]);

  const handleDrop = async (acceptedFiles: File[]) => {
    showLoading();
    try {
      const optimizationPromises = acceptedFiles.map(file =>
        optimizeImage(file).catch(error => {
          console.error(`Error optimizing image ${file.name}:`, error);
          return null; // Failed files will be filtered out
        })
      );
      const optimizedFiles = (await Promise.all(optimizationPromises)).filter(
        file => file !== null
      ) as File[];

      if (optimizedFiles.length > 0) {
        setAddedImages((prev) => [...prev, ...optimizedFiles]);
        const newPreviews = optimizedFiles.map((file) => URL.createObjectURL(file));
        setNewImages((prev) => [...prev, ...newPreviews]);
      }
    } catch (error) {
      handleApiError(error, 'image processing');
    } finally {
      hideLoading();
    }
    // setAddedImages((prev) => [...prev, ...acceptedFiles]);
    // const newPreviews = acceptedFiles.map((file) => URL.createObjectURL(file));
    // setNewImages((prev) => [...prev, ...newPreviews]);
  };

  const handleDeleteNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setAddedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = (index: number) => {
    if (!setDeletedImages) {
      return;
    }
    setDeletedImages((prev) => [...prev, existingImages[index].publicId]);
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageClick = (type: 'existing' | 'new', index: number) => {
    if (selectedImage && selectedImage.type === type && selectedImage.index === index) {
      setSelectedImage(null); // Deselect if already selected
    } else {
      setSelectedImage({ type, index });
    }
  };

  useImperativeHandle(ref, () => ({
    clearImages: () => {
      setNewImages([]);
      setAddedImages([]);
    },
  }));

  return (
    <Stack gap={0}>
      <Text size="md" fw={500} mb={4}>
        {t('ImageUploadForm.AddPictures')}
      </Text>
      <Dropzone
        onDrop={handleDrop}
        accept={IMAGE_MIME_TYPE}
        maxSize={10 * 1024 ** 2}
        maxFiles={10}
        classNames={{
          root:
            !isLoggedIn || jwtUserInfo?.role === UserRole.VIEWER ? classes.dropzoneDisabled : classes.dropzoneActive,
          inner: classes.dropzone_inner,
        }}
        h={100}
        disabled={!isLoggedIn || jwtUserInfo?.role === UserRole.VIEWER}
      >
        <Group justify="center" align="center" wrap="nowrap" gap="md" style={{ pointerEvents: 'none' }} p="md" h="100%">
          <Dropzone.Accept>
            <IconUpload size={50} stroke={1.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={50} stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto size={50} stroke={1.5} color="var(--mantine-color-dimmed)" />
          </Dropzone.Idle>
          <div>
            <Text size="md" inline>
              {t('ImageUploadForm.AddPictureInfo')}
            </Text>
            <Text size="sm" c="var(--mantine-color-dimmed)" inline mt={7}>
              {t('ImageUploadForm.AddPictureInfo2')}
            </Text>
          </div>
        </Group>
      </Dropzone>

      {(newImages.length > 0 || existingImages.length > 0) && (
        <Box mt="md">
          <Text fw={500} mb={4}>{`${t('ImageUploadForm.Pictures')} (${[...existingImages, ...newImages].length})`}</Text>
          <Carousel
            height={110}
            slideSize={150}
            slideGap={4}
            align="start"
            dragFree
            withControls={!isSmallScreen}
            containScroll="trimSnaps"
          >
            {/* Render existing images */}
            {existingImages.map((img, index) => (
              <Carousel.Slide key={`existing-${index}`}>
                <Box pos="relative" w={150} h={110}>
                  <Image
                    src={img.url}
                    fallbackSrc="/no-image-placeholder.png"
                    alt={`Existing Image ${index}`}
                    fit="cover"
                    radius="md"
                    w="100%"
                    h="100%"
                    onClick={() => handleImageClick('existing', index)}
                    style={{
                      cursor: 'pointer',
                      outline:
                        selectedImage?.type === 'existing' && selectedImage?.index === index
                          ? '3px solid white'
                          : 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {setDeletedImages && (
                    <ActionIcon
                      size="sm"
                      variant="light"
                      pos="absolute"
                      top={8}
                      right={8}
                      bg="rgba(0, 0, 0, 0.75)"
                      onClick={() => handleDeleteExistingImage(index)}
                    >
                      <IconTrash size={16} color="white" />
                    </ActionIcon>
                  )}
                  <ActionIcon
                    size="sm"
                    variant="light"
                    pos="absolute"
                    bottom={8}
                    right={8}
                    bg="rgba(0, 0, 0, 0.75)"
                    onClick={() => setFullscreenImage(img.url)}
                  >
                    <IconMaximize size={16} color="white" />
                  </ActionIcon>
                  {/* <Group
                    pos="absolute"
                    top={8}
                    left={8}
                    gap={4}
                  >
                    {newImageMetadata && newImageMetadata[index].coverImage &&
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        bg="rgba(0, 0, 0, 0.75)"
                      >
                        <IconPhotoStar size={16} color="white" />
                      </ActionIcon>}
                    {newImageMetadata && newImageMetadata[index].publicAccess &&
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        bg="rgba(0, 0, 0, 0.75)"
                      >
                        <IconLockOpen2 size={16} color="white" />
                      </ActionIcon>}
                  </Group> */}
                </Box>
              </Carousel.Slide>
            ))}

            {/* Render new images */}
            {newImages.map((url, index) => (
              <Carousel.Slide key={`new-${index}`}>
                <Box pos="relative" w={150} h={110} p={3}>
                  <Image
                    src={url}
                    fallbackSrc="/no-image-placeholder.png"
                    alt={`New Image ${index}`}
                    fit="cover"
                    radius="md"
                    w="100%"
                    h="100%"
                    onClick={() => handleImageClick('new', index)}
                    style={{
                      cursor: 'pointer',
                      outline:
                        selectedImage?.type === 'new' && selectedImage?.index === index ? '3px solid white' : 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <ActionIcon
                    size="sm"
                    variant="light"
                    pos="absolute"
                    top={8}
                    right={8}
                    bg="rgba(0, 0, 0, 0.75)"
                    onClick={() => handleDeleteNewImage(index)}
                  >
                    <IconTrash size={16} color="white" />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    variant="light"
                    pos="absolute"
                    bottom={8}
                    right={8}
                    bg="rgba(0, 0, 0, 0.75)"
                    onClick={() => setFullscreenImage(url)}
                  >
                    <IconMaximize size={16} color="white" />
                  </ActionIcon>
                  <Group
                    pos="absolute"
                    top={8}
                    left={8}
                    gap={4}
                  >
                    {allowMetadataEditing && newImageMetadata && newImageMetadata[index] && newImageMetadata[index].coverImage &&
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        bg="rgba(0, 0, 0, 0.75)"
                      >
                        <IconPhotoStar size={16} color="white" />
                      </ActionIcon>}
                    {allowMetadataEditing &&  newImageMetadata && newImageMetadata[index] && newImageMetadata[index].publicAccess &&
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        bg="rgba(0, 0, 0, 0.75)"
                      >
                        <IconLockOpen2 size={16} color="white" />
                      </ActionIcon>}
                  </Group>
                </Box>
              </Carousel.Slide>
            ))}
          </Carousel>

          {allowMetadataEditing && newImageMetadata && onToggleCoverImage && onTogglePublicAccess && (
            <Stack mt="md" gap="xs">
              <Group gap={'sm'} align='center'>
                <Text size="md" fw={500}>{t('ImageUploadForm.PictureSettings')} {selectedImage ? `(${t('Common.Picture')} ${selectedImage.index + 1})` : ''}</Text>
                {!selectedImage && <Tooltip
                  onClick={(event) => event.preventDefault()}
                  label={t('ImageUploadForm.PictureSettingsInfo')}
                  position="top"
                  withArrow
                  multiline
                  w={200}
                  events={{ hover: true, focus: true, touch: true }}
                >
                  <IconInfoCircle size={22} stroke={2} color="var(--mantine-color-dimmed)" />
                </Tooltip>}
              </Group>
              <Group gap={'sm'} align='center'>
                <Switch
                  size='md'
                  label={t('ImageUploadForm.CoverPicture')}
                  disabled={!selectedImage}
                  checked={selectedImage ? newImageMetadata[selectedImage.index]?.coverImage || false : false}
                  onChange={(event) => selectedImage ? onToggleCoverImage(selectedImage.index, event.currentTarget.checked) : null}
                />
                <Tooltip
                  onClick={(event) => event.preventDefault()}
                  label={t('ImageUploadForm.CoverPictureInfo')}
                  position="top"
                  withArrow
                  multiline
                  w={200}
                  events={{ hover: true, focus: true, touch: true }}
                >
                  <IconInfoCircle size={22} color="var(--mantine-color-dimmed)" />
                </Tooltip>
              </Group>
              <Group gap={'sm'} align='center'>
                <Switch
                  size='md'
                  label={t('ImageUploadForm.PublicAccess')}
                  disabled={!selectedImage}
                  checked={selectedImage ? newImageMetadata[selectedImage.index]?.publicAccess || false : false}
                  onChange={(event) => selectedImage ? onTogglePublicAccess(selectedImage.index, event.currentTarget.checked) : null}
                />
                <Tooltip
                  onClick={(event) => event.preventDefault()}
                  label={t('ImageUploadForm.PublicAccessInfo')}
                  position="top"
                  withArrow
                  multiline
                  w={200}
                  events={{ hover: true, focus: true, touch: true }}
                >
                  <IconInfoCircle size={22} color="var(--mantine-color-dimmed)" />
                </Tooltip>
              </Group>
            </Stack>
          )}

        </Box>
      )}
    </Stack>
  );
}