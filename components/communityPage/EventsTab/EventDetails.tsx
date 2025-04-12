import { IEvent } from "@/lib/types/event";
import { ActionIcon, Container, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

interface EventDetailsProps {
  event: IEvent | null;
  onCloseAction: () => void;
}

export default function EventDetails({ event, onCloseAction }: EventDetailsProps) {
  return (
    <Paper
      pos="fixed"
      top="calc(var(--app-shell-header-offset)*2)"
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
    >
      <Container p={0} size="sm">
        <Stack p={0}>
          <Group mb={4}>
            <Title order={2} mr="auto" pl={4}>Event Details</Title>
            <Group gap="xs" align="center">
              {/* Close Button */}
              <ActionIcon
                size="lg"
                variant="light"
                color="gray"
                onClick={onCloseAction}
              >
                <IconX size={20} />
              </ActionIcon>
            </Group>
          </Group>
          <Paper radius={'lg'} bg={"var(--my-fieldset-background-color)"} p={'md'} shadow="md">
            <Text fz={'md'}>Event Details Coming Soon...</Text>
          </Paper>
        </Stack>
      </Container>
    </Paper>
  );
}