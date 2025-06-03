// app/api/community/[postid]/like/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import CommunityPost    from '@/models/CommunityPost';
import { getTokenFromReq, verifyToken } from '@/utils/auth';

export async function POST(req, { params }) {
  let user;
  try {
    const token = getTokenFromReq(req);
    user = verifyToken(token);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const post = await CommunityPost.findById(params.postid);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const idx = post.likes.indexOf(user.id);
  if (idx >= 0) post.likes.splice(idx, 1);
  else post.likes.push(user.id);
  await post.save();

  return NextResponse.json({ likes: post.likes }, { status: 200 });
}
