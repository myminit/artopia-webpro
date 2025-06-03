// /app/api/gallery/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import { Drawing } from '@/models/Drawing';
import { getUserFromReq } from '@/utils/auth';
import mongoose from 'mongoose';

export async function DELETE(req: NextRequest) {
  // 1. ตรวจ JWT
  const user = await getUserFromReq(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. ดึง drawingId จาก query params
  const drawingId = req.nextUrl.searchParams.get('drawingId') || '';
  if (!drawingId) {
    return NextResponse.json({ error: 'Missing drawingId' }, { status: 400 });
  }
  if (!mongoose.Types.ObjectId.isValid(drawingId)) {
    return NextResponse.json({ error: 'Invalid drawingId' }, { status: 400 });
  }

  // 3. เชื่อม DB
  await connectDB();

  // 4. หา document
  const doc = await Drawing.findById(drawingId);
  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // 5. ตรวจสิทธิ์เจ้าของ
  if (doc.userId.toString() !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 6. ลบ record (หากต้องการลบจาก S3 ด้วยให้เขียน logic เพิ่ม)
  await doc.deleteOne();

  return NextResponse.json({ success: true }, { status: 200 });
}
