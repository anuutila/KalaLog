import { UserRole } from "./user";

export interface JwtUserInfo {
  username: string;
  firstname: string;
  lastname: string;
  userId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}