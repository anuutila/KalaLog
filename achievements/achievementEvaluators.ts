import { IAchievement, IAchievementConfig, IAchievementConfigOneTime, IAchievementConfigTiered, IAchievementOneTime, IAchievementTiered } from "@/lib/types/achievement";
import { ICatch } from "@/lib/types/catch";
import { CatchUtils } from "@/lib/utils/catchUtils";

export interface AchievementEvaluator<TConfig extends IAchievementConfig = IAchievementConfig, TRecord extends IAchievement = IAchievement> {
  key: string;
  evaluate: (userCatches: ICatch[], config: TConfig, userId: string, currentAchievement?: TRecord) => IAchievement | null;
}

/**
 * Build a tiered achievement record based on the current progress
 */
function buildTieredAchievement(
  progress: number,
  config: IAchievementConfigTiered,
  userId: string,
  currentAchievement?: IAchievementTiered
): IAchievementTiered | null {
  const validProgress = progress || 0;
  const currentTier = 
    config.baseTiers.findIndex((tier) => validProgress < tier.threshold) === -1
    ? config.baseTiers.length
    : config.baseTiers.findIndex((tier) => validProgress < tier.threshold);
  const isUnlocked = currentTier > 0;

  if (!currentAchievement && progress === 0) return null;

  const totalXP = config.baseTiers.reduce(
    (acc, tier, index) => (index < currentTier ? acc + tier.xp : acc),
    0
  );

  const tiers = config.baseTiers.map((tier, index) => ({
    tier: index + 1,
    dateUnlocked:
      !currentAchievement || !currentAchievement.tiers?.[index]?.dateUnlocked
        ? index < currentTier
          ? new Date()
          : undefined
        : currentAchievement.tiers[index].dateUnlocked,
  }));

  return {
    userId,
    key: config.key,
    progress: validProgress || 0,
    totalXP,
    unlocked: isUnlocked,
    isOneTime: false,
    currentTier,
    tiers,
  };
}

/**
 * Build a one-time achievement record based on the current progress
 */
function buildOneTimeAchievement(
  userId: string,
  config: IAchievementConfigOneTime,
  progress: number,
  isUnlocked: boolean,
  currentAchievement?: IAchievementOneTime
): IAchievementOneTime | null {

  if (!currentAchievement && progress === 0) return null;
  
  const dateUnlocked =
    !currentAchievement || !currentAchievement.dateUnlocked
      ? new Date()
      : currentAchievement.dateUnlocked;
  
  return {
    key: config.key,
    userId,
    progress: progress || 0,
    unlocked: isUnlocked || false,
    isOneTime: true,
    totalXP: isUnlocked ? config.xp : 0,
    dateUnlocked,
  };
}


// ******** Tiered achievement evaluators *********

export const totalCatchesEvaluator: AchievementEvaluator<IAchievementConfigTiered, IAchievementTiered> = {
  key: 'total_catches',
  evaluate: (userCatches, config, userId, currentAchievement) => {
    const progress = userCatches.length || 0;
    return buildTieredAchievement(progress, config, userId, currentAchievement);
  },
};

export const speciesAmountEvaluator: AchievementEvaluator<IAchievementConfigTiered, IAchievementTiered> = {
  key: 'species_amount',
  evaluate: (userCatches, config, userId, currentAchievement) => {
    const species = CatchUtils.getUniqueSpecies(userCatches);
    const progress = species.length || 0;
    return buildTieredAchievement(progress, config, userId, currentAchievement);
  },
};

export const weightCatchEvaluator: AchievementEvaluator<IAchievementConfigTiered, IAchievementTiered> = {
  key: 'weight_catch',
  evaluate: (userCatches, config, userId, currentAchievement) => {
    const weights = CatchUtils.getUniqueWeights(userCatches);
    const progress = Math.max(0, ...weights) || 0;
    return buildTieredAchievement(progress, config, userId, currentAchievement);
  },
};

export const zanderAmountEvaluator: AchievementEvaluator<IAchievementConfigTiered, IAchievementTiered> = {
  key: 'zander_amount',
  evaluate: (userCatches, config, userId, currentAchievement) => {
    const progress = CatchUtils.getSpeciesTotal(userCatches, 'Kuha');
    return buildTieredAchievement(progress, config, userId, currentAchievement);
  },
};

export const perchAmountEvaluator: AchievementEvaluator<IAchievementConfigTiered, IAchievementTiered> = {
  key: 'perch_amount',
  evaluate: (userCatches, config, userId, currentAchievement) => {
    const progress = CatchUtils.getSpeciesTotal(userCatches, 'Ahven');
    return buildTieredAchievement(progress, config, userId, currentAchievement);
  },
};

export const pikeAmountEvaluator: AchievementEvaluator<IAchievementConfigTiered, IAchievementTiered> = {
  key: 'pike_amount',
  evaluate: (userCatches, config, userId, currentAchievement) => {
    const progress = CatchUtils.getSpeciesTotal(userCatches, 'Hauki');
    return buildTieredAchievement(progress, config, userId, currentAchievement);
  },
};

export const breamAmountEvaluator: AchievementEvaluator<IAchievementConfigTiered, IAchievementTiered> = {
  key: 'bream_amount',
  evaluate: (userCatches, config, userId, currentAchievement) => {
    const progress = CatchUtils.getSpeciesTotal(userCatches, 'Lahna');
    return buildTieredAchievement(progress, config, userId, currentAchievement);
  },
};

export const roachAmountEvaluator: AchievementEvaluator<IAchievementConfigTiered, IAchievementTiered> = {
  key: 'roach_amount',
  evaluate: (userCatches, config, userId, currentAchievement) => {
    const progress = CatchUtils.getSpeciesTotal(userCatches, 'Särki');
    return buildTieredAchievement(progress, config, userId, currentAchievement);
  },
};

export const spotAmountEvaluator: AchievementEvaluator<IAchievementConfigTiered, IAchievementTiered> = {
  key: 'spot_amount',
  evaluate: (userCatches, config, userId, currentAchievement) => {
    const spots = CatchUtils.getUniqueSpotsBasedOnDistanceAndBoW(userCatches, config.condition?.distance || 200);
    const progress = spots || 0;
    return buildTieredAchievement(progress, config, userId, currentAchievement);
  }
};

export const bodiesOfWaterAmountEvaluator: AchievementEvaluator<IAchievementConfigTiered, IAchievementTiered> = {
  key: 'bodies_of_water_amount',
  evaluate: (userCatches, config, userId, currentAchievement) => {
    const bodyOfWaters = CatchUtils.getUniqueBodiesOfWater(userCatches);
    const progress = bodyOfWaters.length || 0;
    return buildTieredAchievement(progress, config, userId, currentAchievement);
  }
};

export const lureAmountEvaluator: AchievementEvaluator<IAchievementConfigTiered, IAchievementTiered> = {
  key: 'lure_amount',
  evaluate: (userCatches, config, userId, currentAchievement) => {
    const lures = CatchUtils.getUniqueLures(userCatches);
    const progress = lures.length || 0;
    return buildTieredAchievement(progress, config, userId, currentAchievement);
  }
};

export const fishingStreakEvaluator: AchievementEvaluator<IAchievementConfigTiered, IAchievementTiered> = {
  key: 'fishing_streak',
  evaluate: (userCatches, config, userId, currentAchievement) => {
    const progress = CatchUtils.getLongestFishingStreak(userCatches);
    return buildTieredAchievement(progress, config, userId, currentAchievement);
  }
};


// ******** One-time achievement evaluators *********

export const tinyCatchEvaluator: AchievementEvaluator<IAchievementConfigOneTime, IAchievementOneTime> = {
  key: 'tiny_catch',
  evaluate: (userCatches, config, userId, currentAchievement) => {
    const lengths = CatchUtils.getUniqueLengths(userCatches);
    if (lengths.length === 0) return null;
    
    const smallest = Math.min(...lengths);
    const isUnlocked = smallest <= config.condition.length;
    
    return buildOneTimeAchievement(userId, config, smallest, isUnlocked, currentAchievement);
  },
};

export const fourSeasonsEvaluator: AchievementEvaluator<IAchievementConfigOneTime, IAchievementOneTime> = {
  key: 'four_seasons',
  evaluate: (userCatches, config, userId, currentAchievement) => {
    const seasonsAmount = CatchUtils.getUniqueSeasons(userCatches);
    const isUnlocked = seasonsAmount === config.condition.seasons.length;
    
    return buildOneTimeAchievement(userId, config, seasonsAmount, isUnlocked, currentAchievement);
  },
};

export const rapidCatchesEvaluator: AchievementEvaluator<IAchievementConfigOneTime, IAchievementOneTime> = {
  key: 'rapid_catches',
  evaluate: (userCatches, config, userId, currentAchievement) => {
    const progress = CatchUtils.resolveTimeframeCatches(userCatches, config.condition.timeframe, config.condition.catchCount);
    return buildOneTimeAchievement(userId, config, progress, progress > 0, currentAchievement);
  }
};

export const hourCatchesEvaluator: AchievementEvaluator<IAchievementConfigOneTime, IAchievementOneTime> = {
  key: 'hour_catches',
  evaluate: (userCatches, config, userId, currentAchievement) => {
    const progress = CatchUtils.resolveTimeframeCatches(userCatches, config.condition.timeframe);
    const isUnlocked = progress >= config.condition.catchCount;
    return buildOneTimeAchievement(userId, config, progress, isUnlocked, currentAchievement);
  }
};

export const addImageEvaluator: AchievementEvaluator<IAchievementConfigOneTime, IAchievementOneTime> = {
  key: 'add_image',
  evaluate: (userCatches, config, userId, currentAchievement) => {
    const progress = userCatches.filter(c => (c.images ?? []).length > 0).length;
    return buildOneTimeAchievement(userId, config, progress, progress > 0, currentAchievement);
  }
};

export const addCommentEvaluator: AchievementEvaluator<IAchievementConfigOneTime, IAchievementOneTime> = {
  key: 'add_comment',
  evaluate: (userCatches, config, userId, currentAchievement) => {
    const progress = userCatches.filter(c => (c.comment ?? '').length > 0).length;
    return buildOneTimeAchievement(userId, config, progress, progress > 0, currentAchievement);
  }
};

export const kahenKilonSiikaEvaluator: AchievementEvaluator<IAchievementConfigOneTime, IAchievementOneTime> = {
  key: 'kahen_kilon_siika',
  evaluate: (userCatches, config, userId, currentAchievement) => {
    const siikaCatches = userCatches.filter(c => c.species === config.condition.species);
    const heaviestCatch = Math.max(0, ...siikaCatches.map(c => (c.weight ?? 0)));
    const isUnlocked = heaviestCatch >= config.condition.weight;
    return buildOneTimeAchievement(userId, config, heaviestCatch, isUnlocked, currentAchievement);
  }
};


export const achievementEvaluators: AchievementEvaluator[] = [
  totalCatchesEvaluator as AchievementEvaluator<IAchievementConfig, IAchievement>,
  speciesAmountEvaluator as AchievementEvaluator<IAchievementConfig, IAchievement>,
  weightCatchEvaluator as AchievementEvaluator<IAchievementConfig, IAchievement>,
  tinyCatchEvaluator as AchievementEvaluator<IAchievementConfig, IAchievement>,
  zanderAmountEvaluator as AchievementEvaluator<IAchievementConfig, IAchievement>,
  perchAmountEvaluator as AchievementEvaluator<IAchievementConfig, IAchievement>,
  pikeAmountEvaluator as AchievementEvaluator<IAchievementConfig, IAchievement>,
  breamAmountEvaluator as AchievementEvaluator<IAchievementConfig, IAchievement>,
  roachAmountEvaluator as AchievementEvaluator<IAchievementConfig, IAchievement>,
  spotAmountEvaluator as AchievementEvaluator<IAchievementConfig, IAchievement>,
  bodiesOfWaterAmountEvaluator as AchievementEvaluator<IAchievementConfig, IAchievement>,
  lureAmountEvaluator as AchievementEvaluator<IAchievementConfig, IAchievement>,
  fourSeasonsEvaluator as AchievementEvaluator<IAchievementConfig, IAchievement>,
  rapidCatchesEvaluator as AchievementEvaluator<IAchievementConfig, IAchievement>,
  hourCatchesEvaluator as AchievementEvaluator<IAchievementConfig, IAchievement>,
  fishingStreakEvaluator as AchievementEvaluator<IAchievementConfig, IAchievement>,
  addImageEvaluator as AchievementEvaluator<IAchievementConfig, IAchievement>,
  addCommentEvaluator as AchievementEvaluator<IAchievementConfig, IAchievement>,
  kahenKilonSiikaEvaluator as AchievementEvaluator<IAchievementConfig, IAchievement>,
];