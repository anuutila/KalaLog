import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo/dbConnect';
import Catch from '@/lib/mongo/models/catch';
import { ICatch, ICatchSchema } from '@/lib/types/catch';
import { authorize } from '@/lib/middleware/authorize';
import { UserRole } from '@/lib/types/user';
import { AuthorizationResponse, CatchCreaetedResponse, CatchesResponse, ErrorResponse } from '@/lib/types/responses';
import { handleError } from '@/lib/utils/handleError';
import { CustomError } from '@/lib/utils/customError';

export async function GET(): Promise<NextResponse<CatchesResponse | ErrorResponse>> {
  await dbConnect();

  try {
    console.log('Fetching all catches');
    const catches = await Catch.find({}).lean();

    console.log(`Found ${catches.length} catches`);

    const validatedCatches: ICatch[] = [];
    const invalidCatches: unknown[] = [];

    // Validate and transform the data using Zod
    for (const catchItem of catches) {
      try {
        const parsed = ICatchSchema.parse({
          ...catchItem,
          id: catchItem._id?.toString(), // Convert MongoDB ObjectId to string
          caughtBy: {
            name: catchItem.caughtBy.name,
            userId: catchItem.caughtBy.userId?.toString(),
          },
        });
        validatedCatches.push(parsed);
      } catch (error) {
        console.error('Invalid catch item:', catchItem, error);
        invalidCatches.push({ item: catchItem, error });
      }
    }

    // Construct response message based on validation results
    const message =
      invalidCatches.length === 0
        ? 'All catches retrieved successfully.'
        : `Catches retrieved, but ${invalidCatches.length} entries failed validation and were excluded.`;

    return NextResponse.json<CatchesResponse>(
      {
        message,
        data: validatedCatches,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleError(error, 'An unexpected error occurred while retrieving the catches. Please try again later.');
  }
}


export async function POST(req: NextRequest): Promise<NextResponse<CatchCreaetedResponse | ErrorResponse>> {
  try {
    // Check if the user is authorized
    const response = await authorize(req, [UserRole.ADMIN, UserRole.EDITOR]);
    if (!response.ok) {
      const errorResponse: ErrorResponse = await response.json();
      throw new CustomError(errorResponse.message, response.status);
    } else {
      const authResponse: AuthorizationResponse = await response.json();
      console.log(authResponse.message);
    }

    await dbConnect();
    const data: ICatch = await req.json();

    console.log('Creating new catch from data:', data);

    // Validate with Zod
    const validatedData = ICatchSchema.parse(data);

    // Save to MongoDB
    const newCatch: ICatch = await Catch.create(validatedData);

    return NextResponse.json<CatchCreaetedResponse>({ message: 'New catch entry created successfully 🎣', data: newCatch }, { status: 201 });
  } catch (error: unknown) {
    return handleError(error, 'Unable to create catch entry. Please try again later.');
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse<{ message: string } | ErrorResponse>> {
  try {
    // Check if the user is authorized
    const response = await authorize(req, [UserRole.ADMIN, UserRole.EDITOR]);
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message || 'Unauthorized');
    }

    await dbConnect();

    // Get the catch ID from the query string
    const { searchParams } = new URL(req.url);
    const catchId = searchParams.get('id');

    if (!catchId) {
      throw new Error('Catch ID is required');
    }

    console.log(`Deleting catch with ID: ${catchId}`);

    // Attempt to delete the catch
    const deletedCatch = await Catch.findByIdAndDelete(catchId);

    if (!deletedCatch) {
      throw new Error(`No catch found with ID: ${catchId}`);
    }

    return NextResponse.json({ message: 'Catch entry deleted successfully 🎣' }, { status: 200 });
  } catch (error: unknown) {
    return handleError(error, 'Unable to delete catch entry. Please try again later.');
  }
}