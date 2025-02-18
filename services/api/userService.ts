import { ApiEndpoints } from "@/lib/constants/constants";
import { UserCatchesLinkedResponse, UserInfoResponse, UsersByFirstNameResponse } from "@/lib/types/responses";
import { httpClient } from "../httpClient";
import { IUser } from "@/lib/types/user";

export async function getUserInfo(): Promise<UserInfoResponse> {
  return httpClient<UserInfoResponse>(ApiEndpoints.UserInfo);
}

export async function getUsersByFirstName(firstName: string): Promise<UsersByFirstNameResponse> {
  return httpClient<UsersByFirstNameResponse>(`${ApiEndpoints.UsersByFirstName}?firstName=${firstName}`);
}

export async function linkUserCatches(user: IUser): Promise<UserCatchesLinkedResponse> {
  return httpClient<UserCatchesLinkedResponse>(ApiEndpoints.LinkUserCatches, {
    method: "POST",
    body: JSON.stringify(user),
  });
}