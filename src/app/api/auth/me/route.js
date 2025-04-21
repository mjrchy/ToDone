import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

export async function GET(req) {
  try {
    await connectDB();
    
    const authResult = await authMiddleware(req);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult;
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}