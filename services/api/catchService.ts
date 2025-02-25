import { ApiEndpoints } from '@/lib/constants/constants';
import { ICatch } from '@/lib/types/catch';
import {
  CatchCreaetedResponse,
  CatchDeletedResponse,
  CatchEditedResponse,
  CatchesResponse,
} from '@/lib/types/responses';
import { createCatchAndImagesFormData } from '@/lib/utils/catchUtils';
import { httpClient } from '../httpClient';

export async function getCatches(): Promise<CatchesResponse> {
  return httpClient<CatchesResponse>(ApiEndpoints.Catches);
}

export async function createCatch(
  catchData: Omit<ICatch, 'id' | 'createdAt' | 'catchNumber'>,
  imageFiles: File[] = []
): Promise<CatchCreaetedResponse> {
  const catchAndImagesformData = createCatchAndImagesFormData(catchData, imageFiles);

  return httpClient<CatchCreaetedResponse>(ApiEndpoints.Catches, {
    method: 'POST',
    body: catchAndImagesformData,
  });
}

export async function editCatch(
  catchData: Omit<ICatch, 'id' | 'createdAt'>,
  catchId: string | undefined,
  addedImages: File[],
  deletedImages: (string | undefined)[]
): Promise<CatchEditedResponse> {
  const catchAndImagesformData = createCatchAndImagesFormData(catchData, addedImages, deletedImages);
  return httpClient<CatchEditedResponse>(`${ApiEndpoints.Catches}?id=${catchId}`, {
    method: 'PUT',
    body: catchAndImagesformData,
  });
}

export async function deleteCatch(id: string | undefined): Promise<CatchDeletedResponse> {
  return httpClient<CatchDeletedResponse>(`${ApiEndpoints.Catches}?id=${id}`, {
    method: 'DELETE',
  });
}
