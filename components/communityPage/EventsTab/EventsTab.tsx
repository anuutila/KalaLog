import { Paper, Stack, Title } from "@mantine/core";

interface EventsTabProps {
}

export default function EventsTab({ }: EventsTabProps) {
  return (
    <Stack gap={'md'} p={'md'}>
      <Paper p={'md'} radius={'lg'} bg={"var(--my-fieldset-background-color)"}>
        <Title order={3}>Events Coming Soon...</Title>
      </Paper>
    </Stack>
  );
}

