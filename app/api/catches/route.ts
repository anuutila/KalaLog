import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo/dbConnect';
import Catch from '@/lib/mongo/models/catch';
import { ICatch, ICatchSchema } from '@/lib/types/catch';
import { authorize } from '@/lib/middleware/authorize';
import { UserRole } from '@/lib/types/user';
import { AuthorizationResponse, CatchCreaetedResponse, CatchDeletedResponse, CatchesResponse, CatchUpdatedResponse, ErrorResponse } from '@/lib/types/responses';
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
        const parsed: ICatch = ICatchSchema.parse({
          ...catchItem,
          id: catchItem._id?.toString(), // Convert MongoDB ObjectId to string
          caughtBy: {
            name: catchItem.caughtBy.name,
            userId: catchItem.caughtBy.userId?.toString(),
          },
          createdBy: catchItem.createdBy?.toString(),
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

    const lastCatch = await Catch.findOne({}).sort({ catchNumber: -1 }); // Find the catch with the highest catchNumber
    const nextNumber = lastCatch ? lastCatch.toObject().catchNumber + 1 : 1;

    const data: ICatch = await req.json();
    const dataWithNumber: ICatch = { ...data, catchNumber: nextNumber };

    console.log('Creating new catch from data:', dataWithNumber);

    // Validate with Zod
    const validatedData = ICatchSchema.parse(dataWithNumber);

    // Save to MongoDB
    const newCatch = await Catch.create(validatedData);

    if (!newCatch) {
      throw new Error('Failed to create new catch entry');
    }

    console.log('New catch created:', newCatch);

    // Transform the MongoDB document to match ICatch
    const parsedNewCatch: ICatch = ICatchSchema.parse({
      ...newCatch.toObject(), // Ensure Mongoose document is converted to plain JS object
      id: newCatch._id?.toString(), // Convert MongoDB ObjectId to string
      caughtBy: {
        name: newCatch.caughtBy.name,
        userId: newCatch.caughtBy.userId?.toString() || null, // Convert ObjectId or handle nulls
      },
      createdBy: newCatch.createdBy?.toString(),
    });

    return NextResponse.json<CatchCreaetedResponse>({ message: 'New catch entry created successfully 🎣', data: parsedNewCatch }, { status: 201 });
  } catch (error: unknown) {
    return handleError(error, 'Unable to create catch entry. Please try again later.');
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse<CatchDeletedResponse | ErrorResponse>> {
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

    // Get the catch ID from the query string
    const { searchParams } = new URL(req.url);
    const catchId = searchParams.get('id');

    if (!catchId) {
      throw new Error('Catch ID missing');
    }

    console.log(`Deleting catch with ID: ${catchId}`);

    // Attempt to delete the catch
    const deletedCatch = await Catch.findByIdAndDelete(catchId);

    if (!deletedCatch) {
      throw new Error(`No catch found with ID: ${catchId}`);
    }

    // Transform the MongoDB document to match ICatch
    const parsedDeletedCatch: ICatch = ICatchSchema.parse({
      ...deletedCatch.toObject(), // Ensure Mongoose document is converted to plain JS object
      id: deletedCatch._id?.toString(), // Convert MongoDB ObjectId to string
      caughtBy: {
        name: deletedCatch.caughtBy.name,
        userId: deletedCatch.caughtBy.userId?.toString() || null, // Convert ObjectId or handle nulls
      },
      createdBy: deletedCatch.createdBy?.toString(),
    });

    return NextResponse.json<CatchDeletedResponse>({ message: 'Catch deleted successfully', data: parsedDeletedCatch }, { status: 200 });
  } catch (error: unknown) {
    return handleError(error, 'Unable to delete catch. Please try again later.');
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse<CatchUpdatedResponse | ErrorResponse>> {
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

    // Get the catch ID from the query string
    const { searchParams } = new URL(req.url);
    const catchId = searchParams.get('id');

    if (!catchId) {
      throw new Error('Catch ID missing');
    }

    // Parse the body and validate with Zod
    const body: ICatch = await req.json();

    const ICatchUpdateSchema = ICatchSchema.omit({ createdAt: true }).partial(); // CretedAt is not updatable
    const validatedData = ICatchUpdateSchema.parse(body);

    console.log(`Updating catch with ID: ${catchId}`, validatedData);

    // Update the catch in the database
    const updatedCatch = await Catch.findByIdAndUpdate(
      catchId,
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    if (!updatedCatch) {
      throw new Error(`No catch found with ID: ${catchId}`);
    }

    // Transform the MongoDB document to match ICatch
    const parsedUpdatedCatch: ICatch = ICatchSchema.parse({
      ...updatedCatch.toObject(), // Ensure Mongoose document is converted to plain JS object
      id: updatedCatch._id?.toString(), // Convert MongoDB ObjectId to string
      caughtBy: {
        name: updatedCatch.caughtBy.name,
        userId: updatedCatch.caughtBy.userId?.toString() || null, // Convert ObjectId or handle nulls
      },
      createdBy: updatedCatch.createdBy?.toString(),
    });

    console.log('Updated catch:', parsedUpdatedCatch);

    return NextResponse.json<CatchUpdatedResponse>({ message: 'Catch updated successfully', data: parsedUpdatedCatch }, { status: 200 });
  } catch (error: unknown) {
    return handleError(error, 'Unable to update catch. Please try again later.');
  }
}