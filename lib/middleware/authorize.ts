import { NextRequest, NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { AuthorizationResponse, ErrorResponse } from '../types/responses';
import { handleError } from '../utils/handleError';
import { CustomError } from '../utils/customError';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authorize = async (req: NextRequest, authorizedRoles: string[]): Promise<NextResponse<AuthorizationResponse | ErrorResponse>> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new CustomError('Unauthorized. Missing token.', 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { role: string };

    if (!decoded.role || !authorizedRoles.includes(decoded.role)) {
      throw new CustomError('Forbidden: Insufficient permissions', 403);
    }

    // req.user = decoded;
    return NextResponse.json<AuthorizationResponse>({ message: 'User succesfully authorized' }, { status: 200 });
  } catch (error) {
    return handleError(error, 'Failed to authorize');
  }
};