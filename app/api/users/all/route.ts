import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo/dbConnect';
import User from '@/lib/mongo/models/user';
import { handleError } from '@/lib/utils/handleError';
import { AllUserProfilesResponse, ErrorResponse } from '@/lib/types/responses';
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
  profilePicturePublicId?: string;
  createdAt?: Date;
}

export async function GET(): Promise<NextResponse<AllUserProfilesResponse | ErrorResponse>> {

  try {
    await dbConnect();

    const allUsers = await User.find({})
      .select('_id username firstName lastName profilePicturePublicId createdAt')
      .lean() as LeanUserForPublicProfile[] | null;

    if (!allUsers || allUsers.length === 0) {
      throw new CustomError('No users found.', 404);
    }

    // Fetch Users' Achievements
    const allUserAchievements = await Achievement.find({}).lean();

    const validatedAchievements: IAchievement[] = [];

    // Validate and transform achievements using Zod
    for (const achvmnt of allUserAchievements) {
      const parsed: IAchievement = AchievementSchema.parse({
        ...achvmnt,
        id: achvmnt._id?.toString(),
        userId: achvmnt.userId?.toString(),
      });
      validatedAchievements.push(parsed);
    }

    const validatedUsers = allUsers.map(user => {
      const userAchievements = validatedAchievements.filter(achievement => achievement.userId === user._id.toString());
      const userStats = calculateUserAchievementStats(userAchievements);
      const calculatedLevel = calculateLevel(userStats.totalXP);

      const publicProfile: IPublicUserProfile = {
        id: user._id.toString(),
        username: user.username ?? '',
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        profilePicturePublicId: user.profilePicturePublicId,
        createdAt: user.createdAt,
        level: calculatedLevel,
        totalXP: userStats.totalXP,
        totalStars: userStats.totalStars,
        starsByRarity: userStats.byRarity,
        userAchievements: userAchievements ?? [],
      };

      return PublicUserProfileSchema.parse(publicProfile);
    });

    return NextResponse.json<AllUserProfilesResponse>({ message: 'All public user profiles retrieved succesfully.', data: validatedUsers });

  } catch (error) {
    return handleError(error, 'An unexpected error occurred while fetching all user profiles. Please try again later.');
  }
}