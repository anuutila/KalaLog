import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { JwtUser } from '@/lib/types/jwtUser';
import { UserInfoResponse } from '@/lib/types/responses';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(req: Request): Promise<NextResponse<UserInfoResponse>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json<UserInfoResponse>({ message: 'User not logged in', data: { loggedIn: false, jwtUser: null } }, { status: 200 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtUser;
    return NextResponse.json<UserInfoResponse>({ message: 'User info fetched succesfully', data: { loggedIn: true, jwtUser: decoded } }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user jwt token:', error);
    return NextResponse.json<UserInfoResponse>({ message: 'Error fetchin user jwt token', data: { loggedIn: false, jwtUser: null } }, { status: 401 });
  }
}
