import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AuthorizationResponse, ErrorResponse } from '../../types/responses';
import { trustedRoles, UserRole } from '../../types/user';
import { CustomError } from '../customError';
import { handleError } from '../handleError';
import { JwtUserInfo } from '../../types/jwtUserInfo';

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

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { role: string; username: string; userId: string };

    if (!decoded.role || !isUserRole(decoded.role) || !authorizedRoles.includes(decoded.role)) {
      throw new CustomError('Authorization failed. Insufficient permissions', 403);
    }

    return NextResponse.json<AuthorizationResponse>(
      { message: 'User succesfully authorized', data: { role: decoded.role, username: decoded.username, id: decoded.userId } },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, 'Failed to authorize');
  }
};



export interface AuthStatus {
  isAuthenticated: boolean;
  userInfo: JwtUserInfo | null;
  error?: string;
}

export async function getAuthStatus(): Promise<AuthStatus> {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined in the environment for getAuthStatus.');
    return { isAuthenticated: false, userInfo: null, error: 'JWT_SECRET_NOT_CONFIGURED' };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('KALALOG_TOKEN')?.value;

    if (!token) {
      return { isAuthenticated: false, userInfo: null };
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & JwtUserInfo;

    if (!decoded.userId || !decoded.username || !decoded.role || !isUserRole(decoded.role)) {
      console.warn('Decoded JWT token is missing essential fields or has invalid role.');
      return { isAuthenticated: false, userInfo: null, error: 'INVALID_TOKEN_STRUCTURE' };
    }

    // Return the decoded user info if valid
    return {
      isAuthenticated: true,
      userInfo: {
        userId: decoded.userId,
        username: decoded.username,
        firstname: decoded.firstname,
        lastname: decoded.lastname,
        role: decoded.role,
      },
    };

  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      console.log('Auth status check: Token expired.');
    } else if (error.name === 'JsonWebTokenError') {
      console.log('Auth status check: Invalid token signature or format.');
    } else {
      console.error('Auth status check: Error verifying token:', error.message);
    }
    return { isAuthenticated: false, userInfo: null, error: error.name || 'TOKEN_VERIFICATION_FAILED' };
  }
}

export function userIsAllowedToViewImage(authStatus: AuthStatus, creatorUserId: string): boolean {
  return authStatus.isAuthenticated
    && (
      (authStatus.userInfo?.role && trustedRoles.includes(authStatus.userInfo.role))
      || authStatus.userInfo?.userId === creatorUserId
    );
}