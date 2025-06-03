// /app/api/gallery/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import { Drawing } from '@/models/Drawing';
import { getUserFromReq } from '@/utils/auth';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  // 1. ตรวจสอบ JWT ก่อน
  const user = await getUserFromReq(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. ต่อ DB
  await connectDB();

  // 3. หาเฉพาะ Drawing ของ user นี้ (lean() ให้ได้ plain object)
  const docs = await Drawing
    .find(
      { userId: new mongoose.Types.ObjectId(user.id) },
      { __v: 0 } // ไม่เอา __v ออกให้เหลือทุก field ที่ต้องการ
    )
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();

  // 4. แปลง _id → string, drawingName, imageUrl, thumbnailUrl, updatedAt
  const items = (docs as any[]).map(d => ({
    _id: (d._id as mongoose.Types.ObjectId).toString(),
    name:  d.name,
    imageUrl:  d.imageUrl,
    thumbnailUrl:  d.thumbnailUrl,
    updatedAt:     d.updatedAt,
  }));

  return NextResponse.json(items, { status: 200 });
}
