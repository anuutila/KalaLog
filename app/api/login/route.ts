import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@lib/mongo/dbConnect';
import User from '@lib/mongo/models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JwtUserInfo } from '@/lib/types/jwtUserInfo';
import { ErrorResponse, LoginResponse } from '@/lib/types/responses';
import { IUser, IUserSchema, UserRole } from '@/lib/types/user';
import { CustomError } from '@/lib/utils/customError';
import { handleError } from '@/lib/utils/handleError';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest): Promise<NextResponse<LoginResponse | ErrorResponse>> {
  try {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in the environment');
    }

    await dbConnect();

    const { emailOrUsername, password } = await req.json();
    const query = {
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    };

    const user = await User.findOne(query).lean<{ _id: unknown } & IUser>();

    if (!user) {
      throw new CustomError('Login failed. Invalid username/email or password.', 401);
    }

    console.log('Found user:', user);

    let validatedUser: IUser;
    // Validate and transform the data using Zod
    try {
      validatedUser = IUserSchema.parse({ ...user, id: user._id?.toString() });
    } catch (error) {
      console.error('Invalid user:', user, error);
      throw new Error('Login failed. Invalid user data.');
    }

    console.log('Validated user: ', validatedUser);

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, validatedUser.password);
    if (!isPasswordValid) {
      throw new CustomError('Login failed. Invalid username/email or password.', 401);
    }

    const jwtUserInfo: JwtUserInfo = {
      username: validatedUser.username,
      firstname: validatedUser.firstName,
      lastname: validatedUser.lastName,
      userId: validatedUser.id || '',
      role: validatedUser.role || UserRole.VIEWER,
    };

    // Generate JWT
    const token = jwt.sign(jwtUserInfo, JWT_SECRET, { expiresIn: '7d' });

    const response = NextResponse.json<LoginResponse>(
      { message: `Login successful. Hi ${validatedUser.firstName}! 👋`, data: jwtUserInfo },
      { status: 200 }
    );

    const cookieStore = await cookies();
    cookieStore.set('KALALOG_TOKEN', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    return response;
  } catch (error: unknown) {
    return handleError(error, 'An unexpected error occurred while logging in. Please try again later.');
  }
}
