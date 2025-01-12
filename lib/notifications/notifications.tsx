import { notifications } from '@mantine/notifications';
import { IconX, IconCheck, IconExclamationMark, IconInfoSmall } from '@tabler/icons-react';
import { rem } from '@mantine/core';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

const notificationDefaults: Record<NotificationType, { color: string; icon: JSX.Element; defaultTitle: string }> = {
  success: {
    color: 'var(--success-notification-color)',
    icon: <IconCheck style={{ width: rem(18), height: rem(18) }} stroke={3} />,
    defaultTitle: 'Success',
  },
  error: {
    color: 'var(--error-notification-color)',
    icon: <IconX style={{ width: rem(18), height: rem(18) }} stroke={3} />,
    defaultTitle: 'Error',
  },
  warning: {
    color: 'var(--warning-notification-color)',
    icon: <IconExclamationMark style={{ width: rem(18), height: rem(18) }} stroke={3} />,
    defaultTitle: 'Warning',
  },
  info: {
    color: 'var(--info-notification-color)',
    icon: <IconInfoSmall size={'100%'} />,
    defaultTitle: 'Info',
  },
};

export function showNotification(
  type: NotificationType,
  message: string,
  options?: { title?: string; withTitle?: boolean }
) {
  const { color, icon, defaultTitle } = notificationDefaults[type];

  notifications.show({
    color,
    icon,
    withCloseButton: true,
    title: options?.withTitle !== false ? options?.title || defaultTitle : undefined,
    message,
    position: 'bottom-right',
    withBorder: true,
    radius: 'md',
    autoClose: 5000
  });
}
