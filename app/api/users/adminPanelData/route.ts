import { authorize } from '@/lib/middleware/authorize';
import dbConnect from '@/lib/mongo/dbConnect';
import User from '@/lib/mongo/models/user';
import { AuthorizationResponse, ErrorResponse } from '@/lib/types/responses';
import { UserRole } from '@/lib/types/user';
import { CustomError } from '@/lib/utils/customError';
import { handleError } from '@/lib/utils/handleError';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();

    // Check if the user is an admin
    const response = await authorize(req, [UserRole.ADMIN]);
    if (!response.ok) {
      const errorResponse: ErrorResponse = await response.json();
      throw new CustomError(errorResponse.message, response.status);
    } else {
      const authResponse: AuthorizationResponse = await response.json();
      console.log(authResponse.message);
    }

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
