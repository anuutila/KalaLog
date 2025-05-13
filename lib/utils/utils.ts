import { ICatch } from '../types/catch';
import { MantineColor } from '@mantine/core';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export function sortByDate(catches: ICatch[]): ICatch[] {
  return catches.sort((a, b) => {
    const dateA = a.date ? a.date.split('-').join('') : '';
    const dateB = b.date ? b.date.split('-').join('') : '';
    return dateA.localeCompare(dateB);
  });
}

export function sortByTime(catches: ICatch[]): ICatch[] {
  return catches.sort((a, b) => {
    const timeA = a.time ? a.time.split(':').join('') : '';
    const timeB = b.time ? b.time.split(':').join('') : '';
    return timeA.localeCompare(timeB);
  });
}

/**
 * Sorts catches by date and time so that the most recent entries are first in the table
 * @param {ICatch[]} catches - Array of catches to be sorted
 * @returns {ICatch[]} - Array of catches sorted by date in reverse chronological order
 */
export function defaultSort(catches: ICatch[]): ICatch[] {
  return sortByDate(sortByTime(catches)).reverse();
}

export function capitalizeFirstLetter(value: string | null | undefined): string | null {
  if (!value || typeof value !== 'string') {
    return null;
  } // Return null for invalid or empty input
  const updated = value.charAt(0).toUpperCase() + value.slice(1);
  return updated;
}

// Generate a random color based on the name
export function nameToColor(name: string): MantineColor {
  const availableColors: MantineColor[] = [
    'red', 'pink', 'grape', 'violet', 'indigo', 'blue', 'cyan', 'teal', 'lime', 'green', 'yellow', 'orange'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % availableColors.length);
  return availableColors[index];
};

export function getPageLabelKey(pathname: string | null): string {
  if (!pathname) {
    return 'Pages.KalaLog';
  }

  const staticPages: Record<string, string> = {
    '/catches': 'Pages.Catches',
    '/statistics': 'Pages.Stats',
    '/new_catch': 'Pages.NewCatch',
    '/community': 'Pages.Community',
    '/login': 'Pages.Account',
    '/signup': 'Pages.Account',
  };

  if (staticPages[pathname]) {
    return staticPages[pathname];
  }

  if (pathname.startsWith('/user/') && pathname.includes('/achievements')) {
    return 'Pages.Achievements';
  }

  if (pathname.startsWith('/user/')) {
    return 'Pages.Account';
  }

  return 'Pages.KalaLog';
};

export function navigateBack(router: AppRouterInstance, previousPath: string | null, fallbackPath: string = '/catches'): void {
  const goBackPath = previousPath || fallbackPath;
  router.push(goBackPath, { scroll: false });
}
