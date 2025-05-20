import { ApiEndpoints } from "@/lib/constants/constants";
import { httpClient } from "../httpClient";
import { BaseResponse } from "@/lib/types/responses";

export async function subscribe(sub: PushSubscription): Promise<BaseResponse> {
  return httpClient<BaseResponse>(ApiEndpoints.pushSubscription, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub),
  });
}

export async function unsubscribe(endpoint: string): Promise<BaseResponse> {
  return httpClient<BaseResponse>(ApiEndpoints.pushSubscription, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint }),
  });
}

export async function sendTestNotification(): Promise<BaseResponse> {
  return httpClient<BaseResponse>(ApiEndpoints.pushSubscriptionTest, {
    method: 'POST'
  });
}