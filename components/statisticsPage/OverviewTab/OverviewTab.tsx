import SpeciesDonutChart from "@/components/charts/SpeciesDonutChart/SpeciesDonutChart";
import { useGlobalState } from "@/context/GlobalState";
import { Paper, Stack, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";

export default function OverviewTab() {
  const t = useTranslations();
  const { catches } = useGlobalState();

  return (
      <Stack gap="md">
        <Paper p={'md'} bg={"var(--my-fieldset-background-color)"}>
          <Stack gap={'0'}>
            <Title order={3} c={'white'}>{t('StatisticsPage.TotalCatches')}</Title>
            <Text fz={32} fw={'bold'} c={'white'}>{catches.length ? catches.length : 0}</Text>
          </Stack>
        </Paper>
        <Paper p={'md'} w={'100%'} bg={"var(--my-fieldset-background-color)"}>
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