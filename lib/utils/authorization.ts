import { authorize } from "../middleware/authorize";
import { AuthorizationResponse, ErrorResponse } from "../types/responses";
import { UserRole } from "../types/user";
import { CustomError } from "./customError";

export const requireRole = async (roles: UserRole[]): Promise<AuthorizationResponse> => {
  const response = await authorize(roles);

  if (!response.ok) {
    const errorResponse: ErrorResponse = await response.json();
    throw new CustomError(errorResponse.message, response.status);
  }

  const authResponse: AuthorizationResponse = await response.json();
  console.log(authResponse.message);
  return authResponse;
};