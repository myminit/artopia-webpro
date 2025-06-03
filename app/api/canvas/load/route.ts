// /app/api/canvas/load/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import { Drawing } from '@/models/Drawing';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('loadId');
  if (!id) {
    return NextResponse.json({ error: 'Missing loadId' }, { status: 400 });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid loadId' }, { status: 400 });
  }

  await connectDB();

  const doc = await Drawing.findById(id).lean();
  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // คืน imageUrl กับชื่อ (name) ให้ client โหลด
  return NextResponse.json(
    {
      imageUrl: doc.imageUrl,
      name:     doc.name,
    },
    { status: 200 }
  );
}
