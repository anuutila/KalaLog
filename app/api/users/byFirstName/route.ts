import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo/dbConnect';
import User from '@/lib/mongo/models/user';
import { ErrorResponse, UsersByFirstNameResponse } from '@/lib/types/responses';
import { editorRoles } from '@/lib/types/user';
import { requireRole } from '@/lib/utils/authorization';
import { handleError } from '@/lib/utils/handleError';

export async function GET(req: NextRequest): Promise<NextResponse<UsersByFirstNameResponse | ErrorResponse>> {
  try {
    await dbConnect();

    // Check if the user is authorized
    await requireRole(editorRoles);

    // Extract the firstName query parameter
    const { searchParams } = new URL(req.url);
    const firstName = searchParams.get('firstName')?.trim();

    if (!firstName) {
      throw new Error('Missing "firstName" query parameter');
    }

    // Find users matching the first name (excluding admin users)
    const users = await User.find({
      firstName: new RegExp(`^${firstName}$`, 'i'), // Case-insensitive exact match
    })
      .select('_id username firstName lastName') // Fetch only relevant fields
      .lean();

    // Format the users for the frontend
    const formattedUsers = users.map((user) => ({
      id: user._id?.toString() ?? null, // Convert ObjectId to string
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    }));

    return NextResponse.json<UsersByFirstNameResponse>(
      { message: 'Users retrieved successfully', data: { users: formattedUsers } },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleError(error, 'An unexpected error occurred while fetching users. Please try again later.');
  }
}
