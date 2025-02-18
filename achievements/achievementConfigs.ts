import { IAchievementConfig } from "@/lib/types/achievement";

export const amountAchievements: IAchievementConfig[] = [
  {
    key: "total_catches",
    category: ["amount"],
    isOneTime: false,
    dynamicBonus: false,
    baseTiers: [
      { tier: 1, threshold: 1, xp: 100 },
      { tier: 2, threshold: 10, xp: 200 },
      { tier: 3, threshold: 50, xp: 400 },
      { tier: 4, threshold: 150, xp: 800 },
      { tier: 5, threshold: 300, xp: 1500 },
    ]
  },
  {
    key: "species_amount",
    category: ["amount", "species"],
    isOneTime: false,
    dynamicBonus: false,
    baseTiers: [
      { tier: 1, threshold: 2, xp: 100 },
      { tier: 2, threshold: 4, xp: 200 },
      { tier: 3, threshold: 6, xp: 400 },
      { tier: 4, threshold: 8, xp: 800 },
      { tier: 5, threshold: 10, xp: 1500 },
    ]
  }
];

export const sizeAchievements: IAchievementConfig[] = [
  {
    key: "weight_catch",
    category: ["size"],
    isOneTime: false,
    progressBar: false,
    dynamicBonus: false,
    unit: "kg",
    baseTiers: [
      { tier: 1, threshold: 1, xp: 150 },
      { tier: 2, threshold: 2, xp: 300 },
      { tier: 3, threshold: 5, xp: 600 },
      { tier: 4, threshold: 7.5, xp: 1000 },
      { tier: 5, threshold: 10, xp: 2000 },
    ]
  },
  {
    key: "tiny_catch",
    category: ["size"],
    isOneTime: true,
    xp: 500,
    condition: { length: 10 },
    progressBar: false,
    rarity: 4,
  },
];

export const speciesAchievements: IAchievementConfig[] = [
  {
    key: "zander_amount",
    category: ["species, amount"],
    isOneTime: false,
    dynamicBonus: false,
    baseTiers: [
      { tier: 1, threshold: 1, xp: 100 },
      { tier: 2, threshold: 5, xp: 200 },
      { tier: 3, threshold: 20, xp: 400 },
      { tier: 4, threshold: 50, xp: 800 },
      { tier: 5, threshold: 100, xp: 1500 }
    ]
  },
  {
    key: "perch_amount",
    category: ["species, amount"],
    isOneTime: false,
    dynamicBonus: false,
    baseTiers: [
      { tier: 1, threshold: 1, xp: 100 },
      { tier: 2, threshold: 5, xp: 200 },
      { tier: 3, threshold: 20, xp: 400 },
      { tier: 4, threshold: 50, xp: 800 },
      { tier: 5, threshold: 100, xp: 1500 }
    ]
  },
  {
    key: "pike_amount",
    category: ["species, amount"],
    isOneTime: false,
    dynamicBonus: false,
    baseTiers: [
      { tier: 1, threshold: 1, xp: 100 },
      { tier: 2, threshold: 5, xp: 200 },
      { tier: 3, threshold: 20, xp: 400 },
      { tier: 4, threshold: 50, xp: 800 },
      { tier: 5, threshold: 100, xp: 1500 }
    ]
  },
  {
    key: "bream_amount",
    category: ["species, amount"],
    isOneTime: false,
    dynamicBonus: false,
    baseTiers: [
      { tier: 1, threshold: 1, xp: 200 },
      { tier: 2, threshold: 3, xp: 500 },
      { tier: 3, threshold: 5, xp: 1000 }
    ],
  },
  {
    key: "roach_amount",
    category: ["species, amount"],
    isOneTime: false,
    dynamicBonus: false,
    baseTiers: [
      { tier: 1, threshold: 1, xp: 200 },
      { tier: 2, threshold: 3, xp: 500 },
      { tier: 3, threshold: 5, xp: 1000 }
    ]
  }
];

export const locationAchievements: IAchievementConfig[] = [
  {
    key: "spot_amount",
    category: ["location, amount"],
    isOneTime: false,
    dynamicBonus: false,
    baseTiers: [
      { tier: 1, threshold: 2, xp: 100 },
      { tier: 2, threshold: 5, xp: 200 },
      { tier: 3, threshold: 10, xp: 400 },
      { tier: 4, threshold: 20, xp: 800 },
      { tier: 5, threshold: 50, xp: 1500 }
    ]
  },
  {
    key: "bodies_of_water_amount",
    category: ["location, amount"],
    isOneTime: false,
    dynamicBonus: false,
    baseTiers: [
      { tier: 1, threshold: 2, xp: 150 },
      { tier: 2, threshold: 3, xp: 300 },
      { tier: 3, threshold: 4, xp: 600 },
      { tier: 4, threshold: 5, xp: 1000 }
    ]
    // Dynamic bonus: for each additional body of water beyond tier 4, award +2000 xp
  }
];

export const lureAchievementsConfig: IAchievementConfig[] = [
  {
    key: "lure_amount",
    category: ["lure", "amount"],
    isOneTime: false,
    dynamicBonus: false,
    baseTiers: [
      { tier: 1, threshold: 2, xp: 100 },
      { tier: 2, threshold: 5, xp: 200 },
      { tier: 3, threshold: 15, xp: 400 },
      { tier: 4, threshold: 30, xp: 800 },
      { tier: 5, threshold: 50, xp: 1500 }
    ]
  },
];

export const timeAchievementsConfig: IAchievementConfig[] = [
  {
    key: "four_seasons",
    category: ["time_and_date"],
    isOneTime: true,
    xp: 1500,
    condition: { seasons: ["spring", "summer", "autumn", "winter"] },
    threshold: 4,
    rarity: 4,
  },
  {
    key: "fishing_streak",
    category: ["time_and_date"],
    isOneTime: false,
    dynamicBonus: false,
    baseTiers: [
      { tier: 1, threshold: 2, xp: 150 },
      { tier: 2, threshold: 3, xp: 300 },
      { tier: 3, threshold: 5, xp: 600 },
      { tier: 4, threshold: 7, xp: 1000 },
      { tier: 5, threshold: 10, xp: 2000 }
    ]
  },
  {
    key: "rapid_catches",
    category: ["time_and_date"],
    isOneTime: true,
    xp: 800,
    condition: { timeWindow: 5, catchCount: 2 },
    progressBar: false,
    rarity: 3,
  },
  {
    key: "hour_catches",
    category: ["time_and_date"],
    isOneTime: true,
    xp: 2000,
    condition: { timeWindow: 60, catchCount: 8 },
    progressBar: false,
    rarity: 5,
  },
];

export const logDetailsAchievements: IAchievementConfig[] = [
  {
    key: "add_image",
    category: ["images"],
    isOneTime: true,
    xp: 100,
    condition: { image: true },
    progressBar: false,
    rarity: 1,
  },
  {
    key: "add_comment",
    category: ["comments"],
    isOneTime: true,
    xp: 50,
    condition: { comment: true },
    progressBar: false,
    rarity: 1,
  }
];

export const miscAchievements: IAchievementConfig[] = [
  {
    key: "kahen_kilon_siika",
    category: ["size", "species"],
    isOneTime: true,
    xp: 3000,
    condition: { species: "siika", weight: 1.686 },
    progressBar: false,
    rarity: 5,
  }
];

export const allAchievements = [
  ...amountAchievements,
  ...sizeAchievements,
  ...speciesAchievements,
  ...locationAchievements,
  ...lureAchievementsConfig,
  ...timeAchievementsConfig,
  ...logDetailsAchievements,
  ...miscAchievements
];

// Lookup map for the achievement configs
export const achievementConfigMap = allAchievements.reduce<Record<string, IAchievementConfig>>(
  (map, config) => {
    map[config.key] = config;
    return map;
  },
  {}
);