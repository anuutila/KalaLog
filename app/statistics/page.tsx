'use client';

import { Center, Container, Text } from "@mantine/core";
import { IconChartBar } from "@tabler/icons-react";

export default function Page() {
  return (
    <Container size={'sm'} p={'md'} pt={'xl'}>
      <Center>
        <IconChartBar />
        <Text ml={'sm'}>Tilastot vielä työn alla...</Text>
      </Center>
    </Container>
  );
}
