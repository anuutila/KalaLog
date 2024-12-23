import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo/dbConnect';
import Catch from '@/lib/mongo/models/catch';
import { ICatch, ICatchSchema } from '@/lib/types/catch';
import { z } from 'zod';
import { authorize } from '@/lib/middleware/authorize';
import { UserRole } from '@/lib/types/user';
import { CatchesResponse, ErrorResponse } from '@/lib/types/responses';
import { handleError } from '@/lib/utils/handleError';

export async function GET(): Promise<NextResponse<CatchesResponse | ErrorResponse>> {
  await dbConnect();

  try {
    const catches = await Catch.find({}).lean();

    // Validate and transform the data using Zod
    const validatedCatches: ICatch[] = catches.map((catchItem) => {
      try {
        const parsed = ICatchSchema.parse({
          ...catchItem,
          id: catchItem._id?.toString(), // Convert MongoDB ObjectId to string
        });
        console.log(parsed);
        return parsed;
      } catch (error) {
        console.error('Invalid catch item:', catchItem, error);
        throw new Error('Invalid catch item'); // Optionally stop processing if there's invalid data
      }
    });

    return NextResponse.json<CatchesResponse>({ message: 'Catches retrieved successfully', data: validatedCatches}, { status: 200 });
  } catch (error: unknown) {
    return handleError(error, 'Failed to fetch catches!');
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<any>> {
  // Check if the user is authorized
  const authResponse = await authorize(req, [UserRole.ADMIN, UserRole.EDITOR]);
  if (authResponse) return authResponse; // Stop if unauthorized

  try {
    await dbConnect();
    const data: ICatch = await req.json();

    // Validate with Zod
    const validatedData = ICatchSchema.parse(data);

    // Save to MongoDB
    const newCatch = await Catch.create(validatedData);

    throw new Error('test error details'); // Optionally stop processing if there's invalid data

    return NextResponse.json(newCatch, { status: 201 });
  } catch (error: unknown) {
    return handleError(error, 'Failed to create a new catch');
  }
}