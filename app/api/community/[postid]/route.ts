// app/api/community/[postid]/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import CommunityPost    from '@/models/CommunityPost';

export async function GET(_, { params }) {
  await connectDB();
  const post = await CommunityPost.findById(params.postid).lean();
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(post);
}
