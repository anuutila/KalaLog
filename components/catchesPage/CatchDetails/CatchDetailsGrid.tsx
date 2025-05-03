import {
  IconCalendar,
  IconClock,
  IconFish,
  IconFishHook,
  IconMapPin,
  IconMapPin2,
  IconMessage,
  IconRipple,
  IconRuler2,
  IconUser,
  IconWeight,
} from '@tabler/icons-react';
import { ActionIcon, Box, Fieldset, Grid, Group, Stack, Text } from '@mantine/core';
import { CatchDetails } from './CatchDetails';
import classes from './CatchDetails.module.css';
import Link from 'next/link';

interface CatchDetailsGridProps {
  details: CatchDetails;
  coordinates?: string | null;
}

const formatDate = (date: string): string => {
  const dateParts = date.split('-');
  if (dateParts.length === 3) {
    // remove leading zeros
    dateParts[2] = dateParts[2].replace(/^0+/, '');
    dateParts[1] = dateParts[1].replace(/^0+/, '');
    return `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`; // Rearrange to "dd.mm.yyyy"
  }
  return date;
};

export default function CatchDetailsGrid({ details, coordinates }: CatchDetailsGridProps) {
  return (
    <Stack gap="sm">
      <Fieldset variant="default" m={0} p="sm" className={classes.catch_details_fieldset}>
        <Grid>
          <Grid.Col span={6}>
            <Group gap="xs" align="center">
              <IconFish size={20} color="var(--mantine-primary-color-5)" />
              <Text size="md" fw={500}>
                {details.species.label}
              </Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text fw={500}>{details.species.data}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Group gap="xs" align="center">
              <IconRuler2 size={20} color="var(--mantine-primary-color-5)" />
              <Text size="md" fw={500}>
                {details.length.label}
              </Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text fw={500}>{details.length.data ? `${details.length.data} cm` : '-'}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Group gap="xs" align="center">
              <IconWeight size={20} color="var(--mantine-primary-color-5)" />
              <Text size="md" fw={500}>
                {details.weight.label}
              </Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text fw={500}>{details.weight.data ? `${details.weight.data} kg` : '-'}</Text>
          </Grid.Col>
        </Grid>
      </Fieldset>

      <Fieldset variant="default" m={0} className={classes.catch_details_fieldset}>
        <Grid>
          <Grid.Col span={6}>
            <Group gap="xs" align="center">
              <IconCalendar size={20} color="var(--mantine-primary-color-5)" />
              <Text size="md" fw={500}>
                {details.date.label}
              </Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text fw={500}>{formatDate(details.date.data)}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Group gap="xs" align="center">
              <IconClock size={20} color="var(--mantine-primary-color-5)" />
              <Text size="md" fw={500}>
                {details.time.label}
              </Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text fw={500}>{details.time.data}</Text>
          </Grid.Col>
        </Grid>
      </Fieldset>

      <Fieldset variant="default" m={0} className={classes.catch_details_fieldset}>
        <Grid>
          <Grid.Col span={6}>
            <Group gap="xs" align="center">
              <IconRipple size={20} color="var(--mantine-primary-color-5)" />
              <Text size="md" fw={500}>
                {details.bodyOfWater.label}
              </Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text fw={500}>{details.bodyOfWater.data}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Group gap="xs" align="center">
              <IconMapPin2 size={20} color="var(--mantine-primary-color-5)" />
              <Text size="md" fw={500}>
                {details.spot.label}
              </Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Group wrap="nowrap" justify="space-between" h="100%" align="center" gap={8}>
              <Text fw={500}>{details.spot.data ?? '-'}</Text>
              {details.coordinates.data && (
                <Box pos="relative" h="100%" w={35}>
                  <Link
                    href={{
                      pathname: '/statistics',
                      hash: 'map',
                      query: { 
                        lat: coordinates?.split(',')[0].trim(), 
                        lng: coordinates?.split(',')[1].trim(), 
                        zoom: 15,
                        catchNumber: details.catchNumber
                      },
                    }}
                    passHref
                    style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}
                  >
                    <ActionIcon
                      h="100%"
                      variant="light"
                      aria-label="Show on map"
                      color="var(--mantine-color-blue-4)"
                      size="lg"
                    >
                      <IconMapPin style={{ width: '70%', height: '70%' }} stroke={2} />
                    </ActionIcon>
                  </Link>
                </Box>
              )}
            </Group>
          </Grid.Col>
        </Grid>
      </Fieldset>

      {details.lure.data && (
        <Fieldset variant="default" m={0} className={classes.catch_details_fieldset}>
          <Grid>
            <Grid.Col span={6}>
              <Group gap="xs" align="center">
                <IconFishHook size={20} color="var(--mantine-primary-color-5)" />
                <Text size="md" fw={500}>
                  {details.lure.label}
                </Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text fw={500}>{details.lure.data ?? '-'}</Text>
            </Grid.Col>
          </Grid>
        </Fieldset>
      )}

      <Fieldset variant="default" m={0} className={classes.catch_details_fieldset}>
        <Grid>
          <Grid.Col span={6}>
            <Group gap="xs" align="center">
              <IconUser size={20} color="var(--mantine-primary-color-5)" />
              <Text size="md" fw={500}>
                {details.caughtBy.label}
              </Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text fw={500}>{details.caughtBy.data}</Text>
          </Grid.Col>
        </Grid>
      </Fieldset>

      {details.comment.data && (
        <Fieldset variant="default" m={0} className={classes.catch_details_fieldset}>
          <Group gap="xs" wrap="nowrap" align="top">
            <Box h={20} w={20} pt={2}>
              <IconMessage size={20} color="var(--mantine-primary-color-5)" />
            </Box>
            <Text fs="italic" fw={500}>{`${details.comment.data}`}</Text>
          </Group>
        </Fieldset>
      )}
    </Stack>
  );
}
