import { Carousel } from '@mantine/carousel';
import { Image, Box, ActionIcon } from '@mantine/core';
import { IconMaximize } from '@tabler/icons-react';
import classes from './CatchDetails.module.css';

interface CatchImageCarouselProps {
  images: string[];
  isFallbackImage: boolean;
  onFullscreen: (src: string) => void;
}

export default function CatchImageCarousel({
  images,
  isFallbackImage,
  onFullscreen,
}: CatchImageCarouselProps) {
  return (
    <Carousel 
      withIndicators={images.length > 1} 
      withControls={images.length > 1}
      loop={images.length > 1} 
      classNames={{ viewport: classes.viewport, controls: classes.controls, control: classes.control }}
    >
      {images.map((src, index) => (
        <Carousel.Slide key={index}>
          <Box pos="relative" w="100%" h="300px" bg="#f4f4f4">
            <Image 
              src={src} 
              fit="cover" 
              height={300} 
              fallbackSrc='/no-image-placeholder.png'
              style={{
                backgroundColor: 'var(--mantine-color-dark-7)',
              }}
            />
            {!isFallbackImage && (
              <ActionIcon
                size="lg"
                variant="light"
                pos={'absolute'}
                bottom={10}
                right={10}
                bg={'rgba(0, 0, 0, 0.5)'}
                onClick={() => onFullscreen(src)}
              >
                <IconMaximize size={20} color="white" />
              </ActionIcon>
            )}
          </Box>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
