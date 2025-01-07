import { Overlay, Center, Image, ActionIcon } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

interface FullscreenImageProps {
  src: string;
  onClose: () => void;
}

export default function FullscreenImage({ src, onClose }: FullscreenImageProps) {
  return (
    <Overlay backgroundOpacity={0.9} blur={15} color="black" >
      <Center h="100%" w="100%">
        <Image src={src} fit="contain" style={{ borderRadius: '10px' }} />
      </Center>
      <ActionIcon
        size="lg"
        variant="light"
        pos="absolute"
        top={20}
        right={20}
        bg="rgba(0, 0, 0, 0.7)"
        onClick={onClose}
      >
        <IconX size={24} color="white" />
      </ActionIcon>
    </Overlay>
  );
}
