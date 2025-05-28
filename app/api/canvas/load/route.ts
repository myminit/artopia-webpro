// /app/api/canvas/load/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import connectDB from '@/config/db';
import { Drawing } from '@/models/Drawing';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  await connectDB();
  // แปลงเป็น ObjectId ถ้าใช้จริง
  const filter = { userId: ObjectId.isValid(userId) ? new ObjectId(userId) : userId };
  const drawings = await Drawing
    .find(filter, { projection: { __v:0, image:1, name:1, createdAt:1 } })
    .sort({ createdAt: -1 })
    .limit(50);
  return NextResponse.json(drawings);
}
