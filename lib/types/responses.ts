import { IAchievement } from "./achievement";
import { ICatch } from "./catch";
import { JwtUserInfo } from "./jwtUserInfo";
import { UserRole } from "./user";

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
  failedImageOperations: boolean;
}

export type CatchEditedResponse = Required<BaseResponse<CatchEditedResponseData>>;

export interface SignUpResponseData {
  username: string;
  firstName: string;
  lastName: string;
  id: string | undefined;
  linkedCatchesCount: number;
  linkedName?: string;
}

export type SignUpResponse = Required<BaseResponse<SignUpResponseData>>;

export type LoginResponse = Required<BaseResponse<JwtUserInfo>>;

export type ImageUploadResponse = Required<BaseResponse<string>>;

export interface ImageDeletionResponseData {
  successfulDeletions: string[];
  failedDeletions: string[];
}

export type ImageDeletionResponse = Required<BaseResponse<ImageDeletionResponseData>>;

export type SignedImageURLsResponse = Required<BaseResponse<string[]>>;

export type AuthorizationResponse = Required<BaseResponse<{ role: UserRole, username: string }>>;;

export type LogoutResponse = BaseResponse;

export interface UsersByFirstNameResponseData {
  users: {
    id: string | null;
    username: string;
    firstName: string;
    lastName: string;
  }[];
}

export type UsersByFirstNameResponse = Required<BaseResponse<UsersByFirstNameResponseData>>;

export type AllAchievementsResponse = Required<BaseResponse<IAchievement[]>>;

export type UserAchievementsResponse = Required<BaseResponse<IAchievement[]>>;

export type AchievementsUpdatedResponse = Required<BaseResponse<{ count: number }>>;

export type UserCatchesLinkedResponse = Required<BaseResponse<{ count: number; linkedName: string }>>;

// Common error response type
export interface ErrorResponse {
  errorCode: string;
  message: string;
  details?: any[];
}