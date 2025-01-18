import { ActionIcon, Box, Fieldset, Grid, Group, Stack, Text } from '@mantine/core';
import { IconCalendar, IconClock, IconFish, IconFishHook, IconMapPin, IconMapPin2, IconRipple, IconRuler2, IconUser, IconWeight } from '@tabler/icons-react';
import { CatchDetails } from './CatchDetails';

interface CatchDetailsGridProps {
  details: CatchDetails;
  coordinates?: string | null;
}

const unitsMap: Record<string, string> = {
  Paino: ' kg',
  Pituus: ' cm',
};

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
  const renderField = (label: string, value: string | number | null) => {
    const formattedValue =
      label === 'Päivämäärä' && typeof value === 'string' ? formatDate(value) : value;

    const unit = unitsMap[label] || '';

    return (
      <Grid.Col span={6} key={label}>
        <Group wrap='nowrap' align='center'>
          <Stack gap={0}>
            <Text size="md" fw={500}>
              {label}
            </Text>
            <Text size="md">
              {formattedValue !== null && formattedValue !== undefined && formattedValue !== ''
                ? `${formattedValue}${unit}`
                : '-'}
            </Text>
          </Stack>
          {coordinates && label === 'Paikka' && (
            <a
              href={`https://www.google.com/maps?q=${coordinates}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ActionIcon variant="light" aria-label="Show on map" color="var(--mantine-color-blue-4)" size={'lg'}>
                <IconMapPin style={{ width: '70%', height: '70%' }} stroke={2} />
              </ActionIcon>
            </a>
          )}
        </Group>
      </Grid.Col>
    );
  };

  return (
    // <Grid gutter="sm">
    //   {Object.entries(details).map(([label, value]) => renderField(label, value))}
    // </Grid>
    <Stack gap="sm">

      <Fieldset variant='default' legend="Laji ja mitat" m={0}>
        <Grid>
          <Grid.Col span={6}>
            <Group gap={'xs'} align='center'>
              <IconFish size={20} />
              <Text size='md' fw={500}>{details.species.label}</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text>{details.species.data}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Group gap={'xs'} align='center'>
              <IconRuler2 size={20} />
              <Text size='md' fw={500}>{details.length.label}</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text>{details.length.data ? `${details.length.data} cm` : '-'}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Group gap={'xs'} align='center'>
              <IconWeight size={20} />
              <Text size='md' fw={500}>{details.weight.label}</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text>{details.weight.data ? `${details.weight.data} kg` : '-'}</Text>
          </Grid.Col>
        </Grid>
      </Fieldset>

      <Fieldset variant='default' legend="Päivä ja aika" m={0}>
        <Grid>
          <Grid.Col span={6}>
            <Group gap={'xs'} align='center'>
              <IconCalendar size={20} />
              <Text size='md' fw={500}>{details.date.label}</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text>{formatDate(details.date.data)}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Group gap={'xs'} align='center'>
              <IconClock size={20} />
              <Text size='md' fw={500}>{details.time.label}</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text>{details.time.data}</Text>
          </Grid.Col>
        </Grid>
      </Fieldset>

      <Fieldset variant='default' legend="Sijaintitiedot" m={0}>
        <Grid>
          <Grid.Col span={6}>
            <Group gap={'xs'} align='center'>
              <IconRipple size={20} />
              <Text size='md' fw={500}>{details.bodyOfWater.label}</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text>{details.bodyOfWater.data}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Group gap={'xs'} align='center'>
              <IconMapPin2 size={20} />
              <Text size='md' fw={500}>{details.spot.label}</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Group wrap='nowrap' justify='space-between' h={'100%'} align='center' gap={8}>
              <Text>{details.spot.data ?? '-'}</Text>
              {details.coordinates.data && (
                <Box pos={'relative'} h={'100%'} w={35}>
                  <a
                    href={`https://www.google.com/maps?q=${coordinates}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}
                  >
                    <ActionIcon h={'100%'} variant="light" aria-label="Show on map" color="var(--mantine-color-blue-4)" size={'lg'}>
                      <IconMapPin style={{ width: '70%', height: '70%' }} stroke={2} />
                    </ActionIcon>
                  </a>
                </Box>
              )}
            </Group>
          </Grid.Col>
        </Grid>
      </Fieldset>

      <Fieldset variant='default' legend="Kalastusvälineet" m={0}>
        <Grid>
          <Grid.Col span={6}>
            <Group gap={'xs'} align='center'>
              <IconFishHook size={20} />
              <Text size='md' fw={500}>{details.lure.label}</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text>{details.lure.data ?? '-'}</Text>
          </Grid.Col>
        </Grid>
      </Fieldset>

      <Fieldset variant='default' legend="Kalastaja" m={0}>
        <Grid>
          <Grid.Col span={6}>
            <Group gap={'xs'} align='center'>
              <IconUser size={20} />
              <Text size='md' fw={500}>{details.caughtBy.label}</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text>{details.caughtBy.data}</Text>
          </Grid.Col>
        </Grid>
      </Fieldset>
      
    </Stack>
  );
}
