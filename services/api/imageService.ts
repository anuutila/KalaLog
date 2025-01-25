import { ImageDeletionResponse, ImageUploadResponse, SignedImageURLsResponse } from "@/lib/types/responses";
import { httpClient } from "../httpClient";
import { ApiEndpoints } from "@/lib/constants/constants";

export async function uploadImage(imageFormData: FormData): Promise<ImageUploadResponse> {
  return httpClient<ImageUploadResponse>(ApiEndpoints.UploadImage, {
    method: 'POST',
    body: imageFormData,
  });
}

export async function getSignedImageURLs(publicIds: string[]): Promise<SignedImageURLsResponse> {
  return httpClient<SignedImageURLsResponse>(ApiEndpoints.SignedImageURLs, {
    method: 'POST',
    body: JSON.stringify({ publicIds }),
  });
}

export async function deleteImages(publicIds: string[], deleteFolder: boolean): Promise<ImageDeletionResponse> {
  return httpClient<ImageDeletionResponse>(ApiEndpoints.DeleteImages, {
    method: 'POST',
    body: JSON.stringify({ publicIds, deleteFolder }),
  });
}