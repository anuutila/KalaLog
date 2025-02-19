import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@lib/mongo/dbConnect';
import User from '@lib/mongo/models/user'; // Mongoose model
import { IUser, IUserSchema, UserRole } from '@lib/types/user'; // Zod schema
import bcrypt from 'bcryptjs';
import { handleError } from '@/lib/utils/handleError';
import { ErrorResponse, SignUpResponse } from '@/lib/types/responses';
import { CustomError } from '@/lib/utils/customError';
import { linkCatchesToUser } from '@/lib/utils/apiUtils';

export async function POST(req: NextRequest): Promise<NextResponse<SignUpResponse | ErrorResponse>> {
  try {
    await dbConnect();
    const body = await req.json();

    // Validate input with Zod
    const userData = IUserSchema.parse(body);

    // Check if the email or username is already in use
    const existingUser = await User.findOne({ $or: [{ email: userData.email }, { username: userData.username }] });
    if (existingUser) {
      throw new CustomError('Signup failed. Email or username already in use.', 400);
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create the user
    const newUser = await User.create({
      ...userData,
      role: UserRole.CREATOR, // Default role
      password: hashedPassword, // Store hashed password
    });

    if (!newUser) {
      throw new Error('Failed to create user account. Please try again later.');
    }

    const parsedUser: IUser = IUserSchema.parse({
      ...newUser.toObject(),
      id: newUser._id.toString(),
    });

    const linkingResult = await linkCatchesToUser(parsedUser);

    return NextResponse.json<SignUpResponse>(
      { 
        message: 'New user account created successfully', 
        data: {
          firstName: parsedUser.firstName, 
          lastName: parsedUser.lastName, 
          username: parsedUser.username, 
          id: parsedUser.id,
          linkedCatchesCount: linkingResult.count,
          linkedName: linkingResult.linkedName,
        } 
      }, 
      { status: 201 }
    );
  } catch (error) {
    return handleError(error, 'An unexpected error occurred while creating the user account. Please try again later.');
  }
}