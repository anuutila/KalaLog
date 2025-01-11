import { ApiEndpoints } from "@/lib/constants/constants";
import { UserInfoResponse } from "@/lib/types/responses";
import { httpClient } from "../httpClient";

export async function getUserInfo(): Promise<UserInfoResponse> {
  return httpClient<UserInfoResponse>(ApiEndpoints.UserInfo);
}