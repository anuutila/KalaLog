import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo/dbConnect';
import User from '@/lib/mongo/models/user';
import Achievement from '@/lib/mongo/models/achievement';
import { IAchievement, AchievementSchema } from '@/lib/types/achievement';
import { ErrorResponse, UserAchievementsResponse } from '@/lib/types/responses';
import { handleError } from '@/lib/utils/handleError';
import { CustomError } from '@/lib/utils/customError';

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }): Promise<NextResponse<UserAchievementsResponse | ErrorResponse>> {
  const { username } = await params;

  try {
    await dbConnect();

    if (!username) {
      throw new CustomError('Username parameter is required.', 400);
    }

    const user = await User.findOne({ username: username }).select('_id').lean() as { _id: string } | null;
    if (!user) {
      throw new CustomError('User not found.', 404);
    }

    const userId = user._id;

    // Find Achievements by userId
    console.log(`Workspaceing achievements for userId: ${userId} (username: ${username})`);
    const userAchievements = await Achievement.find({ userId: userId }).lean();
    console.log(`Found ${userAchievements.length} achievements`);

    // Validate and Transform data
    const validatedAchievements: IAchievement[] = userAchievements.map(achvmnt => {
      const parsedData = {
        ...achvmnt,
        id: achvmnt._id?.toString(),
        userId: achvmnt.userId?.toString(),
      };
      return AchievementSchema.parse(parsedData);
    });

    return NextResponse.json<UserAchievementsResponse>({ message: 'User achievements retrieved successfully.', data: validatedAchievements });

  } catch (error: unknown) {
    return handleError(error, `An unexpected error occurred while fetching achievements fo user: ${username}. Please try again later.`);
  }
}