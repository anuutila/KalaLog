import LeaderboardBarChart from "@/components/charts/LeaderboardBarChart/LeaderboardBarChart";
import { ICatch } from "@/lib/types/catch";
import { JwtUserInfo } from "@/lib/types/jwtUserInfo";
import { Paper, Stack, Title } from "@mantine/core";
import { useTranslations } from "next-intl";

interface LeaderboardsTabProps {
  catches: ICatch[];
  userInfo: JwtUserInfo | null;
  userDisplayNameMap: { [userId: string]: string };
}

export default function LeaderboardsTab({ catches, userInfo, userDisplayNameMap }: LeaderboardsTabProps) {
  const t = useTranslations();

  return (
    <Stack gap="md" p={'md'} h={'max(100%, 550px)'}>
      <Paper p={'md'} pr={10} w={'100%'} h={'100%'} radius={'lg'} bg={"var(--my-ui-item-background-color)"}>
          <Stack p={0} gap={'md'} h={'100%'}> 
            <Title order={3} c={'white'}>{t('StatisticsPage.TopAnglers')}</Title>
            <Paper flex={1} bg={'transparent'}>
              <LeaderboardBarChart 
                catches={catches} 
                userInfo={userInfo} 
                userDisplayNameMap={userDisplayNameMap}
              />
            </Paper>
          </Stack>
        </Paper>
    </Stack>
  );
}