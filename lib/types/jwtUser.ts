export interface JwtUser {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}