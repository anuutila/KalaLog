import { Grid, Text } from '@mantine/core';

interface CatchDetailsGridProps {
  details: Record<string, string | number | null> | {};
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

export default function CatchDetailsGrid({ details }: CatchDetailsGridProps) {
  const renderField = (label: string, value: string | number | null) => {
    const formattedValue =
      label === 'Päivämäärä' && typeof value === 'string' ? formatDate(value) : value;

    const unit = unitsMap[label] || '';

    return (
      <Grid.Col span={6} key={label}>
        <Text size="md" fw={500}>
          {label}
        </Text>
        <Text size="md">
          {formattedValue !== null && formattedValue !== undefined && formattedValue !== ''
            ? `${formattedValue}${unit}`
            : '-'}
        </Text>
      </Grid.Col>
    );
  };

  return (
    <Grid gutter="sm">
      {Object.entries(details).map(([label, value]) => renderField(label, value))}
    </Grid>
  );
}
