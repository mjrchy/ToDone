import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth';

export async function POST(req) {
  try {
    await connectDB();
    
    const { username, password, confirmPassword } = await req.json();
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Username already registered' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Password are not the same' },
        { status: 400 }
      );
    }
    
    // Create new user
    const user = await User.create({
      username,
      password
    });
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
      }
    });
    
    // Set JWT as HTTP-only cookie
    setTokenCookie(token, response);
    
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}