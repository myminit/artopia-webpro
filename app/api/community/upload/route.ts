// app/api/community/upload/route.ts
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import formidable from 'formidable';
import fs from 'fs';
import connectDB from '@/config/db';
import CommunityPost from '@/models/CommunityPost';
import User from '@/models/User';
import { getTokenFromReq, verifyToken } from '@/utils/auth';

export const config = {
  api: {
    bodyParser: false, // ปิด built-in body parser เพื่อใช้ formidable
  },
};

export async function POST(req: Request) {
  // 1. Authenticate
  let payload;
  try {
    const token   = getTokenFromReq(req);
    payload       = verifyToken(token);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = payload.id;

  // 2. Parse form-data
  const { fields, files } = await new Promise<{
    fields: Record<string, any>;
    files: Record<string, any>;
  }>((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req as any, (err, fields, files) => {
      err ? reject(err) : resolve({ fields, files });
    });
  });

  const caption = fields.postText as string;
  const file    = files.image;
  if (!file || !caption) {
    return NextResponse.json({ error: 'Missing image or caption' }, { status: 400 });
  }

  // 3. Read file into Buffer
  const filePath = Array.isArray(file) ? file[0].filepath : file.filepath;
  const buffer   = fs.readFileSync(filePath);
  const mimeType = Array.isArray(file) ? file[0].mimetype : file.mimetype;

  // 4. Upload to S3
  const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const ts      = Date.now();
  const ext     = mimeType.split('/')[1] || 'png';
  const key     = `community/${userId}/${ts}-post.${ext}`;

  await s3.send(new PutObjectCommand({
    Bucket:      process.env.AWS_BUCKET_NAME!,
    Key:         key,
    Body:        buffer,
    ContentType: mimeType,
    ACL:         'public-read',
  }));

  const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  // 5. Load user name
  await connectDB();
  const user = await User.findById(userId);
  const userName = user?.name || 'Anonymous';

  // 6. Create CommunityPost record
  const post = await CommunityPost.create({
    userId,
    userName,
    imageUrl,
    caption,
    likes: [],
    comments: [],
    reports: [],
  });

  // 7. Respond
  return NextResponse.json(post, { status: 201 });
}
