import dbConnect from '@/lib/mongo/dbConnect';
import Achievement from '@/lib/mongo/models/achievement';
import { AchievementSchema, IAchievement } from '@/lib/types/achievement';
import { ErrorResponse, UserAchievementsResponse } from '@/lib/types/responses';
import { UserRole } from '@/lib/types/user';
import { requireRole } from '@/lib/utils/authorization';
import { handleError } from '@/lib/utils/handleError';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { userId: string } }): Promise<NextResponse<UserAchievementsResponse | ErrorResponse>> {
  const { userId } = await params;
  try {
    await requireRole([UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]);
    await dbConnect();

    console.log('Fetching user achievements for user:', userId);
    const userAchievements = await Achievement.find({ userId }).lean();
    console.log(`Found ${userAchievements.length} achievements`);

    const validatedAchievements: IAchievement[] = [];

    // Validate and transform the data using Zod
    for (const achvmnt of userAchievements) {
      const parsed: IAchievement = AchievementSchema.parse({
        ...achvmnt,
        id: achvmnt._id?.toString(), // Convert MongoDB ObjectId to string
        userId: achvmnt.userId?.toString(), // Convert MongoDB ObjectId to string
      });
      validatedAchievements.push(parsed);
    }

    return NextResponse.json<UserAchievementsResponse>(
      {
        message: 'User achievements retrieved successfully.',
        data: validatedAchievements,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleError(error, 'An unexpected error occurred while fetching the user achievements. Please try again later.');
  }
}

export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = await params;
  try {
    await requireRole([UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]);
    await dbConnect();
    
    const achievements = await request.json();
    console.log(`Updating ${achievements.length} achievements for user:`, userId);
    console.log(achievements);

    const validatedAchievements: IAchievement[] = [];

    // Validate and transform the data using Zod
    for (const achvmnt of achievements) {
      const parsed: IAchievement = AchievementSchema.parse(achvmnt);
      validatedAchievements.push(parsed);
    }

    // Update the user achievements
    for (const ach of validatedAchievements) {
      await Achievement.updateOne(
        { userId, key: ach.key },
        { $set: ach },
        { upsert: true }
      );
    }

    return NextResponse.json<UserAchievementsResponse>(
      {
        message: 'User achievements updated successfully.',
        data: validatedAchievements,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleError(error, 'An unexpected error occurred while updating the user achievements. Please try again later.');
  }
}