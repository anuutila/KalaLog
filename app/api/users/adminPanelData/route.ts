import dbConnect from '@/lib/mongo/dbConnect';
import User from '@/lib/mongo/models/user';
import { UserRole } from '@/lib/types/user';
import { requireRole } from '@/lib/utils/authorization';
import { handleError } from '@/lib/utils/handleError';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();

    // Check if the user is an admin
    await requireRole([UserRole.ADMIN]);

    // Fetch all users except admin users
    const users = await User.find({ role: { $ne: UserRole.ADMIN } })
      .select('id firstName username role') // Only fetch necessary fields
      .lean();

    const formattedUsers = users.map((user) => ({
      id: user._id?.toString(),
      username: user.username,
      firstName: user.firstName,
      role: user.role,
    }));

    return NextResponse.json(
      { message: 'Users retrieved successfully', users: formattedUsers },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleError(error, 'Unable to fetch users');
  }
}
