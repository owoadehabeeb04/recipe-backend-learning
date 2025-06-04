import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route patterns that should be protected
const PROTECTED_ROUTES = [
  '/dashboard',
  '/dashboard/meal-planner',
  // Add other protected routes
];

// Paths that should remain public
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/auth/login',
  '/auth/register',
  '/about',
  '/terms',
  '/privacy',
  '/api/', // API routes should be handled separately with their own auth
  '/_next', // Next.js assets
  '/favicon.ico',
];

export function middleware(request: NextRequest) {
  return NextResponse.next();
}
// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//   console.log({ pathname });
  
//   // Check if the path should be protected
//   const isProtectedRoute = PROTECTED_ROUTES.some(route => 
//     pathname === route || pathname.startsWith(`${route}/`)
//   );
  
//   // Check if the path is explicitly public
//   const isPublicRoute = PUBLIC_ROUTES.some(route => 
//     pathname === route || pathname.startsWith(route)
//   );
  
//   // If the route isn't protected or is public, allow access
//   if (!isProtectedRoute || isPublicRoute) {
//     return NextResponse.next();
//   }
  
//   // Check for authentication token in cookies
//   const authToken = request.cookies.get('auth_token')?.value;
  
//   // If no token found, redirect to login
//   if (!authToken) {
//     console.log('No auth token found in cookies, redirecting to login');
//     const url = new URL('/login', request.url);
//     url.searchParams.set('returnTo', pathname);
//     return NextResponse.redirect(url);
//   }
  
//   // User has a token, proceed to the protected route
//   return NextResponse.next();
// }

export const config = {
  matcher: [
    // Apply to all routes except API routes, static files, etc.
    '/((?!api|_next/static|_next/image|assets|favicon.ico).*)',
  ],
};