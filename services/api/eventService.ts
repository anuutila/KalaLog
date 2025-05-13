import { ApiEndpoints } from '@/lib/constants/constants';
import { CreateEventData, IEvent } from '@/lib/types/event';
import { httpClient } from '../httpClient'; // Assuming you have this service
import { EventCreatedResponse, EventsResponse } from '@/lib/types/responses';
import { createEventAndImagesFormData } from '@/lib/utils/eventUtils';

export async function getEvents(): Promise<EventsResponse> {
  return httpClient<EventsResponse>(ApiEndpoints.Events);
}

export async function createEvent(
  eventData: CreateEventData,
  imageFiles: File[] = [],
  imageMetadata: { coverImage: boolean; publicAccess: boolean; }[] = []
): Promise<EventCreatedResponse> {
  const eventAndImagesformData = createEventAndImagesFormData(eventData, imageFiles, imageMetadata);

  return httpClient<EventCreatedResponse>(ApiEndpoints.Events, {
    method: 'POST',
    body: eventAndImagesformData,
  });
}