import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo/dbConnect';
import Catch from '@/lib/mongo/models/catch';
import { ICatch, ICatchSchema } from '@/lib/types/catch';
import { authorize } from '@/lib/middleware/authorize';
import { UserRole } from '@/lib/types/user';
import { AuthorizationResponse, CatchCreaetedResponse, CatchDeletedResponse, CatchEditedResponse, CatchesResponse, ErrorResponse, ImageDeletionResponse, ImageUploadResponse } from '@/lib/types/responses';
import { handleError } from '@/lib/utils/handleError';
import { CustomError } from '@/lib/utils/customError';
import { deleteImages, uploadImage } from '@/services/api/imageService';
import { extractFolderName, extractNextImageIndex, extractPublicId, generateFolderName, generatePublicId } from '@/lib/utils/utils';
import { ApiEndpoints } from '@/lib/constants/constants';
import { cookies } from 'next/headers';
import cloudinary from '@/lib/cloudinary/cloudinary';

export async function GET(): Promise<NextResponse<CatchesResponse | ErrorResponse>> {
  await dbConnect();

  try {
    console.log('Fetching all catches');
    const catches = await Catch.find({}).sort({ date: -1, time: -1 }).lean(); // Sort by date and time in descending order

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
  const uploadedImages = [];

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
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

    // Fetch the last catch entry to determine the next catch number
    const lastCatch = await Catch.findOne({}).sort({ catchNumber: -1 }); // Find the catch with the highest catchNumber
    const nextCatchNumber = lastCatch ? lastCatch.toObject().catchNumber + 1 : 1;

    const catchAndImageData = await req.formData();

    const imageFiles: File[] = [];
    const catchData: Record<string, any> = {};

    for (const [key, value] of catchAndImageData.entries()) {
      if (key === 'addedImages' && value instanceof File) {
        // Collect image files
        imageFiles.push(value);
      } else if (key === 'location' && typeof value === 'string') {
        catchData.location = JSON.parse(value);
      } else if (key === 'caughtBy' && typeof value === 'string') {
        catchData.caughtBy = JSON.parse(value);
      } else {
        catchData[key] = value;
      }
    }

    // Validate using Zod schema
    const validatedFormData: ICatch = ICatchSchema.parse({
      ...catchData,
      length: catchData.length ? parseFloat(catchData.length) : null,
      weight: catchData.weight ? parseFloat(catchData.weight) : null,
      catchNumber: nextCatchNumber,
    });

    const catchMetadata = {
      species: validatedFormData.species,
      bodyOfWater: validatedFormData.location.bodyOfWater,
      coordinates: validatedFormData.location.coordinates || null,
      date: validatedFormData.date,
      time: validatedFormData.time,
    };

    // Handle image uploads
    const failedImageUploads = [];
    for (const [index, image] of imageFiles.entries()) {
      try {
        // Generate folder and public_id based on catchNumber and index
        const folderName = generateFolderName(nextCatchNumber);
        const publicId = generatePublicId(nextCatchNumber, index + 1);

        const formData = new FormData();
        formData.append('file', image);
        formData.append('folder', folderName);
        formData.append('publicId', publicId);
        formData.append('metadata', JSON.stringify(catchMetadata));

        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${apiBase}${ApiEndpoints.UploadImage}`, {
          method: 'POST',
          headers: {
            'Cookie': `token=${token}`, // Include the JWT token
          },
          body: formData,
        });

        if (response.ok) {
          // const uploadResponse: ImageUploadResponse = await response.json();
          uploadedImages.push({
            publicId: `${folderName}/${publicId}`
          });
        } else {
          throw new Error();
        }
        
      } catch (error) {
        console.error(`Failed to upload image: ${generatePublicId(nextCatchNumber, index)}`, error);
        failedImageUploads.push(image);
      }
    }

    const CatchDataWithImageIds: ICatch = { ...validatedFormData, images: uploadedImages };
    console.log('Creating new catch from data:', CatchDataWithImageIds);

    // Validate again with Zod
    const validatedCatchData = ICatchSchema.parse(CatchDataWithImageIds);

    console.log('Validated Data:', validatedCatchData);
    console.log('Image Files:', imageFiles);

    // Save to MongoDB
    const newCatch = await Catch.create(validatedCatchData);
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

    if (failedImageUploads.length > 0) {
      return NextResponse.json<CatchCreaetedResponse>(
        {
          message: `Catch created successfully, but ${failedImageUploads.length} image(s) failed to upload.`,
          data: {
            catch: parsedNewCatch,
            failedImageUploads: true,
          }
        },
        { status: 207 }
      );
    }

    return NextResponse.json<CatchCreaetedResponse>({ message: 'New catch entry created successfully 🎣', data: { catch: parsedNewCatch, failedImageUploads: false } }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error during catch creation:', error);

    // Rollback image uploads
    const publicIds = uploadedImages.map((img) => img.publicId);
    const deleteFolder = true;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${apiBase}${ApiEndpoints.DeleteImages}`, {
      method: 'POST',
      headers: {
        'Cookie': `token=${token}`, // Include the JWT token
      },
      body: JSON.stringify({ publicIds, deleteFolder }),
    });

    return handleError(error, 'Unable to create catch entry. Please try again later.');
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse<CatchDeletedResponse | ErrorResponse>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

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

    const existingCatch = await Catch.findById(catchId);
    if (!existingCatch) {
      throw new Error(`No catch found with ID: ${catchId}`);
    }

    // Handle image deletions
    const failedImgDeletions = [];
    const deletedImages: ICatch['images'] = [];
    const existingImages: ICatch['images'] = existingCatch.toObject().images ?? [];
    if (existingImages && existingImages.length > 0) {
      const deleteFolder = true;
      const publicIds = existingImages?.map((image) => image?.publicId) ?? [];
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

      const response = await fetch(
        `${apiBase}${ApiEndpoints.DeleteImages}`, {
        method: 'POST',
        headers: {
          'Cookie': `token=${token}`, // Include the JWT token
        },
        body: JSON.stringify({ publicIds, deleteFolder }),
      });

      if (response.ok) {
        const imageDeletionResponse: ImageDeletionResponse = await response.json();
        const { successfulDeletions, failedDeletions } = imageDeletionResponse.data;
        successfulDeletions.forEach(id => {
          deletedImages.push({ publicId: id });
        });
  
        failedImgDeletions.push(...failedDeletions);
      } else {
        throw new Error();
      }

      console.log(`Deleted images: ${deletedImages.map(img => img.publicId).join(', ')}`);
    }

    if (failedImgDeletions.length > 0) {
      console.log(`${failedImgDeletions.length} out of ${existingImages?.length} image(s) failed to delete.`);
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
    return handleError(error, 'An unexpected error occurred while deleting the catch. Please try again later.');
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse<CatchEditedResponse | ErrorResponse>> {
  const existingImages: { publicId: string, description?: string | null | undefined}[] = [];
  const uploadedImages: { publicId: string, description?: string | null | undefined}[] = [];
  const toBeDeletedImages: { publicId: string, description?: string | null | undefined}[] = [];
  const deletedImages: { publicId: string, description?: string | null | undefined}[] = [];
  const allImages: { publicId: string, description?: string | null | undefined}[] = [];

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
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

    const existingCatch = await Catch.findById(catchId);
    if (!existingCatch) {
      throw new Error(`No catch found with ID: ${catchId}`);
    }

    const catchAndImageData = await req.formData();

    const toBeAddedImages: File[] = [];
    const catchData: Record<string, any> = {};

    for (const [key, value] of catchAndImageData.entries()) {
      if (key === 'addedImages' && value instanceof File) {
        // Collect added image files
        toBeAddedImages.push(value);
      } else if (key === 'deletedImages' && typeof value === 'string' && value.length > 0) {
        // Collect deleted image publicIds
        toBeDeletedImages.push({ publicId: value });
      } else if (key === 'location' && typeof value === 'string') {
        catchData.location = JSON.parse(value);
      } else if (key === 'caughtBy' && typeof value === 'string') {
        catchData.caughtBy = JSON.parse(value);
      } else if (key === 'images' && typeof value === 'string') {
        catchData.images = JSON.parse(value);
      } else if (key === 'createdAt' && typeof value === 'string') {
        catchData.createdAt = new Date(value);
      } else if (key === 'catchNumber' && typeof value === 'string') {
        catchData.catchNumber = parseInt(value);
      } else {
        catchData[key] = value;
      }
    }

    // Validate using Zod schema
    const validatedFormData: ICatch = ICatchSchema.parse({
      ...catchData,
      length: catchData.length ? parseFloat(catchData.length) : null,
      weight: catchData.weight ? parseFloat(catchData.weight) : null,
    });

    existingImages.push(...(validatedFormData.images ?? []));

    const catchMetadata = {
      species: validatedFormData.species,
      bodyOfWater: validatedFormData.location.bodyOfWater,
      coordinates: validatedFormData.location.coordinates || null,
      date: validatedFormData.date,
      time: validatedFormData.time,
    };

    // Handle image deletions
    const failedImgDeletions = [];
    if (toBeDeletedImages.length > 0) {
      const deleteFolder = existingImages.length === toBeDeletedImages.length; // Delete the folder if all images are to be deleted
      const publicIds = toBeDeletedImages?.map((image) => image?.publicId) ?? [];
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

      const response = await fetch(
        `${apiBase}${ApiEndpoints.DeleteImages}`, {
        method: 'POST',
        headers: {
          'Cookie': `token=${token}`, // Include the JWT token
        },
        body: JSON.stringify({ publicIds, deleteFolder }),
      });

      if (response.ok) {
        const imageDeletionResponse: ImageDeletionResponse = await response.json();
        const { successfulDeletions, failedDeletions } = imageDeletionResponse.data;
        successfulDeletions.forEach(id => {
          deletedImages.push({ publicId: id });
        });
  
        failedImgDeletions.push(...failedDeletions);
      } else {
        throw new Error();
      }
    }

    // Handle image uploads
    const failedImageUploads = [];
    for (const [index, image] of toBeAddedImages.entries()) {
      try {
        // Generate folder and public_id based on catchNumber and index
        const folderName = generateFolderName(catchData.catchNumber);
        const publicId = generatePublicId(catchData.catchNumber, extractNextImageIndex(existingImages.map(img => img.publicId) || []) + index);

        const formData = new FormData();
        formData.append('file', image);
        formData.append('folder', folderName);
        formData.append('publicId', publicId);
        formData.append('metadata', JSON.stringify(catchMetadata));

        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${apiBase}${ApiEndpoints.UploadImage}`, {
          method: 'POST',
          headers: {
            'Cookie': `token=${token}`, // Include the JWT token
          },
          body: formData,
        });

        if (response.ok) {
          // const uploadResponse: ImageUploadResponse = await response.json();
          uploadedImages.push({
            publicId: `${folderName}/${publicId}`
          });
        } else {
          throw new Error();
        }
      } catch (error) {
        console.error(`Failed to upload image: ${generatePublicId(catchData.catchNumber, index)}`, error);
        failedImageUploads.push(image);
      }
    }

    // Combine existing and uploaded images
    allImages.push(...existingImages, ...uploadedImages);
    // Remove deleted images from the list
    allImages.splice(0, allImages.length, ...allImages.filter(img => !deletedImages.some(deleted => deleted.publicId === img.publicId)));

    const CatchDataWithImageIds: ICatch = { ...validatedFormData, images: allImages };

    const ICatchUpdateSchema = ICatchSchema.omit({ createdAt: true }).partial(); // CretedAt is not updatable
    const validatedData = ICatchUpdateSchema.parse(CatchDataWithImageIds);

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

    const messageParts: string[] = ['Catch updated, but'];
    if (failedImageUploads.length > 0) {
      messageParts.push(`${failedImageUploads.length} image(s) failed to upload.`);
    }
    if (failedImgDeletions.length > 0) {
      messageParts.push(`${failedImgDeletions.length} image(s) failed to delete.`);
    }
    const responseMessage = messageParts.join(' ');
    if (failedImageUploads.length > 0) {
      return NextResponse.json<CatchEditedResponse>(
        {
          message: responseMessage,
          data: {
            catch: parsedUpdatedCatch,
            failedImageOperations: true,
          }
        },
        { status: 207 }
      );
    }

    return NextResponse.json<CatchEditedResponse>({ message: 'Catch updated successfully', data: { catch: parsedUpdatedCatch, failedImageOperations: false }}, { status: 200 });
  } catch (error: unknown) {
    console.error('Error during catch editing:', error);

    // Rollback image uploads
    const imageIds = uploadedImages.map((img) => img.publicId);
    if (imageIds.length > 0) {
      const deleteFolder = uploadedImages.length === allImages.length; // Delete the folder if all images were newly uploaded
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${apiBase}${ApiEndpoints.DeleteImages}`, {
        method: 'POST',
        headers: {
          'Cookie': `token=${token}`, // Include the JWT token
        },
        body: JSON.stringify({ imageIds, deleteFolder }),
      });
    }

    return handleError(error, 'Unable to update catch. Please try again later.');
  }
}