// File: app/api/community/[postid]/comment/[commentid]/like/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import CommunityPost from '@/models/CommunityPost';
import { getUserFromReq } from '@/utils/auth';

export async function PUT(request: NextRequest) {
  // ดึง postid และ commentid จาก pathname
  const pathname = request.nextUrl.pathname;
  const parts = pathname.split('/');
  const postid = parts[3];     // ['', 'api', 'community', 'postid', 'comment', 'commentid', 'like']
  const commentid = parts[5];

  if (!postid || !commentid) {
    return NextResponse.json({ error: 'Missing postid or commentid' }, { status: 400 });
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

    // 4A. หา comment (level-1) ก่อน
    let targetComment: any = post.comments.find((c: any) => c._id === commentid);

    // 4B. ถ้าไม่เจอใน level-1 → หาใน replies ของแต่ละ comment (level-2)
    if (!targetComment) {
      for (const c of post.comments) {
        const foundInReply = (c.replies || []).find((r: any) => r._id === commentid);
        if (foundInReply) {
          targetComment = foundInReply;
          break;
        }
      }
    }

    if (!targetComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // 5. Toggle Like: ถ้า userId มีอยู่ใน targetComment.likes → เอาออก (undo)
    //    มิฉะนั้น → push userId เข้าไป (like)
    const idx = (targetComment.likes as string[]).findIndex((x) => x === uid);
    if (idx >= 0) {
      (targetComment.likes as string[]).splice(idx, 1);
    } else {
      (targetComment.likes as string[]).push(uid);
    }

    // 6. บันทึกลง DB
    await post.save();

    // 7. ตอบกลับด้วยจำนวน likes ปัจจุบันของ comment/reply
    return NextResponse.json({ likes: targetComment.likes }, { status: 200 });
  } catch (err) {
    console.error('Error in PUT /api/community/[postid]/comment/[commentid]/like:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // ดึง postid และ commentid จาก pathname
  const pathname = request.nextUrl.pathname;
  const parts = pathname.split('/');
  const postid = parts[3];     // ['', 'api', 'community', 'postid', 'comment', 'commentid', 'like']
  const commentid = parts[5];

  if (!postid || !commentid) {
    return NextResponse.json({ error: 'Missing postid or commentid' }, { status: 400 });
  }

  try {
    await connectDB();
    const post = await CommunityPost.findById(postid);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // หา comment (level-1) ก่อน
    let targetComment: any = post.comments.find((c: any) => c._id === commentid);

    // ถ้าไม่เจอใน level-1 → หาใน replies ของแต่ละ comment (level-2)
    if (!targetComment) {
      for (const c of post.comments) {
        const foundInReply = (c.replies || []).find((r: any) => r._id === commentid);
        if (foundInReply) {
          targetComment = foundInReply;
          break;
        }
      }
    }

    if (!targetComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({ likes: targetComment.likes || [] }, { status: 200 });
  } catch (err) {
    console.error('Error in GET /api/community/[postid]/comment/[commentid]/like:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // ดึง postid และ commentid จาก pathname
  const pathname = request.nextUrl.pathname;
  const parts = pathname.split('/');
  const postid = parts[3];     // ['', 'api', 'community', 'postid', 'comment', 'commentid', 'like']
  const commentid = parts[5];

  if (!postid || !commentid) {
    return NextResponse.json({ error: 'Missing postid or commentid' }, { status: 400 });
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

    // 4A. หา comment (level-1) ก่อน
    let targetComment: any = post.comments.find((c: any) => c._id === commentid);

    // 4B. ถ้าไม่เจอใน level-1 → หาใน replies ของแต่ละ comment (level-2)
    if (!targetComment) {
      for (const c of post.comments) {
        const foundInReply = (c.replies || []).find((r: any) => r._id === commentid);
        if (foundInReply) {
          targetComment = foundInReply;
          break;
        }
      }
    }

    if (!targetComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // 5. Toggle Like: ถ้า userId มีอยู่ใน targetComment.likes → เอาออก (undo)
    //    มิฉะนั้น → push userId เข้าไป (like)
    const idx = (targetComment.likes as string[]).findIndex((x) => x === uid);
    if (idx >= 0) {
      (targetComment.likes as string[]).splice(idx, 1);
    } else {
      (targetComment.likes as string[]).push(uid);
    }

    // 6. บันทึกลง DB
    await post.save();

    // 7. ตอบกลับด้วยจำนวน likes ปัจจุบันของ comment/reply
    return NextResponse.json({ likes: targetComment.likes }, { status: 200 });
  } catch (err) {
    console.error('Error in POST /api/community/[postid]/comment/[commentid]/like:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
