import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import connectDB from '@/config/db';
import User from '@/models/User';
import { getUserFromReq } from '@/utils/auth';

export async function POST(req: NextRequest) {
  try {
    // 1) ตรวจสอบ JWT และดึง userId
    const userPayload = await getUserFromReq(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized (no token)' }, { status: 401 });
    }
    const userId = userPayload.id;

    // 2) อ่าน formData เพื่อดึงไฟล์
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (err) {
      console.error('Failed to parse formData:', err);
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const fileRaw = formData.get('avatar');
    if (!fileRaw || !(fileRaw instanceof File)) {
      return NextResponse.json({ error: 'Missing avatar image' }, { status: 400 });
    }
    const file: File = fileRaw as File;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // 3) เตรียม S3 Client
    const REGION = process.env.AWS_REGION!;
    const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;
    const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID!;
    const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY!;

    if (!REGION || !BUCKET_NAME || !ACCESS_KEY || !SECRET_KEY) {
      console.error('Missing AWS env vars');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const s3Client = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
      },
    });

    // สร้างชื่อไฟล์ (userId + timestamp + random)
    const mimeType = file.type;
    const extParts = mimeType.split('/');
    const fileExt = extParts.length === 2 ? extParts[1] : 'png';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const baseName = `${userId}-${timestamp}-${randomStr}`;
    const keyFull = `avatars/${baseName}.${fileExt}`;

    // แปลง File → ArrayBuffer → Buffer
    const arrayBuffer = await file.arrayBuffer();
    const bufferBody = Buffer.from(arrayBuffer);

    // 4) อัปโหลดไฟล์ขึ้น S3
    let publicUrl: string;
    try {
      const uploadParams: PutObjectCommandInput = {
        Bucket: BUCKET_NAME,
        Key: keyFull,
        Body: bufferBody,
        ContentType: mimeType,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      // สร้าง public URL
      publicUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${keyFull}`;
    } catch (err) {
      console.error('S3 upload error:', err);
      return NextResponse.json({ error: 'Failed to upload to S3' }, { status: 500 });
    }

    // 5) เชื่อมต่อ MongoDB และอัพเดท User
    await connectDB();
    
    await User.findByIdAndUpdate(userId, {
      avatar: publicUrl
    });

    // 6) ตอบกลับสำเร็จ
    return NextResponse.json(
      {
        avatarUrl: publicUrl
      },
      { status: 200 }
    );

  } catch (err) {
    console.error('Unexpected error in /api/user/avatar:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 