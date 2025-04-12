import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AuthorizationResponse, ErrorResponse } from '../types/responses';
import { UserRole } from '../types/user';
import { CustomError } from '../utils/customError';
import { handleError } from '../utils/handleError';

const JWT_SECRET = process.env.JWT_SECRET as string;

// Type guard to check if a value is a UserRole
function isUserRole(role: any): role is UserRole {
  return Object.values(UserRole).includes(role);
}

export const authorize = async (
  authorizedRoles: string[]
): Promise<NextResponse<AuthorizationResponse | ErrorResponse>> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('KALALOG_TOKEN')?.value;

    if (!token) {
      throw new CustomError('Unauthorized. Missing JWT token.', 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { role: string; username: string; userid: string };

    if (!decoded.role || !isUserRole(decoded.role) || !authorizedRoles.includes(decoded.role)) {
      throw new CustomError('Authorization failed. Insufficient permissions', 403);
    }

    return NextResponse.json<AuthorizationResponse>(
      { message: 'User succesfully authorized', data: { role: decoded.role, username: decoded.username, id: decoded.userid } },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, 'Failed to authorize');
  }
};
