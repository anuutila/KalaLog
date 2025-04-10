import SpeciesDonutChart from "@/components/charts/SpeciesDonutChart/SpeciesDonutChart";
import { ICatch } from "@/lib/types/catch";
import { Paper, Stack, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";

interface OverviewTabProps {
  catches: ICatch[];
}

export default function OverviewTab({ catches }: OverviewTabProps) {
  const t = useTranslations();

  return (
      <Stack gap="md" p={'md'}>
        <Paper p={'md'} radius={'lg'} bg={"var(--my-fieldset-background-color)"}>
          <Stack gap={'0'}>
            <Title order={3} c={'white'}>{t('StatisticsPage.TotalCatches')}</Title>
            <Text fz={32} fw={'bold'} c={'white'}>{catches.length ? catches.length : 0}</Text>
          </Stack>
        </Paper>
        <Paper p={'md'} w={'100%'} radius={'lg'} bg={"var(--my-fieldset-background-color)"}>
          <Stack p={0} gap={0}> 
            <Title order={3} c={'white'}>{t('StatisticsPage.SpeciesDistribution')}</Title>
            <Paper flex={1} bg={'transparent'}>
              <SpeciesDonutChart catches={catches} />
            </Paper>
          </Stack>
        </Paper>
      </Stack>
  );
}