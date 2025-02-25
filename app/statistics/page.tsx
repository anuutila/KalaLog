'use client';

import { IconChartBar } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { Center, Container, Text } from '@mantine/core';

export default function Page() {
  const t = useTranslations();
  return (
    <Container size="sm" p="md" pt="xl">
      <Center>
        <IconChartBar />
        <Text ml="sm">{t('StaticsPage.WIP')}</Text>
      </Center>
    </Container>
  );
}
