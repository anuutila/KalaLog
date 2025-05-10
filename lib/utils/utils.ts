import imageCompression, { Options } from 'browser-image-compression';
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

export function generateFolderName(catchNumber: number): string {
  return `${process.env.CLOUDINARY_ROOT_FOLDER}/catches/catch_${String(catchNumber).padStart(5, '0')}`;
}

export function generatePublicId(catchNumber: number, imageIndex: number): string {
  return `catch_${String(catchNumber).padStart(5, '0')}_img_${String(imageIndex).padStart(2, '0')}`;
}

export async function optimizeImage(file: File): Promise<File> {
  const options: Options = {
    maxSizeMB: 4, // Target file size
    useWebWorker: true, // Use Web Workers for faster processing
    alwaysKeepResolution: true, // Keep the original resolution
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log('Original size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Compressed size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
    return compressedFile;
  } catch (error) {
    console.error('Image optimization failed:', error);
    throw error;
  }
}

// Extract the publicId from the Cloudinary URL
export function extractPublicId(url: string): string {
  const startIndex = url.indexOf('KalaLog'); // Find where "KalaLog" folder starts
  if (startIndex === -1) {
    throw new Error('Unexpected URL structure');
  }
  return url.substring(startIndex, url.lastIndexOf('.')); // Extract up to the file extension
}

// Extract the folder name from the Cloudinary URL
export function extractFolderName(url: string): string {
  const startIndex = url.indexOf('KalaLog'); // Find where "KalaLog" folder starts
  if (startIndex === -1) {
    throw new Error('Unexpected URL structure');
  }
  return url.substring(startIndex, url.lastIndexOf('/')); // Extract up to the file name
}

// Extract the publicId from the Cloudinary URL
export function extractNextImageIndex(urls: string[]): number {
  const indexes: number[] = [0];
  urls.forEach((url) => {
    const startIndex = url.indexOf('img_'); // Find where the image index starts
    if (startIndex === -1) {
      throw new Error('Unexpected URL structure');
    }
    const index: string = url.substring(startIndex).split('_')[1];
    indexes.push(parseInt(index, 10));
  });
  return Math.max(...indexes) + 1;
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
