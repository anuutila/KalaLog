import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo/dbConnect';
import User from '@/lib/mongo/models/user';
import { handleError } from '@/lib/utils/handleError';
import { ErrorResponse, UserProfileResponse } from '@/lib/types/responses';
import { IPublicUserProfile, PublicUserProfileSchema } from '@/lib/types/user';
import { Types } from 'mongoose';
import { CustomError } from '@/lib/utils/customError';
import Achievement from '@/lib/mongo/models/achievement';
import { AchievementSchema, IAchievement } from '@/lib/types/achievement';
import { calculateUserAchievementStats } from '@/lib/utils/achievementUtils';
import { calculateLevel } from '@/lib/utils/levelUtils';

interface LeanUserForPublicProfile {
  _id: Types.ObjectId;
  username?: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  createdAt?: Date;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }): Promise<NextResponse<UserProfileResponse | ErrorResponse>> {
  const { username } = await params;

  try {
    await dbConnect();

    if (!username) {
      throw new CustomError('Username parameter is required.', 400);
    }

    console.log(`Workspaceing public profile for username: ${username}`);

    // Find user
    const user = await User.findOne({ username: username })
      .select('_id username firstName lastName profilePictureUrl createdAt')
      .lean() as LeanUserForPublicProfile | null;

    if (!user) {
      throw new CustomError('User not found.', 404);
    }

    // Fetch User's Achievements
    const userAchievements = await Achievement.find({ userId: user._id }).lean();

    const validatedAchievements: IAchievement[] = [];

    // Validate and transform achievements using Zod
    for (const achvmnt of userAchievements) {
      const parsed: IAchievement = AchievementSchema.parse({
        ...achvmnt,
        id: achvmnt._id?.toString(),
        userId: achvmnt.userId?.toString(),
      });
      validatedAchievements.push(parsed);
    }

    const userStats = calculateUserAchievementStats(validatedAchievements);
    const calculatedLevel = calculateLevel(userStats.totalXP);

    const publicProfile: IPublicUserProfile = {
      id: user._id.toString(),
      username: user.username ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      profilePictureUrl: user.profilePictureUrl,
      createdAt: user.createdAt,
      level: calculatedLevel,
      totalXP: userStats.totalStars,
      totalStars: userStats.totalStars,
      starsByRarity: userStats.byRarity,
    };

    const validatedProfile = PublicUserProfileSchema.parse(publicProfile);

    return NextResponse.json<UserProfileResponse>({ message: 'Public user profile information retrieved succesfully.', data: validatedProfile });

  } catch (error) {
    return handleError(error, 'An unexpected error occurred while fetching the user profile. Please try again later.');
  }
}