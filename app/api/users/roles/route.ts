import { authorize } from '@/lib/middleware/authorize';
import dbConnect from '@/lib/mongo/dbConnect';
import User from '@/lib/mongo/models/user';
import { AuthorizationResponse, ErrorResponse } from '@/lib/types/responses';
import { UserRole } from '@/lib/types/user';
import { CustomError } from '@/lib/utils/customError';
import { handleError } from '@/lib/utils/handleError';
import { NextRequest, NextResponse } from 'next/server';


export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();

    // Check if the user is authorized
    const response = await authorize(req, [UserRole.ADMIN]);
    if (!response.ok) {
      const errorResponse: ErrorResponse = await response.json();
      throw new CustomError(errorResponse.message, response.status);
    } else {
      const authResponse: AuthorizationResponse = await response.json();
      console.log(authResponse.message);
    }

    const body = await req.json();
    const { userId, role } = body;

    console.log('Updating user role:', userId, role);

    if (!userId || !role) {
      throw new Error('User ID and role are required');
    }

    // Validate role
    if (![UserRole.VIEWER, UserRole.EDITOR].includes(role)) {
      throw new Error('Invalid role');
    }

    // Update the user's role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return NextResponse.json({ message: 'User role updated successfully', data: updatedUser });
  } catch (error: unknown) {
    return handleError(error, 'Unable to update user role');
  }
}
