import { IconCheck, IconExclamationMark, IconInfoSmall, IconTrophy, IconX } from '@tabler/icons-react';
import { rem, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { achievementConfigMap } from '@/achievements/achievementConfigs';
import { AchievementColors } from '@/components/achievements/AchievementItem/AchievementItem';
import { IAchievement, IAchievementConfigOneTime, IAchievementOneTime, IAchievementTiered } from '../types/achievement';
import { getAchievementDescription } from '../utils/achievementUtils';
import classes from './achievementNotifications.module.css';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

enum AchievementNotificationBg {
  'rgb(36, 36, 36)',
  'rgb(21, 40, 24)',
  'rgb(16, 32, 45)',
  'rgb(39, 22, 44)',
  'rgb(49, 30, 14)',
}

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
    icon: <IconInfoSmall size="100%" />,
    defaultTitle: 'Info',
  },
};

export function showNotification(
  type: NotificationType,
  message: string,
  options?: { title?: string; withTitle?: boolean; duration?: number }
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
    radius: 'lg',
    bg: 'var(--mantine-color-dark-8)',
    autoClose: options?.duration || 4000,
  });
}

export function showAchievementNotification(achievement: IAchievement, t: any) {
  const { color, bgColor, iconColor, rarity } = getAchNotificationColors(achievement);

  notifications.show({
    color,
    icon: <IconTrophy color={iconColor} style={{ width: rem(30), height: rem(30) }} stroke={2} />,
    withCloseButton: true,
    title: (
      <>
        <Stack gap={0}>
          <div>{t('Notifications.NewAchievement')}</div>
          <div>{t(`Achievements.${achievement.key}.Name`)}</div>
        </Stack>
      </>
    ),
    message: getAchievementDescription(achievement, t),
    position: 'bottom-right',
    withBorder: true,
    radius: 'lg',
    bg: bgColor,
    bd: `1px solid ${color}`,
    autoClose: 30000,
    classNames: { root: classes.root, description: classes.description, icon: classes[`icon${rarity}`] },
  });
}

function getAchNotificationColors(achievement: IAchievement): {
  color: string;
  bgColor: string;
  iconColor: string;
  rarity: number;
} {
  const achievementConfigOneTime = achievementConfigMap[achievement.key] as IAchievementConfigOneTime;

  let ach;
  let rarity = 0;

  if (achievement.isOneTime) {
    ach = achievement as IAchievementOneTime;
    rarity = achievementConfigOneTime.rarity;
  } else {
    ach = achievement as IAchievementTiered;
    rarity = Math.max(0, Math.min(achievement.currentTier, 5));
  }

  let color = '';
  const bgColor = AchievementNotificationBg[rarity - 1];
  let iconColor = '';

  if ((ach.isOneTime && achievementConfigOneTime.rarity === 1) || (!ach.isOneTime && ach.currentTier === 1)) {
    color = 'var(--mantine-color-dark-1)';
    iconColor = 'var(--mantine-color-dark-1)';
  } else {
    color = `var(--mantine-color-${AchievementColors[rarity - 1]}-5)`;
    iconColor = `var(--mantine-color-${AchievementColors[rarity - 1]}-light-color)`;
  }

  return { color, bgColor, iconColor, rarity };
}
