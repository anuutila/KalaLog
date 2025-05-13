import { NextRequest, NextResponse } from 'next/server';
import { ErrorResponse, SignedImageURLsResponse } from '@/lib/types/responses';
import { creatorRoles, editorRoles } from '@/lib/types/user';
import { requireRole } from '@/lib/utils/authorization';
import { handleError } from '@/lib/utils/handleError';
import { generateSignedImageUrl } from '@/lib/utils/apiUtils/apiUtils';

export async function POST(req: NextRequest): Promise<NextResponse<SignedImageURLsResponse | ErrorResponse>> {
  try {
    // Check if the user is authorized
    await requireRole([...editorRoles, ...creatorRoles]);

    const { publicIds } = await req.json();
    console.log('Generating URLs for Public IDs:', publicIds);

    const signedUrls: string[] = publicIds.map((publicId: string) => generateSignedImageUrl(publicId));

    return NextResponse.json<SignedImageURLsResponse>(
      { message: 'Signed URLs generated successfully.', data: signedUrls },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleError(error, 'An unexpected error occurred while fetching the images. Please try again later.');
  }
}
