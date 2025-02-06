import React, { ForwardedRef, useEffect, useImperativeHandle, useState } from "react";
import { ICatch } from "@/lib/types/catch";
import { ActionIcon, Box, Group, Image, Stack, Text } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconPhoto, IconTrash, IconUpload, IconX } from "@tabler/icons-react";
import classes from './ImageUploadForm.module.css';
import './ImageUploadForm.css'
import { Carousel } from "@mantine/carousel";
import { useMediaQuery } from "@mantine/hooks";
import { useGlobalState } from "@/context/GlobalState";
import { UserRole } from "@/lib/types/user";
import { SignedImageURLsResponse } from "@/lib/types/responses";
import { getSignedImageURLs } from "@/services/api/imageService";
import { handleApiError } from "@/lib/utils/handleApiError";
import { useTranslations } from "next-intl";

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
}

export default function ImageUploadForm({
  catchData,
  setFullscreenImage,
  setAddedImages,
  setDeletedImages,
  ref,
}: ImageUploadFormProps) {
  const t = useTranslations();
  const { isLoggedIn, jwtUserInfo } = useGlobalState();
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]); // Existing images from the catch
  const [newImages, setNewImages] = useState<string[]>([]); // Previews for newly uploaded images

  const isSmallScreen = useMediaQuery('(max-width: 64em)');

  useEffect(() => {
    if (catchData) {
      const fetchSignedImageURLs = async () => {
        if (catchData.images && catchData.images.length > 0) {
          try {
            const publicIds = catchData.images.map(img => img.publicId);
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

  const handleDrop = (acceptedFiles: File[]) => {
    setAddedImages((prev) => [...prev, ...acceptedFiles]);
    const newPreviews = acceptedFiles.map((file) => URL.createObjectURL(file));
    setNewImages((prev) => [...prev, ...newPreviews]);
  };

  const handleDeleteNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setAddedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = (index: number) => {
    if (!setDeletedImages) return;
    setDeletedImages((prev) => [...prev, existingImages[index].publicId]);
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
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
      {t('NewCatchPage.AddPicture')}
      </Text>
      <Dropzone
        onDrop={handleDrop}
        accept={IMAGE_MIME_TYPE}
        maxSize={10 * 1024 ** 2}
        maxFiles={10}
        classNames={{ 
          root: !isLoggedIn || jwtUserInfo?.role === UserRole.VIEWER ? classes.dropzoneDisabled : classes.dropzoneActive, 
          inner: classes.dropzone_inner 
        }}
        h={100}
        disabled={!isLoggedIn || jwtUserInfo?.role === UserRole.VIEWER}
      >
        <Group justify='center' align="center" wrap='nowrap' gap="md" style={{ pointerEvents: 'none' }} p={'md'} h={'100%'} >
          <Dropzone.Accept>
            <IconUpload size={50} stroke={1.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={50} stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto size={50} stroke={1.5} color='var(--mantine-color-dimmed)' />
          </Dropzone.Idle>
          <div>
            <Text size="md" inline>
              {t('NewCatchPage.AddPictureInfo')}
            </Text>
            <Text size="sm" c="var(--mantine-color-dimmed)" inline mt={7}>
            {t('NewCatchPage.AddPictureInfo2')}
            </Text>
          </div>
        </Group>
      </Dropzone>

      {(newImages.length > 0 || existingImages.length > 0) && (
        <Box mt={'md'}>
          <Text fw={500} mb={4}>{`${t('NewCatchPage.Pictures')} (${[...existingImages, ...newImages].length})`}</Text>
          <Carousel
            height={110}
            slideSize={150}
            slideGap={'xs'}
            align={'start'}
            dragFree
            withControls={!isSmallScreen}
            containScroll={'trimSnaps'}
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
                    onClick={() => setFullscreenImage(img.url)}
                    style={{ cursor: 'pointer' }}
                  />
                  {setDeletedImages && <ActionIcon
                    size="sm"
                    variant="light"
                    pos="absolute"
                    top={5}
                    right={5}
                    bg="rgba(0, 0, 0, 0.75)"
                    onClick={() => handleDeleteExistingImage(index)}
                  >
                    <IconTrash size={16} color="white" />
                  </ActionIcon>}
                  {/* <ActionIcon
                    size="sm"
                    variant="light"
                    pos="absolute"
                    bottom={5}
                    right={5}
                    bg="rgba(0, 0, 0, 0.75)"
                    onClick={() => setFullscreenImage(url)}
                  >
                    <IconMaximize size={16} color="white" />
                  </ActionIcon> */}
                </Box>
              </Carousel.Slide>
            ))}

            {/* Render new images */}
            {newImages.map((url, index) => (
              <Carousel.Slide key={`new-${index}`}>
                <Box pos="relative" w={150} h={110}>
                  <Image 
                    src={url} 
                    fallbackSrc="/no-image-placeholder.png"
                    alt={`New Image ${index}`} 
                    fit="cover" 
                    radius="md" 
                    w="100%" 
                    h="100%" 
                    onClick={() => setFullscreenImage(url)}
                    style={{ cursor: 'pointer' }}
                  />
                  <ActionIcon
                    size="sm"
                    variant="light"
                    pos="absolute"
                    top={5}
                    right={5}
                    bg="rgba(0, 0, 0, 0.75)"
                    onClick={() => handleDeleteNewImage(index)}
                  >
                    <IconTrash size={16} color="white" />
                  </ActionIcon>
                  {/* <ActionIcon
                    size="sm"
                    variant="light"
                    pos="absolute"
                    bottom={5}
                    right={5}
                    bg="rgba(0, 0, 0, 0.75)"
                    onClick={() => setFullscreenImage(url)}
                  >
                    <IconMaximize size={16} color="white" />
                  </ActionIcon> */}
                </Box>
              </Carousel.Slide>
            ))}
          </Carousel>
        </Box>
      )}
    </Stack>
  );
}