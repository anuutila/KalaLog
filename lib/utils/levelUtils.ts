import { LEVEL_BASE_CONSTANT } from "../constants/constants";

export function calculateLevel(totalXP: number): number {
  // Level 1 if XP is less than 100, then level increases as XP increases.
  return Math.floor(Math.sqrt(totalXP / LEVEL_BASE_CONSTANT)) + 1;
}

export function xpForLevel(level: number): number {
  return LEVEL_BASE_CONSTANT * level * level;
}

export function progressToNextLevel(totalXP: number, currentLevel: number): number {
  const xpCurrent = xpForLevel(currentLevel - 1);
  const xpNext = xpForLevel(currentLevel);
  // Calculate fraction of progress between the current and next level
  return (totalXP - xpCurrent) / (xpNext - xpCurrent);
}