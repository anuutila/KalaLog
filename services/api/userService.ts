import { ApiEndpoints } from "@/lib/constants/constants";
import { UserInfoResponse, UsersByFirstNameResponse } from "@/lib/types/responses";
import { httpClient } from "../httpClient";

export async function getUserInfo(): Promise<UserInfoResponse> {
  return httpClient<UserInfoResponse>(ApiEndpoints.UserInfo);
}

export async function getUsersByFirstName(firstName: string): Promise<UsersByFirstNameResponse> {
  return httpClient<UsersByFirstNameResponse>(`${ApiEndpoints.UsersByFirstName}?firstName=${firstName}`);
}