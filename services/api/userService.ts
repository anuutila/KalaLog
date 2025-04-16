import { ApiEndpoints } from '@/lib/constants/constants';
import { AllUsersResponse, UserCatchesLinkedResponse, UserInfoResponse, UserProfileResponse, UsersByFirstNameResponse } from '@/lib/types/responses';
import { IUser } from '@/lib/types/user';
import { httpClient } from '../httpClient';

export async function getUserInfo(): Promise<UserInfoResponse> {
  return httpClient<UserInfoResponse>(ApiEndpoints.UserInfo);
}

export async function getUsersByFirstName(firstName: string): Promise<UsersByFirstNameResponse> {
  return httpClient<UsersByFirstNameResponse>(`${ApiEndpoints.UsersByFirstName}?firstName=${firstName}`);
}

export async function getUserProfileByUsername(username: string): Promise<UserProfileResponse> {
  const endpoint = `${ApiEndpoints.UserProfileByUsername}/${encodeURIComponent(username)}`;
  return httpClient<UserProfileResponse>(endpoint);
}

export async function getAllUsers(): Promise<AllUsersResponse> {
  return httpClient<AllUsersResponse>(ApiEndpoints.AllUsers);
}

export async function linkUserCatches(user: IUser): Promise<UserCatchesLinkedResponse> {
  return httpClient<UserCatchesLinkedResponse>(ApiEndpoints.LinkUserCatches, {
    method: 'POST',
    body: JSON.stringify(user),
  });
}
