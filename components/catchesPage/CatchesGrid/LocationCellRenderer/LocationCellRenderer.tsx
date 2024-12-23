import { ICatch } from '@/lib/types/catch';
import { ActionIcon } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';

export const LocationCellRenderer = ({ value }: { value: ICatch['location'] }) => {
  const { spot, coordinates } = value;

  const spotDisplayValue = spot ? spot.charAt(0).toUpperCase() + spot.slice(1) : '-';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between'}}>
      <span>{spotDisplayValue}</span>
      {coordinates && (
        <a
          href={`https://www.google.com/maps?q=${coordinates}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ActionIcon variant="light" aria-label="Show on map" color="var(--mantine-color-blue-4)" size={20}>
            <IconMapPin style={{ width: '70%', height: '70%' }} stroke={2} />
          </ActionIcon>
        </a>
      )}
    </div>
  );
};
