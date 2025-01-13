import { ICatch } from '@/lib/types/catch';
import { ActionIcon, Group } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { CustomCellRendererProps } from 'ag-grid-react';

export const LocationCellRenderer = (params:  CustomCellRendererProps & { locationIconsEnabled?: boolean }) => {
  const location = params.data.location;
  const { spot, coordinates } = location;
  const locationIconsEnabled = params.locationIconsEnabled;

  const spotDisplayValue = spot ? spot.charAt(0).toUpperCase() + spot.slice(1) : '-';

  return (
    <Group align="center" gap={8} wrap="nowrap" justify="space-between" w={'100%'} maw={175}>
      <span>{spotDisplayValue}</span>
      {coordinates && locationIconsEnabled && 
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
            size={14}
          >
            <IconMapPin style={{ width: '100%', height: '100%' }} stroke={2} />
          </ActionIcon>
        // </a>
      }
    </Group>
  );
};
