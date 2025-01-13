import { ImageUploadResponse } from "@/lib/types/responses";
import { httpClient } from "../httpClient";
import { ApiEndpoints } from "@/lib/constants/constants";
import cloudinary from "@/lib/cloudinary/cloudinary";
import { extractFolderName, extractPublicId } from "@/lib/utils/utils";
import { error } from "console";

export async function uploadImage(imageFormData: FormData): Promise<ImageUploadResponse> {
  return httpClient<ImageUploadResponse>(ApiEndpoints.UploadImage, {
    method: 'POST',
    body: imageFormData,
  });
}


// Delete images from a Cloudinary folder and the folder itself
export async function deleteImages(imageURLs: string[], deleteFolder: boolean): Promise<{ succesfulDeletions: string[], failedDeletions: string[] }> {
  const succesfulDeletions: string[] = [];
  const failedDeletions: string[] = [];
  console.error('Deleting images from Cloudinary:', imageURLs);
    // Delete images from Cloudinary
    for (const img of imageURLs) {
      const publicId = extractPublicId(img);
      try {
        await cloudinary.uploader.destroy(publicId);
        succesfulDeletions.push(img);
      } catch (err) {
        console.error(`Failed to delete image ${publicId}:`, err);
        failedDeletions.push(img);
      }
    }
    // Delete the folder from Cloudinary
    console.log('Deleting folder from Cloudinary:', imageURLs);
    if (deleteFolder) {
      const folderName = extractFolderName(imageURLs[0]);
      try {
        await cloudinary.api.delete_folder(folderName);
        console.log(`Folder ${folderName} deleted successfully`);
      } catch (error) {
        console.error(`Failed to delete folder ${folderName}:`, error);
      }
    }

    return { succesfulDeletions, failedDeletions };
}