// File: app/api/community/[postid]/comment/[commentid]/report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import CommunityPost from '@/models/CommunityPost';
import { getUserFromReq } from '@/utils/auth';

export async function POST(request: NextRequest) {
  // ดึง postid และ commentid จาก pathname
  const pathname = request.nextUrl.pathname;
  const parts = pathname.split('/');
  const postid = parts[3];     // ['', 'api', 'community', 'postid', 'comment', 'commentid', 'report']
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

    // 3. อ่าน body → { reason: string, detail?: string }
    const body = await request.json();
    const { reason, detail } = body;
    if (!reason || typeof reason !== 'string') {
      return NextResponse.json({ error: 'Missing reason' }, { status: 400 });
    }
    const reasonTrim = reason.trim();
    const detailTrim = typeof detail === 'string' ? detail.trim() : '';

    // 4. ต่อ DB และหาโพสต์
    await connectDB();
    const post = await CommunityPost.findById(postid);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 5A. หา comment (level-1) ก่อน
    let targetComment: any = post.comments.find((c: any) => c._id === commentid);

    // 5B. ถ้าไม่เจอ → หาใน replies (level-2)
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

    // 6. สร้าง object report สำหรับ comment/reply แล้ว push ลงใน targetComment.reports
    const reportObj = {
      _id:       new Date().getTime().toString(),
      userId:    uid,
      reason:    reasonTrim,
      detail:    detailTrim,
      createdAt: new Date()
    };
    targetComment.reports.push(reportObj);

    // 7. บันทึกลง DB
    await post.save();

    // 8. ตอบกลับ report object พร้อม status 201
    return NextResponse.json(reportObj, { status: 201 });
  } catch (err) {
    console.error(
      'Error in POST /api/community/[postid]/comment/[commentid]/report:',
      err
    );
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
