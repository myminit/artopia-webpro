// /app/api/gallery/update-title/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import { Drawing } from '@/models/Drawing';
import { getUserFromReq } from '@/utils/auth';
import mongoose from 'mongoose';

export async function PATCH(req: NextRequest) {
  // 1. ตรวจ JWT
  const user = await getUserFromReq(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. อ่าน body: { id, newTitle }
  const body = await req.json();
  const id = typeof body.id === 'string' ? body.id : '';
  const newTitle = typeof body.newTitle === 'string' ? body.newTitle.trim() : '';

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  if (!newTitle) {
    return NextResponse.json({ error: 'Missing newTitle' }, { status: 400 });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  // 3. เชื่อม DB
  await connectDB();

  // 4. หา document
  const doc = await Drawing.findById(id);
  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // 5. ตรวจสิทธิ์เจ้าของ
  if (doc.userId.toString() !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 6. อัปเดตชื่อ field “name”
  doc.name = newTitle;
  await doc.save();

  // 7. ตอบกลับ
  return NextResponse.json({ id, name: doc.name }, { status: 200 });
}
