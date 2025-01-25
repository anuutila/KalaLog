import { authorize } from '@/lib/middleware/authorize';
import { AuthorizationResponse, ErrorResponse, SignedImageURLsResponse } from '@/lib/types/responses';
import { UserRole } from '@/lib/types/user';
import { CustomError } from '@/lib/utils/customError';
import { handleError } from '@/lib/utils/handleError';
import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary/cloudinary';

export async function POST(req: NextRequest): Promise<NextResponse<SignedImageURLsResponse | ErrorResponse>> {
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

    const { publicIds } = await req.json();
    console.log('Generating URLs for Public IDs:', publicIds);

    const signedUrls: string[] = publicIds.map((publicId: string) => generateSignedUrl(publicId));

    return NextResponse.json<SignedImageURLsResponse>({ message: 'Signed URLs generated successfully.', data: signedUrls }, { status: 200 });
  } catch (error: unknown) {
    return handleError(error, 'An unexpected error occurred while fetching the images. Please try again later.');
  }
}

function generateSignedUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    type: 'upload',
    sign_url: true,
    secure: true,
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });
}