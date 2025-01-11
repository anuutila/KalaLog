import { LoginResponse, LogoutResponse, SignUpResponse } from "@/lib/types/responses";
import { httpClient } from "../httpClient";
import { ApiEndpoints } from "@/lib/constants/constants";

export async function signup(formData: {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<SignUpResponse> {
  return httpClient<SignUpResponse>(ApiEndpoints.Signup, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
}

export async function login(emailOrUsername: string, password: string): Promise<LoginResponse> {
  return httpClient<LoginResponse>(ApiEndpoints.Login, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrUsername, password }),
  });
}

export async function logout(): Promise<LogoutResponse> {
  return httpClient<LogoutResponse>(ApiEndpoints.Logout, {
    method: 'POST',
  });
}
