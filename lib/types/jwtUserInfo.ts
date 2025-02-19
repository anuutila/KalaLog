export interface JwtUserInfo {
  username: string;
  firstname: string;
  lastname: string;
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}