import { ICatch } from "./catch";
import { JwtUserInfo } from "./jwtUserInfo";

// Common response type
export interface BaseResponse<T = undefined> {
  message: string; // Common to all responses
  data?: T; // Optional data specific to the response
}

export type UserInfoResponse = Required<BaseResponse<{
  loggedIn: boolean;
  jwtUserInfo: JwtUserInfo | null;
}>>;

export type CatchesResponse = Required<BaseResponse<ICatch[]>>;

export type CatchCreaetedResponse = Required<BaseResponse<ICatch>>;

export type CatchDeletedResponse = Required<BaseResponse<ICatch>>;

export type CatchUpdatedResponse = Required<BaseResponse<ICatch>>;

export type SignUpResponse = BaseResponse;

export type LoginResponse = Required<BaseResponse<JwtUserInfo>>;

export type AuthorizationResponse = BaseResponse;

export type LogoutResponse = BaseResponse;

// Common error response type
export interface ErrorResponse {
  error: string;
  message: string;
  details?: any[];
  statusCode?: number;
}