import { handleError } from "@/lib/utils/handleError";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    response.cookies.delete('token');
    return response;
  } catch (error: unknown) {
    return handleError(error, 'Failed to logout');
  }
}

// export async function logout() {
//   await fetch('/api/logout', { method: 'POST' });
// }