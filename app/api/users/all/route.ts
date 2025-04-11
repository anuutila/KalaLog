import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo/dbConnect';
import User from '@/lib/mongo/models/user';
import { AuthorizationResponse } from '@/lib/types/responses';
import { allRoles } from '@/lib/types/user';
import { requireRole } from '@/lib/utils/authorization';
import { handleError } from '@/lib/utils/handleError';
import { CustomError } from '@/lib/utils/customError';

export async function GET(): Promise<NextResponse> {
  try {
    await dbConnect();

    const users = await User.find({})
      .select('id firstName lastName username role') // Only fetch necessary fields
      .lean();

    if (!users) {
      throw new CustomError('No users found', 404);
    }

    const formattedUsers = users.map((user) => ({
      id: user._id?.toString(),
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }));

    console.log('Admin panel user data:', formattedUsers);

    return NextResponse.json({ message: 'Users retrieved successfully', data: { users: formattedUsers } }, { status: 200 });
  } catch (error: unknown) {
    return handleError(error, 'Unable to fetch users');
  }
}
