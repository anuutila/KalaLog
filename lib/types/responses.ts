import { ICatch } from "./catch";
import { JwtUser } from "./jwtUser";

// Common response type
export interface BaseResponse<T = undefined> {
  message: string; // Common to all responses
  data?: T; // Optional data specific to the response
}

export type UserInfoResponse = Required<BaseResponse<{
  loggedIn: boolean;
  jwtUser: JwtUser | null;
}>>;

export type CatchesResponse = Required<BaseResponse<ICatch[]>>;

export type SignUpResponse = BaseResponse;

export type LoginResponse = BaseResponse;


// Common error response type
export interface ErrorResponse {
  error: string;
  message: string;
  details?: any[];
  statusCode?: number;
}