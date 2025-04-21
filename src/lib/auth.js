// File: lib/auth.js
import { SignJWT } from 'jose'; // For Edge compatibility
import jwt from 'jsonwebtoken'; // For API routes
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import User from '@/models/User';

// Generate JWT token - for server components and API routes
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Set JWT as HTTP-only cookie
export const setTokenCookie = (token, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  };
  
  res.cookies.set('token', token, cookieOptions);
};

// Parse JWT from cookies - updated to await cookies() properly
export async function getTokenFromCookies() {
  // Await the cookies() function itself
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  return token;
}

// Verify JWT token - for server components and API routes
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Get current user from token
export async function getCurrentUser() {
  try {
    const token = await getTokenFromCookies();
    
    if (!token) {
      return null;
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return null;
    }
    
    const user = await User.findById(decoded.id).select('-password');
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Auth middleware for API routes
export async function authMiddleware(req) {
  try {
    const token = await getTokenFromCookies();
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      );
    }
    
    return { user };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}