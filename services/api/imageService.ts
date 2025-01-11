import { ImageUploadResponse } from "@/lib/types/responses";
import { httpClient } from "../httpClient";
import { ApiEndpoints } from "@/lib/constants/constants";

export async function uploadImage(imageFormData: FormData): Promise<ImageUploadResponse> {
  return httpClient<ImageUploadResponse>(ApiEndpoints.UploadImage, {
    method: 'POST',
    body: imageFormData,
  });
}