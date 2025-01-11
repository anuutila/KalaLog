import { upperCaseFormatter } from "@/lib/utils/agGridUtils";
import { ActionIcon, Group } from "@mantine/core";
import { IconCamera } from "@tabler/icons-react";
import { CustomCellRendererProps } from "ag-grid-react";

export const speciesCellRenderer = (params:  CustomCellRendererProps) => {
  const hasImages = params.data?.images?.length > 0; // Check if the catch has images
  const speciesName = upperCaseFormatter(params as any); // Reuse the formatter for the species name

  return (
    <Group align="center" gap={8} wrap="nowrap" justify="space-between" w={'100%'} maw={90}>
      <span>{speciesName}</span>
      {hasImages &&
        <ActionIcon variant="subtle" aria-label="Show on map" color="var(--mantine-color-blue-4)" size={14}>
          <IconCamera style={{ width: '100%', height: '100%' }} stroke={2} />
        </ActionIcon>}
    </Group>
  );
};
