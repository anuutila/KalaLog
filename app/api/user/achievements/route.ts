import dbConnect from '@/lib/mongo/dbConnect';
import Achievement from '@/lib/mongo/models/achievement';
import { AchievementSchema, IAchievement } from '@/lib/types/achievement';
import { AchievementsUpdatedResponse, ErrorResponse, UserAchievementsResponse } from '@/lib/types/responses';
import { UserRole } from '@/lib/types/user';
import { requireRole } from '@/lib/utils/authorization';
import { handleError } from '@/lib/utils/handleError';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse<UserAchievementsResponse | ErrorResponse>> {
  try {
    // Get the catch ID from the query string
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    console.log(searchParams);

    if (!userId) {
      throw new Error('User ID is missing.');
    }

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

export async function PUT(request: NextRequest): Promise<NextResponse<AchievementsUpdatedResponse | ErrorResponse>> {
  try {
    // Get the catch ID from the query string
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      throw new Error('User ID is missing.');
    }

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

    return NextResponse.json<AchievementsUpdatedResponse>(
      {
        message: 'User achievements updated successfully.',
        data: { count: validatedAchievements.length },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleError(error, 'An unexpected error occurred while updating the user achievements. Please try again later.');
  }
}