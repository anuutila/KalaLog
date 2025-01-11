import { ForwardedRef, use, useEffect, useImperativeHandle, useState } from "react";
import { ICatch } from "@/lib/types/catch";
import { Box, Group, Image, SimpleGrid, Text } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import classes from './ImageUploadForm.module.css';

export interface ImageUploadFormRef {
  clearImages: () => void;
}

interface ImageUploadFormProps {
  catchData?: ICatch | null;
  setFullscreenImage: (src: string) => void;
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  ref?: ForwardedRef<ImageUploadFormRef>;
}

export default function ImageUploadForm({ catchData, setFullscreenImage, setFiles, ref }: ImageUploadFormProps) {
  const [existingImages, setExistingImages] = useState<string[]>([]); // Existing images from the catch
  const [previews, setPreviews] = useState<string[]>([]); // Previews for newly uploaded images

  useEffect(() => {
    if (catchData) {
      setExistingImages(catchData.images?.map(img => img.url) ?? []);
    }
  }, [catchData]);

  const handleDrop = (acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    const newPreviews = acceptedFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  useImperativeHandle(ref, () => ({
    clearImages: () => {
      setPreviews([]);
      setFiles([]);
    },
  }));

  return (
    <>
      <Dropzone
        onDrop={handleDrop}
        accept={IMAGE_MIME_TYPE}
        maxSize={10 * 1024 ** 2}
        maxFiles={10}
        classNames={{ root: classes.dropzone }}
      >
        <Group justify='center' wrap='nowrap' gap="md" style={{ pointerEvents: 'none' }} p={'md'} >
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
              Lisää kuvia
            </Text>
            <Text size="sm" c="var(--mantine-color-dimmed)" inline mt={7}>
              Kuvan maksimikoko 10Mt
            </Text>
          </div>
        </Group>
      </Dropzone>
      <Box hidden={previews.length === 0 && existingImages.length === 0}
        mt={previews.length > 0 || existingImages.length > 0 ? 'xs' : 0}
        mb={previews.length > 0 || existingImages.length > 0 ? 'md' : 0}
      >
        <Text size="md" fw={500} mb={'xs'}>
          Kuvat
        </Text>
        <SimpleGrid cols={{ base: 4 }} title='Images'>
          {/* Render existing images */}
          {existingImages.map((url, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <Image src={url} alt="Existing image" fit='cover' h={50} radius={'sm'} onClick={() => setFullscreenImage(url)} />
              {/* <ActionIcon
                        size="lg"
                        color="red"
                        style={{ position: 'absolute', top: 5, right: 5 }}
                        onClick={() => handleDeleteExistingImage(image.id)}
                      >
                        <IconX size={18} />
                      </ActionIcon> */}
            </div>
          ))}
          {/* Render previews for newly uploaded images */}
          {previews.map((url, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <Image src={url} alt="New image preview" fit='cover' h={50} radius={'sm'} onClick={() => setFullscreenImage(url)} />
              {/* <ActionIcon
                        size="lg"
                        color="red"
                        style={{ position: 'absolute', top: 5, right: 5 }}
                        onClick={() => handleDeleteNewImage(index)}
                      >
                        <IconX size={18} />
                      </ActionIcon> */}
            </div>
          ))}
        </SimpleGrid>
      </Box>
    </>
  );
}