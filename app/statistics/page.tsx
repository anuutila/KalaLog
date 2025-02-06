'use client';

import { Center, Container, Text } from "@mantine/core";
import { IconChartBar } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations();
  return (
    <Container size={'sm'} p={'md'} pt={'xl'}>
      <Center>
        <IconChartBar />
        <Text ml={'sm'}>{t('StaticsPage.WIP')}</Text>
      </Center>
    </Container>
  );
}
