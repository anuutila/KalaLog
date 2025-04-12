import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo/dbConnect';
import User from '@/lib/mongo/models/user';
import { AuthorizationResponse } from '@/lib/types/responses';
import { adminRoles, UserRole } from '@/lib/types/user';
import { requireRole } from '@/lib/utils/authorization';
import { handleError } from '@/lib/utils/handleError';

export async function GET(): Promise<NextResponse> {
  try {
    await dbConnect();

    // Check if the user has the required role
    const response: AuthorizationResponse = await requireRole(adminRoles);
    const { role } = response.data;

    let users: any[] = [];
    if (role === UserRole.SUPERADMIN) {
      // Fetch all users except superadmin users
      users = await User.find({ role: { $ne: UserRole.SUPERADMIN } })
        .select('id firstName lastName username role') // Only fetch necessary fields
        .lean();
    } else if (role === UserRole.ADMIN) {
      // Fetch all users except superadmin and admin users
      users = await User.find({ role: { $nin: [UserRole.SUPERADMIN, UserRole.ADMIN] } })
        .select('id firstName lastName username role')
        .lean();
    }

    const formattedUsers = users.map((user) => ({
      id: user._id?.toString(),
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }));

    // console.log('Admin panel user data:', formattedUsers);

    return NextResponse.json({ message: 'Users retrieved successfully', users: formattedUsers }, { status: 200 });
  } catch (error: unknown) {
    return handleError(error, 'Unable to fetch users');
  }
}
