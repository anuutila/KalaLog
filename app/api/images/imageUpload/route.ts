import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary/cloudinary';
import { Writable } from 'stream';
import { AuthorizationResponse, ErrorResponse, ImageUploadResponse } from '@/lib/types/responses';
import { authorize } from '@/lib/middleware/authorize';
import { UserRole } from '@/lib/types/user';
import { CustomError } from '@/lib/utils/customError';
import { handleError } from '@/lib/utils/handleError';

export async function POST(req: NextRequest): Promise<NextResponse<ImageUploadResponse | ErrorResponse>> {
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

    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;
    const folder = formData.get('folder') as string | null;
    const publicId = formData.get('publicId') as string | null;
    const metadata = JSON.parse(formData.get('metadata') as string);

    if (!file || !folder || !publicId) {
      throw new CustomError('Missing file, folder, or publicId in the request', 400);
    }

    // Convert the Blob to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the Buffer to Cloudinary using a stream
    const streamPromise = () =>
      new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: publicId,
            context: {
              Species: metadata.species, 
              BodyOfWater: metadata.bodyOfWater, 
              Coordinates: metadata.coordinates || '', 
              Date: metadata.date, 
              Time: metadata.time
            },
            transformation: [
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ],
            access_mode: 'authenticated',
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        const writableStream = new Writable({
          write(chunk, encoding, callback) {
            uploadStream.write(chunk, encoding, callback);
          },
          final(callback) {
            uploadStream.end(callback);
          },
        });

        writableStream.write(buffer);
        writableStream.end();
      });

    const result = await streamPromise();

    const imageUrl: string = (result as any).secure_url;
    console.log('Image uploaded successfully:', imageUrl);

    // Return the secure URL to the client
    return NextResponse.json<ImageUploadResponse>({ message: 'Image uploaded succesfully', data: imageUrl }, {status: 201});
  } catch (error: any) {
    return handleError(error, 'An unexpected error occurred while uploading the image. Please try again later.');
    // return handleError(new CustomError('An unexpected error occurred while uploading the image. Please try again later.', 500, 'ImageUploadError'));
  }
};
