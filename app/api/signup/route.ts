import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@lib/mongo/dbConnect';
import User from '@lib/mongo/models/user'; // Mongoose model
import { IUserSchema } from '@lib/types/user'; // Zod schema
import bcrypt from 'bcryptjs';
import { handleError } from '@/lib/utils/handleError';
import { ErrorResponse, SignUpResponse } from '@/lib/types/responses';
import { CustomError } from '@/lib/utils/customError';

export async function POST(req: NextRequest): Promise<NextResponse<SignUpResponse | ErrorResponse>> {
  try {
    await dbConnect();
    const body = await req.json();

    // Validate input with Zod
    const userData = IUserSchema.parse(body);

    // Check if the email or username is already in use
    const existingUser = await User.findOne({ $or: [{ email: userData.email }, { username: userData.username }] });
    if (existingUser) {
      throw new CustomError('Email or username already exists', 400);
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create the user
    const newUser = await User.create({
      ...userData,
      password: hashedPassword, // Store hashed password
    });

    return NextResponse.json<SignUpResponse>({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    return handleError(error, 'Signup failed');
  }
}