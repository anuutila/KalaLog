import { Carousel, Embla } from '@mantine/carousel';
import { Image, Box, ActionIcon, Text } from '@mantine/core';
import { IconMaximize } from '@tabler/icons-react';
import classes from './CatchDetails.module.css';
import { useCallback, useEffect, useState } from 'react';

interface CatchImageCarouselProps {
  images: string[];
  isFallbackImage: boolean;
  setFullscreen: (src: string) => void;
}

export default function CatchImageCarousel({
  images,
  isFallbackImage,
  setFullscreen,
}: CatchImageCarouselProps) {
  const [embla, setEmbla] = useState<Embla | null>(null); // Embla API instance
  const [activeIndex, setActiveIndex] = useState(0); // Track active image index

  const handleSelect = useCallback(() => {
    if (!embla) return;
    setActiveIndex(embla.selectedScrollSnap()); // Get the currently active slide index
  }, [embla]);

  useEffect(() => {
    if (embla) {
      embla.on('select', handleSelect); // Listen for slide change
      handleSelect(); // Set the initial index
    }
  }, [embla, handleSelect]);

  return (
    <Box pos={'relative'}>
      <Carousel
        withIndicators={images.length > 1}
        withControls={images.length > 1}
        loop={images.length > 1}
        classNames={{
          viewport: classes.viewport,
          controls: classes.controls,
          control: classes.control,
        }}
        getEmblaApi={setEmbla} // Get the Embla API instance
        pos={'relative'}
      >
        {images.length > 0
          ? images.map((src, index) => (
            <Carousel.Slide key={index}>
              <Box pos="relative" w="100%" h={{ base: 300, md: 500 }} bg="#f4f4f4">
                <Image
                  src={src}
                  fit="cover"
                  h={{ base: 300, md: 500 }}
                  fallbackSrc="/no-image-placeholder.png"
                  style={{
                    backgroundColor: 'var(--mantine-color-dark-7)',
                  }}
                />
              </Box>
            </Carousel.Slide>
          ))
          : <Carousel.Slide>
            <Box pos="relative" w="100%" h={{ base: 300, md: 500 }} bg="#f4f4f4">
              <Image
                src="/no-image-placeholder.png"
                fit="cover"
                h={{ base: 300, md: 500 }}
                fallbackSrc="/no-image-placeholder.png"
                style={{
                  backgroundColor: 'var(--mantine-color-dark-7)',
                }}
              />
            </Box>
          </Carousel.Slide>}
      </Carousel>
      {!isFallbackImage && (
        <ActionIcon
          pos={'absolute'}
          bottom={10}
          right={10}
          size="lg"
          variant="light"
          bg="rgba(0, 0, 0, 0.5)"
          onClick={() => setFullscreen(images[activeIndex])}
        >
          <IconMaximize size={20} color="white" />
        </ActionIcon>
      )}
    </Box>
  );
}
