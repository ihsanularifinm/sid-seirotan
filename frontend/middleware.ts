import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  user_id: number;
  username: string;
  role: string;
}

// Define routes that are restricted by role
const roleRestrictedRoutes = {
  author: [
    '/admin/dashboard',
    '/admin/hero-sliders',
    '/admin/profile',
    '/admin/officials',
    '/admin/services',
    '/admin/potentials',
    '/admin/contacts',
    '/admin/users',
    '/admin/settings',
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Get the token from the cookies
  const token = request.cookies.get('jwt_token');

  // 2. If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // 3. Decode token to get user role
  try {
    const decoded = jwtDecode<JWTPayload>(token.value);
    const userRole = decoded.role;

    // 4. Check if author is trying to access restricted routes
    if (userRole === 'author') {
      // Check each restricted route
      for (const route of roleRestrictedRoutes.author) {
        if (pathname === route || pathname.startsWith(route + '/')) {
          // Redirect author to news page
          const url = new URL('/admin/news', request.url);
          return NextResponse.redirect(url);
        }
      }
    }

    // 5. If all checks pass, let them proceed
    return NextResponse.next();
  } catch (error) {
    // If token is invalid, redirect to login
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}

// Protect all admin routes except login and news
export const config = {
  matcher: [
    '/admin/dashboard',
    '/admin/dashboard/:path*',
    '/admin/hero-sliders',
    '/admin/hero-sliders/:path*',
    '/admin/profile',
    '/admin/profile/:path*',
    '/admin/officials',
    '/admin/officials/:path*',
    '/admin/services',
    '/admin/services/:path*',
    '/admin/potentials',
    '/admin/potentials/:path*',
    '/admin/contacts',
    '/admin/contacts/:path*',
    '/admin/users',
    '/admin/users/:path*',
    '/admin/settings',
    '/admin/settings/:path*',
  ],
};
