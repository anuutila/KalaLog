export interface JwtUserInfo {
  username: string;
  firstname: string;
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}