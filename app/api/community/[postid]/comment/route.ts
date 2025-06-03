// app/api/community/[postid]/comment/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import CommunityPost    from '@/models/CommunityPost';
import { getTokenFromReq, verifyToken } from '@/utils/auth';

export async function POST(req, { params }) {
  // authenticate
  let user;
  try {
    const token = getTokenFromReq(req);
    user = verifyToken(token);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { text } = await req.json();
  if (!text) {
    return NextResponse.json({ error: 'Missing text' }, { status: 400 });
  }

  await connectDB();
  const comment = {
    _id:       new Date().getTime().toString(),
    userId:    user.id,
    userName:  user.role /* หรือดึงชื่อจาก DB */,
    text,
    createdAt: new Date(),
  };
  await CommunityPost.findByIdAndUpdate(params.postid, {
    $push: { comments: comment }
  });
  return NextResponse.json(comment, { status: 201 });
}
