import { upperCaseFormatter } from "@/lib/utils/agGridUtils";
import { ActionIcon, Group } from "@mantine/core";
import { IconCamera } from "@tabler/icons-react";
import { CustomCellRendererProps } from "ag-grid-react";
import { useTranslations } from "next-intl";

export const speciesCellRenderer = (params:  CustomCellRendererProps & { imageIconsEnabled?: boolean }) => {
  const t = useTranslations('Fish');
  const hasImages = params.data?.images?.length > 0; // Check if the catch has images
  const speciesName = upperCaseFormatter(params as any); // Reuse the formatter for the species name
  const imageIconsEnabled = params.imageIconsEnabled;

  return (
    <Group align="center" gap={8} wrap="nowrap" justify="space-between" w={'100%'} maw={90}>
      <span>{t.has(speciesName) ? t(speciesName) : speciesName}</span>
      {hasImages && imageIconsEnabled &&
        <ActionIcon variant="subtle" aria-label="Has an image" color="var(--mantine-color-blue-4)" size={14}>
          <IconCamera style={{ width: '100%', height: '100%' }} stroke={2} />
        </ActionIcon>}
    </Group>
  );
};
