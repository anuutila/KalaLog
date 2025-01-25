import { ErrorResponse, LogoutResponse } from "@/lib/types/responses";
import { handleError } from "@/lib/utils/handleError";
import { NextResponse } from "next/server";

export async function POST(): Promise<NextResponse<LogoutResponse | ErrorResponse>> {
  try {
    const response = NextResponse.json<LogoutResponse>({ message: 'Logged out successfully.' }, { status: 200 });
    response.cookies.delete('token');
    return response;
  } catch (error: unknown) {
    return handleError(error, 'An unexpected error occurred while logging out. Please try again later.');
  }
}