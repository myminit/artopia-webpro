// File: app/api/community/[postid]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import CommunityPost from '@/models/CommunityPost';
import User from '@/models/User';

interface Post {
  _id: string;
  userId: string;
  userAvatar?: string;
  userName?: string;
  [key: string]: any;
}

interface UserData {
  _id: string;
  avatar?: string;
  name?: string;
}

export async function GET(request: NextRequest) {
  // ดึง postid จาก pathname
  const pathname = request.nextUrl.pathname;
  const postid = pathname.split('/').pop();

  if (!postid) {
    return NextResponse.json({ error: 'Missing postid' }, { status: 400 });
  }

  try {
    await connectDB();
    // ไม่ใช้ lean() เพื่อให้สามารถ save ได้
    const post = await CommunityPost.findById(postid);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Populate user data (avatar and name)
    const user = await User.findById(post.userId).select('avatar name').lean() as UserData;
    if (user) {
      let hasUpdates = false;

      // ตรวจสอบการเปลี่ยนแปลงของ avatar
      if (user.avatar !== post.userAvatar) {
        // ลบ avatar เก่าออกก่อน
        post.userAvatar = undefined;
        // อัพเดท avatar ใหม่
        post.userAvatar = user.avatar || '';
        hasUpdates = true;
      }

      // ตรวจสอบการเปลี่ยนแปลงของ username
      if (user.name !== post.userName) {
        post.userName = user.name || '';
        hasUpdates = true;
      }

      // บันทึกการเปลี่ยนแปลงถ้ามี
      if (hasUpdates) {
        await post.save();
      }
    }

    // แปลงเป็น plain object ก่อนส่งกลับ
    const postObject = post.toObject();
    return NextResponse.json(postObject, { status: 200 });
  } catch (err) {
    console.error('Error in GET /api/community/[postid]:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
