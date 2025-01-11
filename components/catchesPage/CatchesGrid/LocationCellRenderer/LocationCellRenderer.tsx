import { ICatch } from '@/lib/types/catch';
import { ActionIcon, Group } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';

export const LocationCellRenderer = (params: { data: ICatch }) => {
  const location = params.data.location;
  const { spot, coordinates } = location;

  const spotDisplayValue = spot ? spot.charAt(0).toUpperCase() + spot.slice(1) : '-';

  return (
    <Group align="center" gap={8} wrap="nowrap" justify="space-between" w={'100%'} maw={175} onClick={(e) => e.stopPropagation()}>
      <span>{spotDisplayValue}</span>
      {coordinates && (
        // Couldn't stop propagation of click event, so disabled it
        // <a
        //   href={`https://www.google.com/maps?q=${coordinates}`}
        //   target="_blank"
        //   rel="noopener noreferrer"
        //   onClick={(e) => {
        //     e.stopPropagation();
        //     e.preventDefault(); 
        //   }}
          
        // >
          <ActionIcon 
            variant="subtle" 
            aria-label="Show on map" 
            color="var(--mantine-color-blue-4)" 
            size={20}
            onClick={(e) => e.stopPropagation()}
          >
            <IconMapPin style={{ width: '70%', height: '70%' }} stroke={2} />
          </ActionIcon>
        // </a>
      )}
    </Group>
  );
};
