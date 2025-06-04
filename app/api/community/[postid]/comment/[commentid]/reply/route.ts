// File: app/api/community/[postid]/comment/[commentid]/reply/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import CommunityPost from '@/models/CommunityPost';
import User, { IUser } from '@/models/User';
import { getUserFromReq } from '@/utils/auth';

interface Reply {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: Date;
  likes: string[];
  reports: any[];
}

export async function POST(request: NextRequest) {
  // ดึง postid และ commentid จาก pathname
  const pathname = request.nextUrl.pathname;
  const parts = pathname.split('/');
  const postid = parts[3];     // ['', 'api', 'community', 'postid', 'comment', 'commentid', 'reply']
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

    // 3. อ่าน body → { text: string }
    const body = await request.json();
    const textRaw = typeof body.text === 'string' ? body.text.trim() : '';
    if (!textRaw) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    // 4. ต่อ DB และหาโพสต์
    await connectDB();
    const post = await CommunityPost.findById(postid);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 5. หา parentComment (level-1) ที่จะต้องเอา reply เข้าซ่อนอยู่ใต้ comment นั้น
    let parentComment: any = post.comments.find((c: any) => c._id === commentid);
    if (!parentComment) {
      return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
    }

    // 6. หา userName และ avatar จาก DB (fallback ใช้ role หากหาไม่เจอ)
    let userName: string;
    let userAvatar: string | undefined;
    try {
      const userDoc = (await User.findById(uid).select('name avatar').lean()) as IUser | null;
      userName = userDoc?.name || userPayload.role;
      userAvatar = userDoc?.avatar;
    } catch (e) {
      console.error('Failed to fetch user from DB:', e);
      userName = userPayload.role;
    }

    // 7. สร้าง object reply (level-2)
    const replyObj: Reply = {
      _id:       new Date().getTime().toString(),
      userId:    uid,
      userName:  userName,
      userAvatar: userAvatar,
      text:      textRaw,
      createdAt: new Date(),
      likes:     [],
      reports:   []
    };

    // 8. push reply ลงใน parentComment.replies แล้วบันทึก
    parentComment.replies.push(replyObj);
    await post.save();

    // 9. ตอบกลับ object reply พร้อม status 201
    return NextResponse.json(replyObj, { status: 201 });
  } catch (err) {
    console.error(
      'Error in POST /api/community/[postid]/comment/[commentid]/reply:',
      err
    );
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Add GET endpoint to update user information for replies
export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const parts = pathname.split('/');
  const postid = parts[3];
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

    const comment = post.comments.find((c: any) => c._id === commentid);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Update user information for all replies
    const replies = comment.replies || [];
    let hasUpdates = false;

    for (const reply of replies) {
      const user = await User.findById(reply.userId).select('name avatar').lean() as IUser | null;
      if (user) {
        // ตรวจสอบการเปลี่ยนแปลงของ avatar
        if (user.avatar !== reply.userAvatar) {
          // ลบ avatar เก่าออกก่อน
          reply.userAvatar = undefined;
          // อัพเดท avatar ใหม่
          reply.userAvatar = user.avatar || '';
          hasUpdates = true;
        }

        // ตรวจสอบการเปลี่ยนแปลงของ username
        if (user.name !== reply.userName) {
          reply.userName = user.name || '';
          hasUpdates = true;
        }
      }
    }

    // Save changes if any updates were made
    if (hasUpdates) {
      await post.save();
    }

    return NextResponse.json({ replies }, { status: 200 });
  } catch (err) {
    console.error('Error in GET /api/community/[postid]/comment/[commentid]/reply:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
