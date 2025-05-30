import { useEffect, useState } from 'react';
import { IconFish, IconTrophy } from '@tabler/icons-react';
import { Box, Button, Container, Divider, Group, Stack, Text } from '@mantine/core';
import { useGlobalState } from '@/context/GlobalState';
import { useLoadingOverlay } from '@/context/LoadingOverlayContext';
import { ApiEndpoints } from '@/lib/constants/constants';
import { showNotification } from '@/lib/notifications/notifications';
import { UserCatchesLinkedResponse } from '@/lib/types/responses';
import { allRoles, IUser, UserRole } from '@/lib/types/user';
import { recalculateUserAchievements } from '@/lib/utils/achievementUtils';
import { handleApiError } from '@/lib/utils/handleApiError';
import { linkUserCatches } from '@/services/api/userService';
import RoleIndicator from './RoleIndicator';
import { useTranslations } from 'next-intl';

const rolesWithoutAdmins = Object.values(
  allRoles.filter((role) => role !== UserRole.ADMIN && role !== UserRole.SUPERADMIN)
).reverse();
const rolesWithoutSuperAdmin = Object.values(allRoles.filter((role) => role !== UserRole.SUPERADMIN)).reverse();

export default function AdminPanel() {
  const t = useTranslations();
  const { catches, jwtUserInfo } = useGlobalState();
  const [users, setUsers] = useState<IUser[]>([]);
  const { showLoading, hideLoading } = useLoadingOverlay();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        showLoading();
        const response = await fetch(ApiEndpoints.AdminPanelData);
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        } else {
          showNotification('error', 'Failed to fetch users', t, { withTitle: true });
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        showNotification('error', 'An unexpected error occurred', t, { withTitle: true });
      } finally {
        hideLoading();
      }
    };

    fetchUsers();
  }, []);

  const handleToggle = async (userId: string, newRole: UserRole) => {
    try {
      showLoading();

      // const newRole = currentRole === UserRole.EDITOR ? UserRole.VIEWER : UserRole.EDITOR;
      const response = await fetch('/api/users/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers((prev) => prev.map((user) => (user.id === updatedUser.data.id ? updatedUser.data : user)));
        showNotification('success', 'User role updated successfully', t, { withTitle: false });
      } else {
        showNotification('error', 'Failed to update user role', t, { withTitle: true });
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      showNotification('error', 'An unexpected error occurred', t, { withTitle: true });
    } finally {
      hideLoading();
    }
  };

  async function linkCatches(user: IUser) {
    showLoading();
    if (user) {
      try {
        const linkingResult: UserCatchesLinkedResponse = await linkUserCatches(user);
        console.log(linkingResult.message);
        if (linkingResult.data.count > 0) {
          showNotification(
            'success',
            `Linked ${linkingResult.data.count} catches to user named ${linkingResult.data.linkedName}.`,
            t,
            { withTitle: false, duration: linkingResult.data.count > 0 ? 10000 : 4000 }
          );
        } else {
          showNotification('warning', 'No catches to link.', t, { withTitle: false });
        }
      } catch (error) {
        handleApiError(error, 'catch creation');
      }
    }
    hideLoading();
  }

  async function syncUserAchievements(user: IUser) {
    showLoading();
    const { count } = await recalculateUserAchievements(user.id ?? '', catches);
    showNotification('success', `Updated ${count} achievements for user`, t, { withTitle: false });
    hideLoading();
  }

  return (
    <Container size="sm" p="md">
      <Stack gap={0}>
        {users.map((user) => (
          <Box key={user.id}>
            <Divider my="md" />
            <Stack>
              <Group justify="space-between">
                <Text>{`${user.firstName} (${user.username})`}</Text>
                <RoleIndicator
                  options={jwtUserInfo?.role === UserRole.SUPERADMIN ? rolesWithoutSuperAdmin : rolesWithoutAdmins}
                  user={user}
                  handleToggle={handleToggle}
                />
              </Group>
              <Group justify="end">
                <Button variant="default" size="sm" rightSection={<IconFish />} onClick={() => linkCatches(user)}>
                  Link
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  rightSection={<IconTrophy />}
                  onClick={() => syncUserAchievements(user)}
                >
                  Sync
                </Button>
              </Group>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Container>
  );
}
