import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

// List of public routes
const publicRoutes = ['/login', '/signup', '/test', '/catches'];

export function middleware(req: any) {
  // // Allow public routes to pass through without authentication
  // if (publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
  //   return NextResponse.next();
  // }

  // const token = req.cookies.get('token');

  // if (!token) {
  //   return NextResponse.json({ error: 'Unauthorizeddd' }, { status: 401 });
  // }

  // try {
  //   const decoded = jwt.verify(token, JWT_SECRET);
  //   req.user = decoded; // Attach user data to the request
  //   return NextResponse.next(); // Allow the request to proceed
  // } catch (error) {
  //   return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  // }
}
