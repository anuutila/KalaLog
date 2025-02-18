import { z } from "zod";

export const AchievementBaseSchema = z.object({
  id: z.string().optional(),
  userId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID"),
  key: z.string(),
  progress: z.number().min(0),
  totalXP: z.number().min(0),
  unlocked: z.boolean(),
});

export const AchievementTierSchema = z.object({
  tier: z.number().min(1),
  dateUnlocked: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
      return arg;
    },
    z.date().optional().nullable()
  ),
  bonus: z.boolean().optional(),
});

export const AchievementTieredSchema = AchievementBaseSchema.extend({
  isOneTime: z.literal(false),
  currentTier: z.number().min(0),
  tiers: z.array(AchievementTierSchema),
});

export const AchievementOneTimeSchema = AchievementBaseSchema.extend({
  isOneTime: z.literal(true),
  dateUnlocked: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
      return arg;
    },
    z.date().optional().nullable()
  ),
});

// Union Type for Achievements
export const AchievementSchema = z.discriminatedUnion("isOneTime", [
  AchievementTieredSchema,
  AchievementOneTimeSchema,
]);

export const ConditionSchema = z.record(z.any());

export const AchievementConfigBaseSchema = z.object({
  key: z.string(),
  category: z.array(z.string()),
  progressBar: z.boolean().optional(),
  unit: z.string().optional(),
});

export const AchievementTierConfigSchema = z.object({
  tier: z.number().min(1),
  threshold: z.number().min(0),
  xp: z.number().min(0),
  dateUnlocked: z.date().optional().nullable(),
  bonus: z.boolean().optional(),
});

export const AchievementConfigTieredSchema = AchievementConfigBaseSchema.extend({
  isOneTime: z.literal(false),
  baseTiers: z.array(AchievementTierConfigSchema),
  dynamicBonus: z.boolean(),
  bonusTierXP: z.number().min(0).optional(),
  bonusThreshold: z.number().min(0).optional(),
});

export const AchievementConfigOneTimeSchema = AchievementConfigBaseSchema.extend({
  isOneTime: z.literal(true),
  xp: z.number().min(0),
  condition: ConditionSchema,
  threshold: z.number().min(0).optional(),
  rarity: z.number().min(1).max(5),
});

// Union Type for Achievement Configurations
export const AchievementConfigSchema = z.discriminatedUnion("isOneTime", [
  AchievementConfigTieredSchema,
  AchievementConfigOneTimeSchema,
]);

// Infer the TypeScript types from the Zod schemas
export type IAchievement = z.infer<typeof AchievementSchema>;
export type IAchievementTiered = z.infer<typeof AchievementTieredSchema>;
export type IAchievementOneTime = z.infer<typeof AchievementOneTimeSchema>;
export type IAchievementTier = z.infer<typeof AchievementTierSchema>;
export type IAchievementConfig = z.infer<typeof AchievementConfigSchema>;
export type IAchievementConfigTiered = z.infer<typeof AchievementConfigTieredSchema>;
export type IAchievementConfigOneTime = z.infer<typeof AchievementConfigOneTimeSchema>;
