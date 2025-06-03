// /app/api/gallery/presign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getUserFromReq } from '@/utils/auth';

const REGION       = process.env.AWS_REGION!;
const BUCKET_NAME  = process.env.AWS_BUCKET_NAME!;
const ACCESS_KEY   = process.env.AWS_ACCESS_KEY_ID!;
const SECRET_KEY   = process.env.AWS_SECRET_ACCESS_KEY!;

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId:     ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

export async function POST(req: NextRequest) {
  // 1. ตรวจสอบ JWT (getUserFromReq ควรคืน { id: string, ... } หรือ null)
  const user = await getUserFromReq(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. อ่าน body เพื่อเอา `type`
  const body = await req.json();
  const type = typeof body.type === 'string' ? body.type : '';
  if (!type) {
    return NextResponse.json({ error: 'Missing type' }, { status: 400 });
  }

  // 3. รับแค่ png กับ jpeg เท่านั้น
  if (type !== 'png' && type !== 'jpeg') {
    return NextResponse.json({ error: 'Unsupported export type' }, { status: 400 });
  }

  // 4. สร้างชื่อไฟล์ไม่ให้ซ้ำ (user.id + timestamp + random)
  const timestamp    = Date.now();
  const random       = Math.random().toString(36).substring(2, 8);
  const filenameBase = `${user.id}-${timestamp}-${random}`; // เช่น “user123-1620123456789-asdf12”

  const fullKey  = `gallery/${filenameBase}.${type}`;
  const thumbKey = `gallery/${filenameBase}-thumb.${type}`;

  try {
    // 5. Gen presign URL สำหรับ full image
    const commandFull = new PutObjectCommand({
      Bucket:      BUCKET_NAME,
      Key:         fullKey,
      ContentType: type === 'jpeg' ? 'image/jpeg' : 'image/png',
    });
    const urlFull = await getSignedUrl(s3Client, commandFull, { expiresIn: 120 });

    // 6. Gen presign URL สำหรับ thumbnail
    const commandThumb = new PutObjectCommand({
      Bucket:      BUCKET_NAME,
      Key:         thumbKey,
      ContentType: type === 'jpeg' ? 'image/jpeg' : 'image/png',
    });
    const urlThumb = await getSignedUrl(s3Client, commandThumb, { expiresIn: 120 });

    // 7. ตอบกลับ presigned URLs + public URLs
    return NextResponse.json(
      {
        full: {
          presign: urlFull,
          public:  `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${fullKey}`,
        },
        thumb: {
          presign: urlThumb,
          public:  `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${thumbKey}`,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Presign error:', err);
    return NextResponse.json({ error: 'Failed to create presign URL' }, { status: 500 });
  }
}
