// File: app/api/community/[postid]/like/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import CommunityPost from '@/models/CommunityPost';
import { getUserFromReq } from '@/utils/auth';

export async function PUT(request: NextRequest) {
  // ดึง postid จาก pathname
  const pathname = request.nextUrl.pathname;
  const postid = pathname.split('/')[3]; // ['', 'api', 'community', 'postid', 'like']

  if (!postid) {
    return NextResponse.json({ error: 'Missing postid' }, { status: 400 });
  }

  try {
    // 2. ตรวจสอบ token & ดึง userId
    const userPayload = await getUserFromReq(request);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const uid = userPayload.id;

    // 3. ต่อ DB และหาโพสต์
    await connectDB();
    const post = await CommunityPost.findById(postid);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 4. Toggle Like: หาก userId อยู่ใน post.likes แล้วก็ให้เอาออก (undo) ถ้าไม่อยู่ก็ push เข้าไป
    const idx = (post.likes as string[]).findIndex((x) => x === uid);
    if (idx >= 0) {
      (post.likes as string[]).splice(idx, 1);
    } else {
      (post.likes as string[]).push(uid);
    }

    // 5. บันทึก
    await post.save();

    // 6. ตอบกลับข้อมูล likes ปัจจุบัน (array ของ userId ทั้งหมดที่กด like)
    return NextResponse.json({ likes: post.likes }, { status: 200 });
  } catch (err) {
    console.error('Error in PUT /api/community/[postid]/like:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // ดึง postid จาก pathname
  const pathname = request.nextUrl.pathname;
  const postid = pathname.split('/')[3]; // ['', 'api', 'community', 'postid', 'like']

  if (!postid) {
    return NextResponse.json({ error: 'Missing postid' }, { status: 400 });
  }

  try {
    await connectDB();
    const post = await CommunityPost.findById(postid);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ likes: post.likes || [] }, { status: 200 });
  } catch (err) {
    console.error('Error in GET /api/community/[postid]/like:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // ดึง postid จาก pathname
  const pathname = request.nextUrl.pathname;
  const postid = pathname.split('/')[3]; // ['', 'api', 'community', 'postid', 'like']

  if (!postid) {
    return NextResponse.json({ error: 'Missing postid' }, { status: 400 });
  }

  try {
    // 2. ตรวจสอบ token & ดึง userId
    const userPayload = await getUserFromReq(request);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const uid = userPayload.id;

    // 3. ต่อ DB และหาโพสต์
    await connectDB();
    const post = await CommunityPost.findById(postid);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 4. Toggle Like: หาก userId อยู่ใน post.likes แล้วก็ให้เอาออก (undo) ถ้าไม่อยู่ก็ push เข้าไป
    const idx = (post.likes as string[]).findIndex((x) => x === uid);
    if (idx >= 0) {
      (post.likes as string[]).splice(idx, 1);
    } else {
      (post.likes as string[]).push(uid);
    }

    // 5. บันทึก
    await post.save();

    // 6. ตอบกลับข้อมูล likes ปัจจุบัน (array ของ userId ทั้งหมดที่กด like)
    return NextResponse.json({ likes: post.likes }, { status: 200 });
  } catch (err) {
    console.error('Error in POST /api/community/[postid]/like:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
