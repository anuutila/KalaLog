import { IAchievement } from "@/lib/types/achievement";
import { AchievementsUpdatedResponse, UserAchievementsResponse } from "@/lib/types/responses";
import { httpClient } from "../httpClient";
import { ApiEndpoints } from "@/lib/constants/constants";

export async function updateAchievements(achievementsData: IAchievement[] = [], userdId: string): Promise<AchievementsUpdatedResponse> {
  return httpClient<AchievementsUpdatedResponse>(ApiEndpoints.UserAchievements.replace('[userId]', userdId), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(achievementsData),
  });
}

export async function getUserAchievements(userId: string): Promise<UserAchievementsResponse> {
  return httpClient<UserAchievementsResponse>(ApiEndpoints.UserAchievements.replace('[userId]', userId));
}

export async function getAllUserAchievements(userId: string): Promise<UserAchievementsResponse> {
  return httpClient<UserAchievementsResponse>(ApiEndpoints.UserAchievements);
}