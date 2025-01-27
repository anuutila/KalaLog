import { useEffect, useState } from 'react';
import { Container, Stack, Group, Text, Switch } from '@mantine/core';
import { showNotification } from '@/lib/notifications/notifications';
import { IUser, UserRole } from '@/lib/types/user';
import { useLoadingOverlay } from '@/context/LoadingOverlayContext';

export default function AdminPanel() {
  const [users, setUsers] = useState<IUser[]>([]);
  const { showLoading, hideLoading } = useLoadingOverlay();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        showLoading();
        const response = await fetch('/api/users/adminPanelData');
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

  const handleToggle = async (userId: string, currentRole: UserRole) => {
    try {
      showLoading();

      const newRole = currentRole === UserRole.EDITOR ? UserRole.VIEWER : UserRole.EDITOR;
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

  return (
    <Container size="sm" p="md">
      <Stack>
        {users.map((user) => (
          <Group key={user.id} justify='space-between'>
            <Text>{`${user.firstName} (${user.username})`}</Text>
            <Switch
              checked={user.role === UserRole.EDITOR}
              onChange={() => handleToggle(user.id ?? '', user.role ?? UserRole.VIEWER)}
              label={user.role === UserRole.EDITOR ? 'Editor' : 'Viewer'}
            />
          </Group>
        ))}
      </Stack>
    </Container>
  );
}
