import { ApiEndpoints } from '@/lib/constants/constants';
import { ImageDeletionResponse, ImageUploadResponse, SignedImageURLsResponse } from '@/lib/types/responses';
import { httpClient } from '../httpClient';

export async function uploadCatchImage(imageFormData: FormData): Promise<ImageUploadResponse> {
  return httpClient<ImageUploadResponse>(ApiEndpoints.UploadCatchImage, {
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
