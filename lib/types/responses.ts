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

export interface CatchCreatedResponseData {
  catch: ICatch;
  failedImageUploads: boolean;
}

export type CatchCreaetedResponse = Required<BaseResponse<CatchCreatedResponseData>>;

export type CatchDeletedResponse = Required<BaseResponse<ICatch>>;

export interface CatchEditedResponseData {
  catch: ICatch;
  failedImageUploads: boolean;
}

export type CatchEditedResponse = Required<BaseResponse<CatchEditedResponseData>>;

export type SignUpResponse = BaseResponse;

export type LoginResponse = Required<BaseResponse<JwtUserInfo>>;

export type ImageUploadResponse = Required<BaseResponse<string>>;

export type AuthorizationResponse = BaseResponse;

export type LogoutResponse = BaseResponse;

// Common error response type
export interface ErrorResponse {
  errorCode: string;
  message: string;
  details?: any[];
}