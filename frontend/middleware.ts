import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // 1. Get the token from the cookies
  const token = request.cookies.get('jwt_token');

  // 2. If no token and the user is trying to access a protected route, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // 3. If there is a token, let them proceed
  // (In a real app, you'd also verify the token is valid here)
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/admin/dashboard/:path*', // Protect all routes under /admin/dashboard
};
