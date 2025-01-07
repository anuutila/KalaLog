import { ICatch } from "../types/catch"

export function sortByDate(catches: ICatch[]): ICatch[] {
  return catches.sort((a, b) => {
    const dateA = a.date ? a.date.split('-').join('') : '';
    const dateB = b.date ? b.date.split('-').join('') : '';
    return dateA.localeCompare(dateB);
  });
}

export function sortByTime(catches: ICatch[]): ICatch[] {
  return catches.sort((a, b) => {
    const timeA = a.time ? a.time.split(':').join(''): '';
    const timeB = b.time ? b.time.split(':').join(''): '';
    return timeA.localeCompare(timeB);
  })
}

/**
 * Sorts catches by date and time so that the most recent entries are first in the table
 * @param {ICatch[]} catches - Array of catches to be sorted
 * @returns {ICatch[]} - Array of catches sorted by date in reverse chronological order
 */
export function defaultSort(catches: ICatch[]): ICatch[] {
  return sortByDate(sortByTime(catches)).reverse()
}

export function capitalizeFirstLetter(value: string | null | undefined): string | null {
  if (!value || typeof value !== 'string') return null; // Return null for invalid or empty input
  const updated = value.charAt(0).toUpperCase() + value.slice(1);
  return updated;
}