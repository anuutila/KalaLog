import dbConnect from "@/lib/mongo/dbConnect";
import Achievement from "@/lib/mongo/models/achievement";
import { AchievementSchema, IAchievement } from "@/lib/types/achievement";
import { AllAchievementsResponse, ErrorResponse } from "@/lib/types/responses";
import { allRoles } from "@/lib/types/user";
import { requireRole } from "@/lib/utils/authorization";
import { handleError } from "@/lib/utils/handleError";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<AllAchievementsResponse | ErrorResponse>> {
  try {
    await requireRole(allRoles);
    await dbConnect();

    console.log('Fetching all user achievements...');
    const achievements = await Achievement.find({}).lean();

    console.log(`Found ${achievements.length} achievements`);

    const validatedAchievements: IAchievement[] = [];

    // Validate and transform the data using Zod
    for (const achvmnt of achievements) {
      const parsed: IAchievement = AchievementSchema.parse({
        ...achvmnt,
        id: achvmnt._id?.toString(), // Convert MongoDB ObjectId to string
        userId: achvmnt.userId?.toString(), // Convert MongoDB ObjectId to string
      });
      validatedAchievements.push(parsed);
    }

    return NextResponse.json<AllAchievementsResponse>(
      {
        message: 'All user achievements retrieved successfully.',
        data: validatedAchievements,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleError(error, 'An unexpected error occurred while retrieving the catches. Please try again later.');
  }
}