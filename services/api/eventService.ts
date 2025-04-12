import { ApiEndpoints } from '@/lib/constants/constants';
import { CreateEventData, IEvent } from '@/lib/types/event';
import { httpClient } from '../httpClient'; // Assuming you have this service
import { EventCreatedResponse, EventsResponse } from '@/lib/types/responses';

export async function getEvents(): Promise<EventsResponse> {
  return httpClient<EventsResponse>(ApiEndpoints.Events);
}

export async function createEvent(eventData: CreateEventData): Promise<EventCreatedResponse> {
  return httpClient<EventCreatedResponse>(ApiEndpoints.Events, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
}