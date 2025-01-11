import { ImageUploadResponse } from "@/lib/types/responses";
import { httpClient } from "../httpClient";
import { ApiEndpoints } from "@/lib/constants/constants";
import cloudinary from "@/lib/cloudinary/cloudinary";
import { extractFolderName, extractPublicId } from "@/lib/utils/utils";

export async function uploadImage(imageFormData: FormData): Promise<ImageUploadResponse> {
  return httpClient<ImageUploadResponse>(ApiEndpoints.UploadImage, {
    method: 'POST',
    body: imageFormData,
  });
}


// Delete images from a Cloudinary folder and the folder itself
export async function deleteImages(imageURLs: string[]): Promise<void> {
  console.error('Rolling back image uploads:', imageURLs);
    // Rollback: Delete all uploaded images from Cloudinary
    for (const img of imageURLs) {
      const publicId = extractPublicId(img);
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (rollbackError) {
        console.error(`Failed to rollback image ${publicId}:`, rollbackError);
      }
    }
    // Rollback: Delete the folder if it's empty
    console.log('Rolling back folder:', imageURLs);
    if (imageURLs.length > 0) {
      const folderName = extractFolderName(imageURLs[0]);
      try {
        await cloudinary.api.delete_folder(folderName);
        console.log(`Folder ${folderName} deleted successfully`);
      } catch (error) {
        console.error(`Failed to delete folder ${folderName}:`, error);
      }
    }
}