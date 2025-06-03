// app/api/community/[postid]/report/route.ts
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

  const { reason, detail } = await req.json();
  if (!reason) {
    return NextResponse.json({ error: 'Missing reason' }, { status: 400 });
  }

  await connectDB();
  const report = {
    _id:       new Date().getTime().toString(),
    userId:    user.id,
    reason,
    detail,
    createdAt: new Date(),
  };
  await CommunityPost.findByIdAndUpdate(params.postid, {
    $push: { reports: report }
  });

  return NextResponse.json(report, { status: 201 });
}
