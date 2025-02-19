import cloudinary from "@/lib/cloudinary/cloudinary";
import { ErrorResponse, ImageDeletionResponse } from "@/lib/types/responses";
import { creatorRoles, editorRoles, UserRole } from "@/lib/types/user";
import { requireRole } from "@/lib/utils/authorization";
import { handleError } from "@/lib/utils/handleError";
import { extractFolderName } from "@/lib/utils/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse<ImageDeletionResponse | ErrorResponse>> {
  try {
    // Check if the user is authorized
    await requireRole([...editorRoles, ...creatorRoles]);

    const { publicIds, deleteFolder } = await req.json();

    const successfulDeletions: string[] = [];
    const failedDeletions: string[] = [];
    console.error('Deleting images from Cloudinary:', publicIds);

    // Delete images from Cloudinary
    for (const publicId of publicIds) {
      try {
        await cloudinary.uploader.destroy(publicId);
        successfulDeletions.push(publicId);
      } catch (err) {
        console.error(`Failed to delete image ${publicId}:`, err);
        failedDeletions.push(publicId);
      }
    }
    // Delete the folder from Cloudinary
    if (deleteFolder) {
      const folderName = extractFolderName(publicIds[0]);
      console.log('Deleting folder from Cloudinary:', folderName);
      try {
        await cloudinary.api.delete_folder(folderName);
        console.log(`Folder ${folderName} deleted successfully`);
      } catch (error) {
        console.error(`Failed to delete folder ${folderName}:`, error);
      }
    }

    return NextResponse.json<ImageDeletionResponse>({ message: 'Images deleted successfully.', data: { successfulDeletions, failedDeletions } }, { status: 200 });
  } catch (error: unknown) {
    return handleError(error, 'An unexpected error occurred while deleting the images. Please try again later.');
  }
}