import { ApiEndpoints } from '@/lib/constants/constants';
import { IAchievement } from '@/lib/types/achievement';
import { AchievementsUpdatedResponse, UserAchievementsResponse } from '@/lib/types/responses';
import { httpClient } from '../httpClient';

export async function updateAchievements(
  achievementsData: IAchievement[] = [],
  userId: string
): Promise<AchievementsUpdatedResponse> {
  return httpClient<AchievementsUpdatedResponse>(`${ApiEndpoints.UserAchievements}?userId=${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(achievementsData),
  });
}

export async function getUserAchievements(userId: string): Promise<UserAchievementsResponse> {
  return httpClient<UserAchievementsResponse>(`${ApiEndpoints.UserAchievements}?userId=${userId}`);
}

export async function getUserAchievementsByUsername(username: string): Promise<UserAchievementsResponse> {
  const endpoint = `/api/users/byUsername/${encodeURIComponent(username)}/achievements`;
  return httpClient<UserAchievementsResponse>(endpoint);
}

export async function getAllUserAchievements(): Promise<UserAchievementsResponse> {
  return httpClient<UserAchievementsResponse>(ApiEndpoints.Achievements);
}
