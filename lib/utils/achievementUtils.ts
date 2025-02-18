import { achievementEvaluators } from "@/achievements/achievementEvaluators";
import { IAchievement } from "../types/achievement";
import { ICatch } from "../types/catch";
import { achievementConfigMap } from "@/achievements/achievementConfigs";
import { getUserAchievements, updateAchievements } from "@/services/api/achievementService";
import { handleApiError } from "./handleApiError";
import { AchievementsUpdatedResponse, UserAchievementsResponse } from "../types/responses";

export async function recalculateUserAchievements(userId: string, catches: ICatch[]) {
  const userCatches = catches.filter(c => c.caughtBy.userId === userId);

  try {
    const UserAchievementsResponse: UserAchievementsResponse = await getUserAchievements(userId);
    const currentAchievements = UserAchievementsResponse.data;

    // Loop over evaluators
    const updates: IAchievement[] = [];
    for (const evaluator of achievementEvaluators) {
      const config = achievementConfigMap[evaluator.key];
      const currentAchievement = currentAchievements.find(a => a.key === evaluator.key);
      const update = evaluator.evaluate(userCatches, config, userId, currentAchievement);
      if (update) {
        updates.push(update);
      }
    }

    const updateResponse: AchievementsUpdatedResponse = await updateAchievements(updates, userId);
    console.log(updateResponse.message);
  } catch (error) {
    handleApiError(error, 'achievement updating');
  }
}
