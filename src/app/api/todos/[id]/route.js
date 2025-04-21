import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TodoList from '@/models/ToDoList';
import { authMiddleware } from '@/lib/auth';
import mongoose from 'mongoose';

// Helper function to verify todo ownership
async function verifyTodoOwnership(todoId, userId) {
  if (!mongoose.Types.ObjectId.isValid(todoId)) {
    return { error: 'Invalid todo ID', status: 400 };
  }
  
  const todo = await TodoList.findOne({ _id: todoId, userId });
  if (!todo) {
    return { error: 'Todo not found or not authorized', status: 404 };
  }
  
  return { todo };
}

// GET a single todo by ID
export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const authResult = await authMiddleware(req);
        
    if (authResult instanceof NextResponse) {
        return authResult;
    }
        
    const { user } = authResult;
    
    const userId = user.id;
    
    const { id } = await params;
    const { todo, error, status } = await verifyTodoOwnership(id, userId);
    
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status });
    }
    
    return NextResponse.json({ success: true, data: todo });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT update a todo by ID
export async function PUT(req, { params }) {
  try {
    await connectDB();
    
    const authResult = await authMiddleware(req);
        
    if (authResult instanceof NextResponse) {
        return authResult;
    }
        
    const { user } = authResult;
    
    const userId = user.id;
    
    const { id } = await params;
    const { todo, error, status } = await verifyTodoOwnership(id, userId);
    
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status });
    }
    
    const updates = await req.json();
    const allowedUpdates = ['title', 'description', 'imageList', 'status'];
    
    // Filter out non-allowed fields
    Object.keys(updates).forEach(key => {
      if (!allowedUpdates.includes(key)) {
        delete updates[key];
      }
    });
    
    // Update the todo
    const updatedTodo = await TodoList.findByIdAndUpdate(
      id, 
      { ...updates, updatedAt: Date.now() }, 
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ success: true, data: updatedTodo });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE a todo by ID
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    
    const authResult = await authMiddleware(req);
        
    if (authResult instanceof NextResponse) {
        return authResult;
    }
        
    const { user } = authResult;
    
    const userId = user.id;
    
    const { id } = await params;
    const { todo, error, status } = await verifyTodoOwnership(id, userId);
    
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status });
    }
    
    await TodoList.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true, message: 'Todo deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}