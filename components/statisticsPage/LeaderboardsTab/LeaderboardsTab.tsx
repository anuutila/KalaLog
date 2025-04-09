import { Container, Paper, Stack, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";

export default function LeaderboardsTab() {
  const t = useTranslations();

  return (
    <Stack gap="md">
      <Paper p={'md'} bg={"var(--my-fieldset-background-color)"}>
        <Stack gap={'md'}>
          <Title order={3}>Coming Soon...</Title>
        </Stack>
      </Paper>
    </Stack>
  );
}