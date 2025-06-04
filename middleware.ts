import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const currentPath = request.nextUrl.pathname;
  
  // Define authentication pages
  const authPages = ['/login', '/signup', '/admin/signup', '/reset-password', '/set-password'];
  
  // Check if the current path is an auth page
  const isAuthPage = authPages.some(page => currentPath.startsWith(page));
  
  // If it's an auth page and user has token, redirect to dashboard
  if (isAuthPage && token) {
    try {
      // Verify token is valid
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
      await jwtVerify(token, secret);
      
      // Get referrer URL if it exists
      const referer = request.headers.get('referer');
      
      // If there's a valid referer
      if (referer) {
        try {
          const refererUrl = new URL(referer);
          const hostUrl = new URL(request.url);
          
          // Only redirect to referer if it's from the same origin and not another auth page
          if (
            refererUrl.origin === hostUrl.origin && // Same website
            !authPages.some(page => refererUrl.pathname.startsWith(page)) && // Not another auth page
            refererUrl.pathname !== currentPath // Not the same page
          ) {
            return NextResponse.redirect(new URL(refererUrl.pathname + refererUrl.search, request.url));
          }
        } catch (e) {
          console.error('Error parsing referer URL:', e);
        }
      }
      
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      // Token is invalid, allow access to auth pages
      return NextResponse.next();
    }
  }
  
  // Protect dashboard routes
  if (currentPath.startsWith('/dashboard')) {
    // Store original URL for redirection after login
    const returnUrl = currentPath + request.nextUrl.search;
    
    if (!token) {
      // No token, redirect to login
      return NextResponse.redirect(new URL(`/login?returnUrl=${encodeURIComponent(returnUrl)}`, request.url));
    }
    
    try {
      // Verify token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
      await jwtVerify(token, secret);
      
      // Token valid, allow access to dashboard
      return NextResponse.next();
    } catch (error) {
      // Token invalid, redirect to login
      console.error('Token validation error:', error);
      return NextResponse.redirect(new URL(`/login?error=auth_error&returnUrl=${encodeURIComponent(returnUrl)}`, request.url));
    }
  }
  
  // All other routes proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    // Auth pages to check
    '/login',
    '/signup',
    '/admin/signup',
    '/reset-password',
    '/set-password/:path*'
  ]
};