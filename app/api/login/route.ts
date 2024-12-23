import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@lib/mongo/dbConnect';
import User from '@lib/mongo/models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { CustomError } from '@/lib/utils/customError';
import { handleError } from '@/lib/utils/handleError';
import { LoginResponse } from '@/lib/types/responses';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
  try {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in the environment');
    }

    await dbConnect();

    const { emailOrUsername, password } = await req.json();
    const query = {
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    };

    const user = await User.findOne(query);
    
    if (!user) {
      throw new CustomError('Invalid username/email or password', 401);
    }
    
    console.log('Found user: ', user);

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError('Invalid username/email or password', 401);
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const response = NextResponse.json<LoginResponse>({ message: 'Login successful' }, { status: 200 });

    const cookieStore = await cookies();
    cookieStore.set('token', token, { httpOnly: true, secure: true });

    return response;
  } catch (error: unknown) {
    return handleError(error, 'Failed to login');
  }
}