// /app/api/gallery/create/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/config/db';
import { Drawing } from '@/models/Drawing';
import { getUserFromReq } from '@/utils/auth';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  // 1. ตรวจ JWT
  const user = await getUserFromReq(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. อ่าน body
  const body = await req.json();
  const rawName      = typeof body.name === 'string' ? body.name.trim() : '';
  const imageUrl     = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';
  const thumbnailUrl = typeof body.thumbnailUrl === 'string' ? body.thumbnailUrl.trim() : '';

  if (!imageUrl || !thumbnailUrl) {
    return NextResponse.json({ error: 'Missing image URLs' }, { status: 400 });
  }

  // 3. เชื่อม DB
  await connectDB();

  // 4. ตั้งชื่อ default ถ้าไม่ได้ส่งมา
  const nameToSave = rawName !== '' ? rawName : 'untitled';

  // 5. สร้าง document ใน DB
  const newDrawing = await Drawing.create({
    userId:       new mongoose.Types.ObjectId(user.id),
    name:         nameToSave,
    imageUrl:     imageUrl,
    thumbnailUrl: thumbnailUrl,
  });

  // 6. ตอบกลับ
  return NextResponse.json(
    {
      id:        (newDrawing._id as mongoose.Types.ObjectId).toString(),
      name:      newDrawing.name,
      updatedAt: newDrawing.updatedAt,
    },
    { status: 201 }
  );
}
