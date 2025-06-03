// app/api/community/list/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import CommunityPost from '@/models/CommunityPost';

export async function GET() {
  await connectDB();
  const posts = await CommunityPost.find()
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json(posts);
}
