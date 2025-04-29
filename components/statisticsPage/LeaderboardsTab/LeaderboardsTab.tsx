import LeaderboardBarChart from "@/components/charts/LeaderboardBarChart/LeaderboardBarChart";
import { ICatch } from "@/lib/types/catch";
import { JwtUserInfo } from "@/lib/types/jwtUserInfo";
import { IPublicUserProfile } from "@/lib/types/user";
import { Paper, Stack, Title } from "@mantine/core";
import { useTranslations } from "next-intl";

interface LeaderboardsTabProps {
  catches: ICatch[];
  userInfo: JwtUserInfo | null;
  userDisplayNameMap: { [userId: string]: string };
  allUserInfos: IPublicUserProfile[];
}

export default function LeaderboardsTab({ catches, userInfo, userDisplayNameMap, allUserInfos }: LeaderboardsTabProps) {
  const t = useTranslations();

  return (
    <Stack gap="md" p={'md'} h={'100%'} mih={550} mah={800}>
      <Paper p={'md'} pr={10} w={'100%'} h={'100%'} radius={'lg'} bg={"var(--my-ui-item-background-color)"}>
          <Stack p={0} gap={'md'} h={'100%'}> 
            <Title order={3} c={'white'}>{t('StatisticsPage.TopAnglers')}</Title>
            <Paper flex={1} bg={'transparent'}>
              <LeaderboardBarChart 
                catches={catches} 
                userInfo={userInfo} 
                userDisplayNameMap={userDisplayNameMap}
                allUserInfos={allUserInfos}
              />
            </Paper>
          </Stack>
        </Paper>
    </Stack>
  );
}