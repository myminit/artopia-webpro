import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import User from '@/models/User';
import { getSession } from '@/utils/auth';

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    
    // Validate required fields
    if (!data) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    const updateData: any = {};
    
    // Only update fields that are provided
    if (data.name) updateData.name = data.name;
    if (data.bio) updateData.bio = data.bio;
    if (data.avatar) updateData.avatar = data.avatar;
    
    // If password is provided, update it
    if (data.password && data.password.length >= 6) {
      updateData.password = data.password;
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true, select: '-password' }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 