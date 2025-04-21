import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // Edge-compatible JWT library

// Utility function to verify JWT token in Edge runtime
async function verifyJWT(token) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Define which paths need authentication
  const protectedRoutes = ['/todos'];
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  
  // Define auth-only paths (login/register - redirect to dashboard if already logged in)
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some(route => path === route);
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // If path is protected and no token exists, redirect to login
  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Verify token validity (without mongoose dependency)
    const payload = await verifyJWT(token);
    
    if (!payload) {
      // If token is invalid, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set('token', '', { 
        expires: new Date(0),
        path: '/'
      });
      return response;
    }
  }
  
  // If path is auth route and token exists, redirect to dashboard
  if (isAuthRoute && token) {
    const payload = await verifyJWT(token);
    if (payload) {
      return NextResponse.redirect(new URL('/todos', request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ['/todos/:path*', '/login', '/register',]
};