import { IconX } from '@tabler/icons-react';
import { ActionIcon, Center, Image, Overlay } from '@mantine/core';

interface FullscreenImageProps {
  src: string;
  onClose: () => void;
}

export default function FullscreenImage({ src, onClose }: FullscreenImageProps) {
  return (
    <Overlay
      backgroundOpacity={0.9}
      blur={15}
      color="black"
      fixed
      top="var(--app-shell-header-offset)"
      bottom={{ base: 'calc(var(--app-shell-footer-offset) + env(safe-area-inset-bottom))', md: 0 }}
    >
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
