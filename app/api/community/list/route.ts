// File: app/api/community/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import CommunityPost from '@/models/CommunityPost';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const posts = await CommunityPost.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(posts, { status: 200 });
  } catch (err) {
    console.error('Error in /api/community/list:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
