import { IAchievement } from "@/lib/types/achievement";

export const mockedUserAchievements: IAchievement[] = [
  {
    id: "64a1c0d8e1234567890abcdef", 
    userId: "64a1bfc0e1234567890abcde1", 
    key: "tiny_catch",
    progress: 1,
    isOneTime: true,
    totalXP: 500,
    dateUnlocked: new Date("2023-11-15T09:30:00.000Z"),
    unlocked: true
  },
  {
    id: "64a1c0d8e1234567890abcdef", 
    userId: "64a1bfc0e1234567890abcde1", 
    key: "four_seasons",
    progress: 2,
    isOneTime: true,
    totalXP: 500,
    unlocked: false
  },
  {
    id: "64a1c0d8e1234567890abcdef", 
    userId: "64a1bfc0e1234567890abcde1", 
    key: "add_comment",
    progress: 1,
    isOneTime: true,
    totalXP: 500,
    dateUnlocked: new Date("2023-11-15T09:30:00.000Z"),
    unlocked: true
  },
  {
    id: "64a1c0d8e1234567sdfabcdf0",
    userId: "64a1bfc0e1234567890abcde1",
    key: "weight_catch",
    progress: 11,
    isOneTime: false,
    unlocked: true,
    totalXP: 2050,
    currentTier: 5,
    tiers: [
      { tier: 1, dateUnlocked: new Date("2023-10-01T10:00:00.000Z") },
      { tier: 2, dateUnlocked: new Date("2023-10-05T10:00:00.000Z") },
      { tier: 3, dateUnlocked: new Date("2023-10-10T10:00:00.000Z") },
      { tier: 4, dateUnlocked: new Date("2023-10-15T10:00:00.000Z") }
    ],
  },
  {
    id: "64a1c0d8e1234567sdfabcdf0",
    userId: "64a1bfc0e1234567890abcde1",
    key: "species_amount",
    progress: 6,
    isOneTime: false,
    totalXP: 2050,
    currentTier: 3,
    tiers: [
      { tier: 1, dateUnlocked: new Date("2023-10-01T10:00:00.000Z") },
      { tier: 2, dateUnlocked: new Date("2023-10-05T10:00:00.000Z") },
      { tier: 3, dateUnlocked: new Date("2023-10-10T10:00:00.000Z") },
      { tier: 4, dateUnlocked: new Date("2023-10-15T10:00:00.000Z") }
    ],
    unlocked: true
  },
  {
    id: "64a1c0d8e1234567890abcdef",
    userId: "64a1bfc0e1234567890abcde1",
    key: "total_catches",
    progress: 477,
    isOneTime: false,
    currentTier: 5,
    totalXP: 3000,
    tiers: [
      { 
        tier: 1,
        dateUnlocked: new Date("2023-06-01T12:00:00Z"), 
        bonus: false 
      },
      { 
        tier: 2,
        dateUnlocked: new Date("2023-06-10T12:00:00Z"), 
        bonus: false 
      },
      { 
        tier: 3,
        dateUnlocked: new Date("2023-06-20T12:00:00Z"), 
        bonus: false 
      },
      { 
        tier: 4,
        dateUnlocked: new Date("2023-07-01T12:00:00Z"), 
        bonus: false 
      },
      { 
        tier: 5,
        dateUnlocked: new Date("2023-07-10T12:00:00Z"), 
        bonus: false 
      }
    ],
    unlocked: true
  },
  {
    id: "64a1c0d8e1234567sdfabcdf0",
    userId: "64a1bfc0e1234567890abcde1",
    key: "zander_amount",
    progress: 6,
    isOneTime: false,
    totalXP: 300,
    currentTier: 2,
    tiers: [
      { tier: 1, dateUnlocked: new Date("2023-10-01T10:00:00.000Z") },
      { tier: 2, dateUnlocked: new Date("2023-10-05T10:00:00.000Z") }
    ],
    unlocked: true
  },
  {
    id: "64a1c0d8e1234567sdfabcdf0",
    userId: "64a1bfc0e1234567890abcde1",
    key: "perch_amount",
    progress: 55,
    isOneTime: false,
    totalXP: 300,
    currentTier: 4,
    tiers: [
      { tier: 1, dateUnlocked: new Date("2023-10-01T10:00:00.000Z") },
      { tier: 2, dateUnlocked: new Date("2023-10-05T10:00:00.000Z") }
    ],
    unlocked: true
  },
];