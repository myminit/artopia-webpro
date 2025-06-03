// /app/api/community/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import mongoose from 'mongoose';
import connectDB from '@/config/db';
import CommunityPost from '@/models/CommunityPost';
import User, { IUser } from '@/models/User';
import { getUserFromReq } from '@/utils/auth';

export async function POST(req: NextRequest) {
  try {
    // 1) ตรวจสอบ JWT และดึง userId, role
    const userPayload = await getUserFromReq(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized (no token)' }, { status: 401 });
    }
    const userId   = userPayload.id;
    const userRole = userPayload.role;

    // 2) อ่าน formData เพื่อดึงไฟล์ + caption
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (err) {
      console.error('Failed to parse formData:', err);
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const fileRaw = formData.get('image');
    const captionRaw = formData.get('postText') as string | null;
    const caption = captionRaw?.trim() || '';

    if (!fileRaw || !(fileRaw instanceof File) || !caption) {
      return NextResponse.json({ error: 'Missing image or caption' }, { status: 400 });
    }
    const file: File = fileRaw as File;

    // 3) เตรียม S3 Client
    const REGION      = process.env.AWS_REGION!;
    const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;
    const ACCESS_KEY  = process.env.AWS_ACCESS_KEY_ID!;
    const SECRET_KEY  = process.env.AWS_SECRET_ACCESS_KEY!;

    if (!REGION || !BUCKET_NAME || !ACCESS_KEY || !SECRET_KEY) {
      console.error('Missing AWS env vars');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const s3Client = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId:     ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
      },
    });

    // สร้างชื่อไฟล์ (userId + timestamp + random)
    const mimeType    = file.type; // เช่น image/png
    const extParts    = mimeType.split('/');
    const fileExt     = extParts.length === 2 ? extParts[1] : 'png';
    const timestamp   = Date.now();
    const randomStr   = Math.random().toString(36).substring(2, 8);
    const baseName    = `${userId}-${timestamp}-${randomStr}`;
    const keyFull     = `community/${baseName}.${fileExt}`;

    // แปลง File → ArrayBuffer → Buffer
    const arrayBuffer = await file.arrayBuffer();
    const bufferBody  = Buffer.from(arrayBuffer);

    // 4) อัปโหลดไฟล์ขึ้น S3 (ไม่ใส่ ACL)
    let publicUrl: string;
    try {
      const uploadParams: PutObjectCommandInput = {
        Bucket:      BUCKET_NAME,
        Key:         keyFull,
        Body:        bufferBody,       // Buffer ของ Node.js
        ContentType: mimeType,
        // ** ลบ ACL: 'public-read' ทิ้งไป เพราะ bucket ไม่อนุญาต ACL **
        // ACL: 'public-read',
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      // สร้าง public URL
      publicUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${keyFull}`;
    } catch (err) {
      console.error('S3 upload error:', err);
      return NextResponse.json({ error: 'Failed to upload to S3' }, { status: 500 });
    }

    // 5) เชื่อมต่อ MongoDB
    await connectDB();

    // 6) ดึงชื่อผู้ใช้จาก MongoDB (User.name)
    let userName: string;
    try {
      const userDoc = (await User.findById(userId).lean()) as IUser | null;
      userName = userDoc?.name || userRole;
    } catch (err) {
      console.error('Failed to fetch user from DB:', err);
      userName = userRole;
    }

    // 7) สร้าง CommunityPost
    const newPost = await CommunityPost.create({
      userId:       new mongoose.Types.ObjectId(userId),
      userName:     userName,
      caption:      caption,
      imageUrl:     publicUrl,
      thumbnailUrl: publicUrl,      // ถ้าจะทำ thumb จริง ๆ ให้ปรับ logic แยกส่วนอีกที
      likes:        [],
      comments:     [],
      reports:      [],
    });

    // 8) ตอบกลับสำเร็จ (201)
    return NextResponse.json(
      {
        id:           (newPost._id as mongoose.Types.ObjectId).toString(),
        imageUrl:     newPost.imageUrl,
        thumbnailUrl: newPost.thumbnailUrl,
        caption:      newPost.caption,
        userName:     newPost.userName,
        createdAt:    newPost.createdAt,
      },
      { status: 201 }
    );

  } catch (err) {
    console.error('Unexpected error in /api/community/upload:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
