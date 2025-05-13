import { NextRequest, NextResponse } from 'next/server';
import { ErrorResponse, UserCatchesLinkedResponse } from '@/lib/types/responses';
import { adminRoles, IUser } from '@/lib/types/user';
import { linkCatchesToUser } from '@/lib/utils/apiUtils/apiUtils';
import { requireRole } from '@/lib/utils/authorization';
import { handleError } from '@/lib/utils/handleError';

export async function POST(req: NextRequest): Promise<NextResponse<UserCatchesLinkedResponse | ErrorResponse>> {
  try {
    await requireRole(adminRoles);

    const user: Omit<IUser, 'password' | 'email'> = await req.json();

    const linkingResult = await linkCatchesToUser(user);
    console.log('linkingResult:', linkingResult);

    return NextResponse.json<UserCatchesLinkedResponse>(
      {
        message: 'Catches linked successfully',
        data: {
          count: linkingResult.count,
          linkedName: linkingResult.linkedName,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleError(
      error,
      'An unexpected error occurred while linking the catches to the user. Please try again later.'
    );
  }
}
