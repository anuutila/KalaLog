import { ActionIcon, Grid, Group, Stack, Text } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';

interface CatchDetailsGridProps {
  details: Record<string, string | number | null> | {};
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
    <Grid gutter="sm">
      {Object.entries(details).map(([label, value]) => renderField(label, value))}
    </Grid>
  );
}
