import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/middleware/authorize';
import { UserRole } from '@/lib/types/user';

export async function GET(req: NextRequest) {

  // Check if the user is authorized
  const authResponse = await authorize(req, [UserRole.ADMIN, UserRole.EDITOR]);
  if (authResponse) return authResponse; // Stop if unauthorized
  
  return NextResponse.json({ message: 'Protected content' }, { status: 200 });
}