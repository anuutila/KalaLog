import { ErrorResponse, SignedImageURLsResponse } from '@/lib/types/responses';
import { creatorRoles, editorRoles, UserRole } from '@/lib/types/user';
import { handleError } from '@/lib/utils/handleError';
import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary/cloudinary';
import { requireRole } from '@/lib/utils/authorization';

export async function POST(req: NextRequest): Promise<NextResponse<SignedImageURLsResponse | ErrorResponse>> {
  try {
    // Check if the user is authorized
    await requireRole([...editorRoles, ...creatorRoles]);

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