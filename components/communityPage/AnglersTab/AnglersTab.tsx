import { CommunityPageUserInfo } from "@/app/community/page";
import LevelIcon from "@/components/LevelIcon/LevelIcon";
import { Avatar, Group, Paper, Skeleton, Stack, Text } from "@mantine/core";

interface AnglersTabProps {
  userInfos: CommunityPageUserInfo[];
  loadingUsers: boolean;
}

export default function AnglersTab({ userInfos, loadingUsers }: AnglersTabProps) {
  return (
    <Stack gap="sm" p={'md'}>
      {loadingUsers
        ? Array.from({ length: 10 }).map((_, index) => <Skeleton key={index} height={84} radius="lg" />)
        : userInfos.map((user) => (
          <Paper p={'sm'} pr={4} radius={'lg'} bg={"var(--my-fieldset-background-color)"} key={user.id}>
            <Group pos={'relative'}>
              <Avatar
                radius="100%"
                size={50}
                name={`${user.firstName} ${user.lastName ?? ''}`}
                color="initials"
              />
              <Text mr={'auto'} fz={22} fw={500} c={'white'}>{user.firstName} {user.lastName}</Text>
              <LevelIcon level={user.level ?? 1} numberSize={40} iconRosetteFilledSize={50} iconRosetteSize={60} size={60}/>
            </Group>
          </Paper>
        ))}
    </Stack>
  );
}

