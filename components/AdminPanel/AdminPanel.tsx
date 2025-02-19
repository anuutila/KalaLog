import { useEffect, useState } from 'react';
import { Container, Stack, Group, Text, Switch, Button, Divider, Box, FloatingIndicator, UnstyledButton } from '@mantine/core';
import { showNotification } from '@/lib/notifications/notifications';
import { allRoles, IUser, UserRole } from '@/lib/types/user';
import { useLoadingOverlay } from '@/context/LoadingOverlayContext';
import { ApiEndpoints } from '@/lib/constants/constants';
import { IconFish, IconTrophy } from '@tabler/icons-react';
import { linkUserCatches } from '@/services/api/userService';
import { UserCatchesLinkedResponse } from '@/lib/types/responses';
import { handleApiError } from '@/lib/utils/handleApiError';
import { recalculateUserAchievements } from '@/lib/utils/achievementUtils';
import { useGlobalState } from '@/context/GlobalState';
import RoleIndicator from './RoleIndicator';

const rolesWithoutAdmins = Object.values(allRoles.filter((role) => role !== UserRole.ADMIN && role !== UserRole.SUPERADMIN)).reverse();
const rolesWithoutSuperAdmin = Object.values(allRoles.filter((role) => role !== UserRole.SUPERADMIN)).reverse();

export default function AdminPanel() {
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
          showNotification('error', 'Failed to fetch users', { withTitle: true });
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        showNotification('error', 'An unexpected error occurred', { withTitle: true });
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
        setUsers((prev) =>
          prev.map((user) => (user.id === updatedUser.data.id ? updatedUser.data : user))
        );
        showNotification('success', 'User role updated successfully', { withTitle: false });
      } else {
        showNotification('error', 'Failed to update user role', { withTitle: true });
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      showNotification('error', 'An unexpected error occurred', { withTitle: true });
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
          showNotification('success', `Linked ${linkingResult.data.count} catches to user named ${linkingResult.data.linkedName}.`, { withTitle: false, duration: linkingResult.data.count > 0 ? 10000 : 4000 });
        } else {
          showNotification('warning', 'No catches to link.', { withTitle: false });
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
    showNotification('success', `Updated ${count} achievements for user`, { withTitle: false });
    hideLoading();
  }

  return (
    <Container size="sm" p="md">
      <Stack gap={0}>
        {users.map((user) => (
          <Box key={user.id}>
            <Divider my="md" />
            <Stack >
              <Group justify='space-between'>
                <Text>{`${user.firstName} (${user.username})`}</Text>
                <RoleIndicator
                  options={jwtUserInfo?.role === UserRole.SUPERADMIN ? rolesWithoutSuperAdmin : rolesWithoutAdmins}
                  user={user}
                  handleToggle={handleToggle}
                />
              </Group>
              <Group justify='end'>
                <Button variant='default' size='sm' rightSection={<IconFish />} onClick={() => linkCatches(user)}>
                  Link
                </Button>
                <Button variant='default' size='sm' rightSection={<IconTrophy />} onClick={() => syncUserAchievements(user)}>
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
