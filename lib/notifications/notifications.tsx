import { notifications } from '@mantine/notifications';
import { IconX, IconCheck, IconExclamationMark, IconInfoSmall, IconTrophy } from '@tabler/icons-react';
import { rem, Stack } from '@mantine/core';
import { IAchievement, IAchievementConfigOneTime, IAchievementOneTime, IAchievementTiered } from '../types/achievement';
import { getAchievementDescription } from '../utils/achievementUtils';
import classes from './achievementNotifications.module.css';
import classes2 from './notifications.module.css';
import { confetti } from "@tsparticles/confetti";
import { achievementConfigMap } from '@/lib/achievements/achievementConfigs';
import { AchievementColors } from '@/components/achievements/AchievementItem/AchievementItem';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

export type Rarity = 1 | 2 | 3 | 4 | 5;

const confettiColors: Record<Rarity, string[]> = {
  1: ["#edf6fe", "#e2e8ed", "#c6cdd4", "#a8b2bb", "#8e9aa6"],
  2: ["#85de94", "#61d374", "#4acd60", "#3cca55", "#2cb245"],
  3: ["#9fd1fb", "#6db8f6", "#43a2f1", "#2894ef", "#128eef"],
  4: ["#f4d4fd", "#e5a7f4", "#d577ed", "#c74fe6", "#bf35e2"],
  5: ["#ffcb99", "#ffaf63", "#ff9736", "#ff8818", "#ff8005"]
};

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
  t: any,
  options?: { title?: string; withTitle?: boolean; duration?: number }
) {
  const { color, icon, defaultTitle } = notificationDefaults[type];

  console.log(t(`Notifications.${defaultTitle}`))

  notifications.show({
    color,
    icon,
    withCloseButton: true,
    title: options?.withTitle !== false ? options?.title || t(`Notifications.${defaultTitle}`) : undefined,
    message,
    position: 'bottom-right',
    withBorder: true,
    radius: 'lg',
    bg: 'var(--mantine-color-dark-8)',
    autoClose: options?.duration || 4000,
    classNames: { root: classes2.notificationRoot, icon: classes2.notificationIcon + ' ' + classes2[`iconBg${type.charAt(0).toUpperCase() + type.slice(1)}`] },
  });
}

export function showAchievementNotification(achievement: IAchievement, t: any) {
  const { color, bgColor, iconColor, rarity } = getAchNotificationColors(achievement);

  notifications.show({
    color,
    icon: <IconTrophy color={iconColor} style={{ width: rem(30), height: rem(30) }} stroke={2} />,
    withCloseButton: true,
    title: 
    <>
      <Stack gap={0}>
        <div>{t('Notifications.NewAchievement')}</div>
        <div>{t(`Achievements.${achievement.key}.Name`)}{!achievement.isOneTime ? ` - ${achievement.currentTier}` : ''}</div>
      </Stack>
    </>,
    message: getAchievementDescription(achievement, t),
    position: 'bottom-right',
    withBorder: true,
    radius: 'lg',
    bg: bgColor,
    bd: `1px solid ${color}`,
    autoClose: 30000,
    onClick: () => showConfettiEffect(1, rarity as Rarity),
    classNames: { root: classes.root, description: classes.description, icon: classes[`icon${rarity}`] },
  });

  showConfettiEffect(3, rarity as Rarity);
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

const defaults = {
  spread: 360,
  drift: 10,
  ticks: 50,
  gravity: 1,
  decay: 0.85,
  startVelocity: 30,
};

function shoot(position: { x: number; y: number }, colors: string[]) {
  confetti('tsparticles2',{
    ...defaults,
    particleCount: 25,
    scalar: 1,
    shapes: ["star"],
    position,
    colors
  });
  confetti('tsparticles2',{
    ...defaults,
    particleCount: 10,
    scalar: 0.75,
    shapes: ["circle"],
    position,
    colors
  });
  confetti('tsparticles1',{
    ...defaults,
    particleCount: 25,
    scalar: 1,
    shapes: ["star"],
    position,
    colors
  });
  confetti('tsparticles2',{
    ...defaults,
    particleCount: 10,
    scalar: 0.75,
    shapes: ["circle"],
    position,
    colors
  });
  confetti('tsparticles1',{
    ...defaults,
    particleCount: 10,
    scalar: 1,
    shapes: ["star"],
    position,
    colors,
    angle: 90,
    spread: 45,
    startVelocity: 80,
  });
}

function generateRandomPosition() {
  return {
    x: Math.random() * (90 - 10) + 10, // x between 10 and 90
    y: Math.random() * (45 - 10) + 10,  // y between 10 and 45
  };
}

function showConfettiEffect(times: number, rarity: Rarity) {
  const positions = [];
  const xThreshold = 15; // minimum horizontal difference between consecutive shots
  const yThreshold = 5;  // minimum vertical difference between consecutive shots

  for (let i = 0; i < times; i++) {
    let candidate = generateRandomPosition();
    
    // If not the first, ensure candidate isn't too close to the previous one.
    if (positions.length > 0) {
      const last = positions[positions.length - 1];
      let attempts = 0;
      while ((Math.abs(candidate.x - last.x) < xThreshold ||
              Math.abs(candidate.y - last.y) < yThreshold) && attempts < 10) {
        candidate = generateRandomPosition();
        attempts++;
      }
    }
    positions.push(candidate);
    
    setTimeout(() => {
      shoot(candidate, confettiColors[rarity]);
    }, i * 100);
  }
}
