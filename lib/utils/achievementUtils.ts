import { achievementConfigMap, allAchievements } from '@/lib/achievements/achievementConfigs';
import { achievementEvaluators } from '@/lib/achievements/achievementEvaluators';
import { getUserAchievements, updateAchievements } from '@/services/api/achievementService';
import { showAchievementNotification } from '../notifications/notifications';
import { IAchievement, IAchievementConfig, IAchievementConfigOneTime, IAchievementConfigTiered, IAchievementTiered } from '../types/achievement';
import { ICatch } from '../types/catch';
import { AchievementsUpdatedResponse, UserAchievementsResponse } from '../types/responses';
import { handleApiError } from './handleApiError';

export type StarRarityCounts = { 1: number; 2: number; 3: number; 4: number; 5: number };

export interface UserAchievementStats {
  totalStars: number;
  byRarity: StarRarityCounts;
  totalXP: number;
}

interface PossibleAchievementStats {
  totalStars: number;
  byRarity: StarRarityCounts;
}

export async function recalculateUserAchievements(
  userId: string,
  catches: ICatch[],
  t?: any,
  showNotifications: boolean = false
): Promise<{ updates: IAchievement[]; count: number }> {
  const userCatches = catches.filter((c) => c.caughtBy.userId === userId);

  try {
    const UserAchievementsResponse: UserAchievementsResponse = await getUserAchievements(userId);
    const currentAchievements = UserAchievementsResponse.data;

    // Loop over evaluators
    const updates: IAchievement[] = [];
    for (const evaluator of achievementEvaluators) {
      const config = achievementConfigMap[evaluator.key];
      const currentAchievement = currentAchievements.find((a) => a.key === evaluator.key);
      const update = evaluator.evaluate(userCatches, config, userId, currentAchievement);
      if (update) {
        updates.push(update);
      }
    }

    const updateResponse: AchievementsUpdatedResponse = await updateAchievements(updates, userId);
    // console.log(updateResponse.message);

    const newAchievements = getNewUnlocks(currentAchievements, updates);
    // console.log(`${newAchievements.length} new achievements unlocked: `, newAchievements);

    if (newAchievements.length > 0 && showNotifications && t) {
      showAchievementNotifications(newAchievements, t);
    }

    return { updates, count: updateResponse.data.count };
  } catch (error) {
    handleApiError(error, 'achievement updating');
  }

  return { updates: [], count: 0 };
}

/**
 * Compares old and new achievement states to determine newly unlocked achievements.
 *
 * @param oldAchievements Array of achievements before recalculation.
 * @param newAchievements Array of achievements after recalculation.
 * @returns Array of achievements that represent a new unlock (or a new tier unlocked).
 */
function getNewUnlocks(oldAchievements: IAchievement[], newAchievements: IAchievement[]): IAchievement[] {
  // Build a lookup map for quick access by key.
  const oldMap = new Map(oldAchievements.map((ach) => [ach.key, ach]));
  const newUnlocks: IAchievement[] = [];

  for (const newAch of newAchievements) {
    const oldAch = oldMap.get(newAch.key);

    if (newAch.isOneTime) {
      // For one-time achievements, if it's now unlocked and either it wasn't present or it wasn't unlocked before.
      if (newAch.unlocked && (!oldAch || !oldAch.unlocked)) {
        newUnlocks.push(newAch);
      }
    } else {
      // For tiered achievements, compare the current tier.
      const oldTier = oldAch && !oldAch.isOneTime ? (oldAch as IAchievementTiered).currentTier : 0;
      const newTier = (newAch as IAchievementTiered).currentTier;
      if (newTier > oldTier) {
        newUnlocks.push(newAch);
      }
    }
  }

  return newUnlocks;
}

export function showAchievementNotifications(achievements: IAchievement[], t: any): void {
  achievements.forEach((ach, index) => {
    setTimeout(() => {
      showAchievementNotification(ach, t);
    }, index * 500);
  });
}

export function sortAchievements(achDict: Record<string, IAchievement>): IAchievementConfig[] {
  const unlockedAchievements = allAchievements
    .filter((config) => !!achDict[config.key] && achDict[config.key].unlocked !== false)
    .sort((a, b) => {
      const achA = achDict[a.key];
      const achB = achDict[b.key];
      const rarityA = a.isOneTime ? a.rarity : (achA && !achA.isOneTime ? (achA as IAchievementTiered).currentTier : 0);
      const rarityB = b.isOneTime ? b.rarity : (achB && !achB.isOneTime ? (achB as IAchievementTiered).currentTier : 0);
      return rarityB - rarityA;
    });

  const lockedAchievements = allAchievements.filter(
    (config) => !achDict[config.key] || achDict[config.key].unlocked === false
  );
  const sorted = [...unlockedAchievements, ...lockedAchievements];
  return sorted;
}

export function getAchievementDescription(achievement: IAchievement, t: any): string {
  if (achievement.isOneTime) {
    return t(`Achievements.${achievement.key}.Description`);
  }
  // For tiered achievements, typecast to the appropriate types.
  const tieredAchConfig = achievementConfigMap[achievement.key] as IAchievementConfigTiered;
  const tieredAch = achievement as IAchievementTiered;

  // Check if the first tier has a threshold of 1 and the user is on tier 1.
  if (tieredAchConfig.baseTiers[0].threshold === 1 && tieredAch.currentTier === 1) {
    return t(`Achievements.${tieredAchConfig.key}.DescSingular`);
  }
  // Determine which tier's threshold to display based on the number of filled stars.
  const index = Math.max(0, Math.min(achievement.currentTier - 1, 4));
  const thresholdValue = tieredAchConfig.baseTiers[index]?.threshold;
  return t(`Achievements.${tieredAchConfig.key}.Description`, { value: thresholdValue });
}

export function calculateTotalXP(achievementsData: IAchievement[]): number {
  const xpAmount = achievementsData.reduce((acc, ach) => acc + ach.totalXP, 0);
  return xpAmount;
}

export function calculateUserAchievementStats(achievementsData: IAchievement[]): UserAchievementStats {
  let currentUserStarsTotal = 0;
  let currentTotalXP = 0;
  const userStarsByRarity: StarRarityCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  achievementsData.forEach((ach) => {
    const config = achievementConfigMap[ach.key];
    if (!config) {
      console.warn(`Config not found for user achievement key: ${ach.key}`);
      return;
    }

    currentTotalXP += ach.totalXP;

    if (ach.isOneTime) {
      if (ach.unlocked) {
        currentUserStarsTotal += 1;
        const oneTimeConfig = config as IAchievementConfigOneTime;
        const rarity = oneTimeConfig.rarity;
        if (rarity >= 1 && rarity <= 5) {
          userStarsByRarity[rarity as keyof StarRarityCounts] += 1;
        } else {
          console.warn(`Invalid rarity (${rarity}) for one-time ach: ${ach.key}`);
        }
      }
    } else {
      const tieredAch = ach as IAchievementTiered;
      currentUserStarsTotal += tieredAch.currentTier;
      for (let tier = 1; tier <= tieredAch.currentTier; tier++) {
        if (tier >= 1 && tier <= 5) {
          userStarsByRarity[tier as keyof StarRarityCounts] += 1;
        }
      }
    }
  });

  return {
    totalStars: currentUserStarsTotal,
    byRarity: userStarsByRarity,
    totalXP: currentTotalXP
  };
}


export function calculateTotalPossibleStars(): PossibleAchievementStats {
  let possibleStarsTotal = 0;
  const totalStarsByRarity: StarRarityCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  allAchievements.forEach((config) => {
    if (config.isOneTime) {
      possibleStarsTotal += 1;
      const oneTimeConfig = config as IAchievementConfigOneTime;
      const rarity = oneTimeConfig.rarity;
      if (rarity >= 1 && rarity <= 5) {
        totalStarsByRarity[rarity as keyof StarRarityCounts] += 1;
      } else {
        console.warn(`Invalid rarity (${rarity}) for one-time config: ${config.key}`);
      }
    } else {
      const tieredConfig = config as IAchievementConfigTiered;
      const numberOfTiers = tieredConfig.baseTiers.length;
      possibleStarsTotal += numberOfTiers;
      tieredConfig.baseTiers.forEach((_tierConfig, index) => {
        const tierNumber = index + 1;
        if (tierNumber >= 1 && tierNumber <= 5) {
          totalStarsByRarity[tierNumber as keyof StarRarityCounts] += 1;
        }
      });
    }
  });

  return {
    totalStars: possibleStarsTotal,
    byRarity: totalStarsByRarity
  };
}