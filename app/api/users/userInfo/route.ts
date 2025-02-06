import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { JwtUserInfo } from '@/lib/types/jwtUserInfo';
import { UserInfoResponse } from '@/lib/types/responses';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(req: Request): Promise<NextResponse<UserInfoResponse>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('KALALOG_TOKEN')?.value;
    if (!token) {
      return NextResponse.json<UserInfoResponse>({ message: 'User not logged in', data: { loggedIn: false, jwtUserInfo: null } }, { status: 200 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtUserInfo;
    return NextResponse.json<UserInfoResponse>({ message: 'User info fetched succesfully', data: { loggedIn: true, jwtUserInfo: decoded } }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user jwt token:', error);
    return NextResponse.json<UserInfoResponse>({ 
      message: 'An unexpected error occurred while fetching user info. Please try again later.', 
      data: { loggedIn: false, jwtUserInfo: null } }, 
      { status: 500 }
    );
  }
}
