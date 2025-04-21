// app/api/todos/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TodoList from '@/models/ToDoList';
import { authMiddleware } from '@/lib/auth';

// GET all todos for the current user
export async function GET(req) {
  try {
    await connectDB();

    const authResult = await authMiddleware(req);
        
    if (authResult instanceof NextResponse) {
        return authResult;
    }
        
    const { user } = authResult;
    
    const userId = user.id;
    const todos = await TodoList.find({ userId });
    
    return NextResponse.json({ success: true, data: todos });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST create a new todo
export async function POST(req) {
  try {
    await connectDB();
    
    const authResult = await authMiddleware(req);
        
    if (authResult instanceof NextResponse) {
        return authResult;
    }
        
    const { user } = authResult;
    
    const userId = user.id;
    const { title, description, imageList, status } = await req.json();
    
    if (!title) {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
    }
    
    const newTodo = await TodoList.create({
      title,
      description,
      userId,
      imageList: imageList || [],
      status: status || 'pending'
    });
    
    return NextResponse.json({ success: true, data: newTodo }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}